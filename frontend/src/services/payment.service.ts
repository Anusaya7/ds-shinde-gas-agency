import api from './api';

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

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
};
