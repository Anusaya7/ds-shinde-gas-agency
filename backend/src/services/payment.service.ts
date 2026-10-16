import { PaymentMethod, PaymentStatus, OrderStatus, NotificationType } from '../constants/enums.js';
import prisma from '../config/database.js';
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from '../utils/payment.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';
import config from '../config/index.js';
import { NotificationService } from './notification.service.js';
import { recordAuditLog } from './audit.service.js';

export interface VerifyPaymentDTO {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export class PaymentService {
  /**
   * Create a Razorpay order for an existing pending Order
   */
  static async createRazorpayOrderForOrder(orderId: string, customerId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (customerId && order.customerId !== customerId) {
      throw new ForbiddenError('You cannot create payment for another customer’s order.');
    }

    const payableStatuses: OrderStatus[] = [
      OrderStatus.ACCEPTED,
      OrderStatus.RIDER_ASSIGNED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.ARRIVED,
      OrderStatus.OTP_PENDING,
    ];
    if (!payableStatuses.some((status) => status === order.status)) {
      throw new BadRequestError('Payment is available only after the booking is approved by the agency.');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestError('This order is already marked as paid');
    }
    if (config.razorpay.keyId.includes('placeholder') || config.razorpay.keySecret.includes('placeholder')) {
      throw new BadRequestError('Online payments are not configured. Please contact the agency for payment options.');
    }

    const amountInRupees = Number(order.totalAmount);
    const receipt = `RCP-${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;

    const razorpayOrder = await createRazorpayOrder({
      amountInRupees,
      receipt,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
      },
    });

    // Create or update Payment record
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: order.id, status: PaymentStatus.PENDING },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          razorpayOrderId: razorpayOrder.id,
          amount: order.totalAmount,
          method: PaymentMethod.ONLINE,
          status: PaymentStatus.PENDING,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          method: PaymentMethod.ONLINE,
          status: PaymentStatus.PENDING,
          razorpayOrderId: razorpayOrder.id,
        },
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: PaymentMethod.ONLINE,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: Math.round(amountInRupees * 100),
      currency: 'INR',
      keyId: config.razorpay.keyId,
      customerName: order.deliveryName,
      customerPhone: order.deliveryPhone,
    };
  }

  /**
   * Verify Razorpay payment signature and mark order paid
   */
  static async verifyPayment(dto: VerifyPaymentDTO, userId: string) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = dto;

    const isValid = verifyRazorpayPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      throw new BadRequestError('Invalid payment signature. Payment verification failed.');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }
    if (order.customerId !== userId) {
      throw new ForbiddenError('You cannot confirm payment for another customer’s order.');
    }

    const pendingPayment = await prisma.payment.findFirst({
      where: { orderId: order.id, razorpayOrderId, status: PaymentStatus.PENDING },
    });
    if (!pendingPayment) {
      throw new BadRequestError('This payment order is not pending for this booking.');
    }

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: pendingPayment.id },
        data: {
          status: PaymentStatus.PAID,
          razorpayPaymentId,
          razorpaySignature,
          verifiedAt: new Date(),
        },
      });

      // Update Order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.ONLINE,
        },
      });

      // Add status history note if needed
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: order.status,
          note: `Online payment received via Razorpay (Txn ID: ${razorpayPaymentId})`,
          changedById: userId,
        },
      });
      await recordAuditLog(tx, {
        userId,
        action: 'PAYMENT_SUCCESS',
        entity: 'Order',
        entityId: order.id,
        details: `Verified online payment for ${order.orderNumber}.`,
      });

      return { payment, order: updatedOrder };
    });

    // Send notifications
    await NotificationService.createNotification({
      userId: order.customerId,
      title: 'Payment Successful',
      message: `Payment of ₹${order.totalAmount} for order ${order.orderNumber} was confirmed.`,
      type: NotificationType.PAYMENT,
      orderId: order.id,
    });

    await NotificationService.notifyAdmins({
      title: 'Payment Received',
      message: `Payment of ₹${order.totalAmount} received for order ${order.orderNumber}.`,
      type: NotificationType.PAYMENT,
      orderId: order.id,
    });

    return result;
  }

  static async markPaymentFailed(orderId: string, razorpayOrderId: string, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order not found.');
    if (order.customerId !== userId) {
      throw new ForbiddenError('You cannot update payment for another customer’s order.');
    }

    const payment = await prisma.payment.findFirst({
      where: { orderId, razorpayOrderId, status: PaymentStatus.PENDING },
    });
    if (!payment) throw new BadRequestError('This payment attempt is not pending.');

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      await recordAuditLog(tx, {
        userId,
        action: 'PAYMENT_FAILED',
        entity: 'Order',
        entityId: order.id,
        details: `Online payment failed for ${order.orderNumber}.`,
      });
    });
    await NotificationService.createNotification({
      userId,
      title: 'Payment not completed',
      message: `Payment for booking ${order.orderNumber} was not completed. You can retry through your dashboard.`,
      type: NotificationType.PAYMENT,
      orderId,
    });
    return { status: PaymentStatus.FAILED };
  }

  /**
   * Handle incoming Razorpay Webhook
   */
  static async handleWebhook(rawBody: string, signature: string) {
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new BadRequestError('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const payment = await prisma.payment.findFirst({
          where: { razorpayOrderId },
          include: { order: true },
        });

        if (payment && payment.status !== PaymentStatus.PAID) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.PAID,
                razorpayPaymentId,
                verifiedAt: new Date(),
              },
            }),
            prisma.order.update({
              where: { id: payment.orderId },
              data: {
                paymentStatus: PaymentStatus.PAID,
              },
            }),
          ]);
        }
      }
    }

    return { received: true };
  }

  /**
   * Record COD cash collection by rider
   */
  static async recordCodPayment(params: {
    orderId: string;
    riderUserId: string;
    amount?: number;
    transactionId?: string;
  }) {
    const { orderId, riderUserId, transactionId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestError('This order is already marked as paid');
    }

    const collectedAmount = params.amount !== undefined ? params.amount : Number(order.totalAmount);
    if (Math.abs(collectedAmount - Number(order.totalAmount)) > 0.01) {
      throw new BadRequestError('The collected amount must match the order total.');
    }

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: collectedAmount,
          method: PaymentMethod.COD,
          status: PaymentStatus.PAID,
          collectedById: riderUserId,
          transactionId: transactionId || `COD-${Date.now()}`,
          verifiedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.COD,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: order.status,
          note: `Cash on Delivery of ₹${collectedAmount} collected by rider`,
          changedById: riderUserId,
        },
      });

      return createdPayment;
    });

    await NotificationService.createNotification({
      userId: order.customerId,
      title: 'Payment Received',
      message: `COD payment of ₹${collectedAmount} for order ${order.orderNumber} collected.`,
      type: NotificationType.PAYMENT,
      orderId: order.id,
    });

    return payment;
  }
}
