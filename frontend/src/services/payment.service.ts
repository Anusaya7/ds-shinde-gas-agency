import api from './api';

export interface RazorpayOrderResponse {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export type RazorpayCheckoutResult = 'paid' | 'failed' | 'dismissed';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const paymentService = {
  async createRazorpayOrder(orderId: string): Promise<RazorpayOrderResponse> {
    const res = await api.post<{ success: boolean; data: RazorpayOrderResponse }>(
      '/payments/create-razorpay-order',
      { orderId }
    );
    return res.data.data;
  },

  async verifyPayment(data: VerifyPaymentPayload): Promise<{ success: boolean; message: string }> {
    const res = await api.post<{ success: boolean; message: string }>('/payments/verify', data);
    return res.data;
  },

  async markPaymentFailed(orderId: string, razorpayOrderId: string): Promise<void> {
    await api.post('/payments/failed', { orderId, razorpayOrderId });
  },

  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  async openCheckout(order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
  }): Promise<RazorpayCheckoutResult> {
    const scriptLoaded = await this.loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error('Secure checkout could not be loaded. Please try again later.');
    }

    const gatewayOrder = await this.createRazorpayOrder(order.id);
    const key = gatewayOrder.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency || 'INR',
        name: 'DS Shinde Gas',
        description: `Cylinder booking ${order.orderNumber}`,
        order_id: gatewayOrder.razorpayOrderId,
        prefill: {
          name: gatewayOrder.customerName || order.customerName,
          contact: gatewayOrder.customerPhone || order.customerPhone,
          email: gatewayOrder.customerEmail || order.customerEmail || '',
        },
        notes: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
        theme: { color: '#10284A' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await this.verifyPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve('paid');
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => resolve('dismissed'),
        },
      });

      checkout.on('payment.failed', async (response: any) => {
        try {
          await this.markPaymentFailed(
            order.id,
            response.error?.metadata?.order_id || gatewayOrder.razorpayOrderId
          );
          resolve('failed');
        } catch (error) {
          reject(error);
        }
      });

      checkout.open();
    });
  },
};
