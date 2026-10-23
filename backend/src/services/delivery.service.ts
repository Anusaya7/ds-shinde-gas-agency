import { OrderStatus, PaymentStatus, NotificationType } from '../constants/enums.js';
import prisma from '../config/database.js';
import config from '../config/index.js';
import { generateOtp, hashOtp, verifyOtpHash } from '../utils/otp.js';
import { sendSms } from '../utils/sms.js';
import { sendEmail } from '../utils/email.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { NotificationService } from './notification.service.js';

export class DeliveryService {
  /**
   * Helper to ensure rider owns order or is admin
   */
  private static async getRiderAndOrder(orderId: string, riderUserId: string) {
    const rider = await prisma.rider.findUnique({
      where: { userId: riderUserId },
    });

    if (!rider) {
      throw new ForbiddenError('Only registered riders can perform delivery actions');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        deliveryOtp: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.riderId !== rider.id) {
      throw new ForbiddenError('This order is not assigned to you');
    }

    return { rider, order };
  }

  /**
   * Rider accepts order assignment
   */
  static async acceptAssignment(orderId: string, riderUserId: string) {
    const { rider, order } = await this.getRiderAndOrder(orderId, riderUserId);

    if (order.status !== OrderStatus.RIDER_ASSIGNED) {
      throw new BadRequestError(`Cannot accept order with status: ${order.status}`);
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          // Status remains RIDER_ASSIGNED until marked out for delivery
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.RIDER_ASSIGNED,
          note: `Rider ${riderUserId} accepted delivery assignment`,
          changedById: riderUserId,
        },
      });

      return ord;
    });

    await NotificationService.createNotification({
      userId: order.customerId,
      title: 'Rider Assigned',
      message: `Your LPG delivery order ${order.orderNumber} has been accepted by our delivery partner.`,
      type: NotificationType.DELIVERY,
      orderId,
    });

    return updatedOrder;
  }

  /**
   * Rider rejects assignment
   */
  static async rejectAssignment(orderId: string, riderUserId: string, reason: string) {
    const { order } = await this.getRiderAndOrder(orderId, riderUserId);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Unassign rider and put back into ACCEPTED status so admin can reassign
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.ACCEPTED,
          riderId: null,
          rejectionReason: `Rider declined: ${reason}`,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.ACCEPTED,
          note: `Rider declined assignment. Reason: ${reason}`,
          changedById: riderUserId,
        },
      });

      return ord;
    });

    await NotificationService.notifyAdmins({
      title: 'Rider Declined Assignment',
      message: `Order ${order.orderNumber} was declined by rider. Reason: ${reason}`,
      type: NotificationType.DELIVERY,
      orderId,
    });

    return updatedOrder;
  }

  /**
   * Rider marks order Out for Delivery
   */
  static async markOutForDelivery(orderId: string, riderUserId: string) {
    const { order } = await this.getRiderAndOrder(orderId, riderUserId);

    if (order.status !== OrderStatus.RIDER_ASSIGNED) {
      throw new BadRequestError(`Cannot set Out for Delivery from status: ${order.status}`);
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.OUT_FOR_DELIVERY,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.OUT_FOR_DELIVERY,
          note: 'Cylinder is out for delivery with rider',
          changedById: riderUserId,
        },
      });

      return ord;
    });

    await NotificationService.createNotification({
      userId: order.customerId,
      title: 'Out for Delivery',
      message: `Your LPG cylinder order ${order.orderNumber} is out for delivery!`,
      type: NotificationType.DELIVERY,
      orderId,
    });

    return updatedOrder;
  }

  /**
   * Rider marks Arrived at customer location
   */
  static async markArrived(orderId: string, riderUserId: string) {
    const { order } = await this.getRiderAndOrder(orderId, riderUserId);

    if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestError(`Cannot mark Arrived from status: ${order.status}`);
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.ARRIVED,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.ARRIVED,
          note: 'Rider has arrived at the customer delivery location',
          changedById: riderUserId,
        },
      });

      return ord;
    });

    await NotificationService.createNotification({
      userId: order.customerId,
      title: 'Delivery Partner Arrived',
      message: `Our delivery partner has arrived at your address for order ${order.orderNumber}. Please be available with the delivery OTP.`,
      type: NotificationType.DELIVERY,
      orderId,
    });

    return updatedOrder;
  }

  /**
   * Send Delivery OTP to customer
   */
  static async sendDeliveryOtp(orderId: string, riderUserId: string) {
    const { order } = await this.getRiderAndOrder(orderId, riderUserId);

    const canSendOtp =
      order.status === OrderStatus.OUT_FOR_DELIVERY ||
      order.status === OrderStatus.ARRIVED ||
      order.status === OrderStatus.OTP_PENDING;
    if (!canSendOtp) {
      throw new BadRequestError(
        `Delivery OTP can only be generated when the rider is out for delivery or at the doorstep (Current: ${order.status})`
      );
    }

    const customerEmail = order.customer.email?.trim() || '';
    if (!customerEmail && !order.deliveryPhone) {
      throw new BadRequestError('This booking has no customer email or phone to send the OTP.');
    }

    const plainOtp = generateOtp(6);
    const otpHash = await hashOtp(plainOtp);
    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    // Upsert DeliveryOtp
    await prisma.deliveryOtp.upsert({
      where: { orderId: order.id },
      update: {
        otpHash,
        expiresAt,
        attempts: 0,
        isUsed: false,
      },
      create: {
        orderId: order.id,
        otpHash,
        expiresAt,
        attempts: 0,
        maxAttempts: config.otp.maxAttempts,
        isUsed: false,
      },
    });

    // Update order status to OTP_PENDING if arrived
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.OTP_PENDING },
    });

    const message = `Your DS Shinde Gas delivery confirmation OTP for order ${order.orderNumber} is: ${plainOtp}. Share this ONLY with the delivery partner upon cylinder inspection.`;

    if (customerEmail) {
      const emailed = await sendEmail({
        to: customerEmail,
        subject: `Delivery OTP for Order ${order.orderNumber}`,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #ea580c;">DS Shinde Gas</h2>
          <p>Your delivery partner is at your doorstep. Please share this Delivery Confirmation OTP after inspecting your cylinder:</p>
          <h1 style="letter-spacing: 6px; color: #1e293b; background: #fef3c7; padding: 12px 24px; display: inline-block;">${plainOtp}</h1>
          <p>Order Number: <strong>${order.orderNumber}</strong></p>
          <p>This code was sent to ${customerEmail}.</p>
          <p>Valid for ${config.otp.expiryMinutes} minutes.</p>
        </div>`,
      });
      if (!emailed) {
        throw new BadRequestError(`Could not send the OTP email to ${customerEmail}. Try again.`);
      }
    } else if (order.deliveryPhone) {
      await sendSms({
        phone: order.deliveryPhone,
        message,
      });
    }

    if (config.otp.devMode) {
      console.log(
        `[DELIVERY OTP DEV MODE] Order: ${order.orderNumber} | OTP: ${plainOtp} | Email: ${customerEmail || 'none'} | Phone: ${order.deliveryPhone}`
      );
    }

    return {
      message: customerEmail
        ? `Delivery OTP sent to ${customerEmail}`
        : `Delivery OTP sent to ${order.deliveryPhone}`,
    };
  }

  /**
   * Verify Delivery OTP entered by rider
   */
  static async verifyDeliveryOtp(orderId: string, riderUserId: string, otp: string) {
    const { order } = await this.getRiderAndOrder(orderId, riderUserId);

    const deliveryOtp = await prisma.deliveryOtp.findUnique({
      where: { orderId: order.id },
    });

    if (!deliveryOtp) {
      throw new BadRequestError('No delivery OTP has been generated for this order yet.');
    }

    if (deliveryOtp.isUsed) {
      return { verified: true, message: 'Delivery OTP already verified successfully' };
    }

    if (deliveryOtp.attempts >= deliveryOtp.maxAttempts) {
      throw new BadRequestError('Maximum verification attempts exceeded. Please generate a new OTP.');
    }

    if (new Date() > deliveryOtp.expiresAt) {
      throw new BadRequestError('Delivery OTP has expired. Please request a new OTP.');
    }

    const isValid = await verifyOtpHash(String(otp).replace(/\D/g, ''), deliveryOtp.otpHash);
    if (!isValid) {
      await prisma.deliveryOtp.update({
        where: { orderId: order.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestError('Invalid OTP entered. Please verify with customer.');
    }

    // Mark OTP as used (verified)
    await prisma.deliveryOtp.update({
      where: { orderId: order.id },
      data: { isUsed: true },
    });

    return {
      verified: true,
      message: 'Delivery OTP verified successfully. You may now complete the delivery.',
    };
  }

  /**
   * Complete Delivery (Requires OTP verified, and if COD, payment collected or recorded)
   */
  static async completeDelivery(orderId: string, riderUserId: string) {
    const { rider, order } = await this.getRiderAndOrder(orderId, riderUserId);

    const deliveryOtp = await prisma.deliveryOtp.findUnique({
      where: { orderId: order.id },
    });

    if (!deliveryOtp || !deliveryOtp.isUsed) {
      throw new BadRequestError(
        'Delivery OTP must be verified before marking delivery as completed.'
      );
    }
    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestError('Payment must be recorded before completing this delivery.');
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const deliveredAt = new Date();
      const remindersEndAt = new Date(deliveredAt);
      remindersEndAt.setDate(remindersEndAt.getDate() + order.bookingDurationDays);
      const nextReminderAt = new Date(deliveredAt);
      nextReminderAt.setDate(nextReminderAt.getDate() + 2);
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.DELIVERED,
          deliveredAt,
          remindersEndAt,
          nextReminderAt:
            order.remindersEnabled && nextReminderAt < remindersEndAt
              ? nextReminderAt
              : null,
        },
      });

      // Update rider availability
      await tx.rider.update({
        where: { id: rider.id },
        data: { isAvailable: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.DELIVERED,
          note: 'Cylinder safely delivered and confirmed with OTP verification',
          changedById: riderUserId,
        },
      });

      return ord;
    });

    await NotificationService.createNotification({
      userId: order.customerId,
      title: 'Order Delivered!',
      message: `Your LPG cylinder order ${order.orderNumber} has been delivered successfully. Thank you for choosing DS Shinde Gas!`,
      type: NotificationType.DELIVERY,
      orderId,
    });

    await NotificationService.notifyAdmins({
      title: 'Order Delivered',
      message: `Order ${order.orderNumber} delivered by rider ${riderUserId}.`,
      type: NotificationType.DELIVERY,
      orderId,
    });

    return updatedOrder;
  }
}
