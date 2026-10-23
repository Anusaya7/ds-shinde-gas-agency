import { Prisma } from '@prisma/client';
import { OrderStatus, PaymentMethod, PaymentStatus, Role, NotificationType } from '../constants/enums.js';
import prisma from '../config/database.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { NotificationService } from './notification.service.js';
import { recordAuditLog } from './audit.service.js';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  items: CreateOrderItemInput[];
  deliveryName: string;
  deliveryPhone: string;
  deliveryAltPhone?: string;
  deliveryAddress: string;
  deliveryArea: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPinCode: string;
  deliveryLandmark?: string;
  deliveryMapLink?: string;
  paymentMethod: PaymentMethod;
  bookingDurationDays: number;
  remindersEnabled: boolean;
  fsiNumber?: string;
  notes?: string;
}

export class OrderService {
  /**
   * Create a new order with server-side price calculation and database transaction
   */
  static async createOrder(customerId: string, dto: CreateOrderDTO) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestError('Order must contain at least one item');
    }

    // 0. Verify customer KYC approval status
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: customerId },
      select: { approvalStatus: true, rejectionReason: true },
    });
    if (customerProfile?.approvalStatus === 'REJECTED') {
      throw new BadRequestError(
        `Your account KYC was rejected (${customerProfile.rejectionReason || 'Contact agency'}). Please update your verification documents.`
      );
    }

    // 1. Fetch products from database to ensure price integrity
    const productIds = dto.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (dbProducts.length !== productIds.length) {
      throw new BadRequestError('One or more selected products are invalid or no longer available.');
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 2. Fetch agency settings for default charges / taxes
    const settings = await prisma.agencySetting.findMany({
      where: {
        key: {
          in: [
            'delivery_charge_default',
            'tax_percentage',
            'welcome_offer_enabled',
            'welcome_offer_amount',
            'online_payment_fee',
            'online_payment_fee_percent',
            'is_ordering_enabled',
          ],
        },
      },
    });

    const settingMap = new Map(settings.map((s) => [s.key, s.value]));
    if (settingMap.get('is_ordering_enabled') === 'false') {
      throw new BadRequestError('Online booking is temporarily paused. Please contact the agency.');
    }
    const defaultDeliveryFee = parseFloat(settingMap.get('delivery_charge_default') || '50.00');
    const taxRatePercent = parseFloat(settingMap.get('tax_percentage') || '0');
    const welcomeOfferEnabled = settingMap.get('welcome_offer_enabled') === 'true';
    const welcomeOfferAmount = Number(settingMap.get('welcome_offer_amount') || 0);
    if (!Number.isFinite(taxRatePercent) || taxRatePercent < 0 || taxRatePercent > 100) {
      throw new BadRequestError('Configured tax rate is invalid. Please contact the agency.');
    }
    if (!Number.isFinite(welcomeOfferAmount) || welcomeOfferAmount < 0) {
      throw new BadRequestError('Configured welcome offer is invalid. Please contact the agency.');
    }

    // 3. Compute item totals & subtotal
    let subtotal = 0;
    let totalDeliveryCharge = 0;
    let hasCommercialItem = false;

    const orderItemsData = dto.items.map((item) => {
      const prod = productMap.get(item.productId)!;

      if (item.quantity < prod.minQuantity) {
        throw new BadRequestError(
          `Minimum quantity for ${prod.name} is ${prod.minQuantity}`
        );
      }
      if (item.quantity > prod.maxQuantity) {
        throw new BadRequestError(
          `Maximum quantity for ${prod.name} is ${prod.maxQuantity}`
        );
      }

      const unitPrice = Number(prod.price);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      // Delivery charges: take product delivery charge or fallback to default
      const itemDelivery = Number(prod.deliveryCharge) > 0 ? Number(prod.deliveryCharge) : defaultDeliveryFee;
      totalDeliveryCharge = Math.max(totalDeliveryCharge, itemDelivery);

      if (prod.isCommercial) {
        hasCommercialItem = true;
      }

      return {
        productId: prod.id,
        productName: prod.name,
        sizeKg: prod.sizeKg,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(unitPrice),
        totalPrice: new Prisma.Decimal(itemTotal),
      };
    });

    // 4. Apply the configured tax rate only to commercial cylinder orders.
    const taxes = hasCommercialItem ? (subtotal * taxRatePercent) / 100 : 0;

    const paymentMethod = dto.paymentMethod || 'COD';
    const paymentFeePercent = parseFloat(
      settingMap.get('online_payment_fee') || settingMap.get('online_payment_fee_percent') || '0'
    );
    const paymentFee =
      paymentMethod === 'CARD' && Number.isFinite(paymentFeePercent) && paymentFeePercent > 0
        ? Math.round((subtotal + totalDeliveryCharge + taxes) * (paymentFeePercent / 100) * 100) / 100
        : 0;
    const baseTotal = subtotal + totalDeliveryCharge + taxes + paymentFee;

    const orderNumber = generateOrderNumber();
    let welcomeOfferDiscount = 0;
    let totalAmount = baseTotal;

    // 5. Persist the booking before any payment step can open.
    const createdOrder = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: customerId },
        data: { name: dto.deliveryName },
      });
      await tx.customerProfile.upsert({
        where: { userId: customerId },
        update: { ...(dto.fsiNumber !== undefined && { fsiNumber: dto.fsiNumber.trim() || null }) },
        create: { userId: customerId, fsiNumber: dto.fsiNumber?.trim() || null },
      });
      if (welcomeOfferEnabled && welcomeOfferAmount > 0) {
        const existingOrderCount = await tx.order.count({ where: { customerId } });
        if (existingOrderCount === 0) {
          const claim = await tx.customerProfile.updateMany({
            where: { userId: customerId, welcomeOfferUsedAt: null },
            data: { welcomeOfferUsedAt: new Date() },
          });
          if (claim.count === 1) {
            welcomeOfferDiscount = Math.min(welcomeOfferAmount, baseTotal);
          }
        }
      }
      totalAmount = Math.max(0, baseTotal - welcomeOfferDiscount);

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          status: OrderStatus.AWAITING_REVIEW,
          deliveryName: dto.deliveryName,
          deliveryPhone: dto.deliveryPhone,
          deliveryAltPhone: dto.deliveryAltPhone,
          deliveryAddress: dto.deliveryAddress,
          deliveryArea: dto.deliveryArea,
          deliveryCity: dto.deliveryCity,
          deliveryState: dto.deliveryState,
          deliveryPinCode: dto.deliveryPinCode,
          deliveryLandmark: dto.deliveryLandmark,
          deliveryMapLink: dto.deliveryMapLink,
          subtotal: new Prisma.Decimal(subtotal),
          deliveryCharges: new Prisma.Decimal(totalDeliveryCharge),
          taxes: new Prisma.Decimal(taxes),
          paymentFee: new Prisma.Decimal(paymentFee),
          totalAmount: new Prisma.Decimal(totalAmount),
          paymentMethod: dto.paymentMethod,
          bookingDurationDays: dto.bookingDurationDays,
          remindersEnabled: dto.remindersEnabled,
          fsiNumber: dto.fsiNumber?.trim() || null,
          welcomeOfferDiscount: new Prisma.Decimal(welcomeOfferDiscount),
          paymentStatus: PaymentStatus.PENDING,
          notes: dto.notes,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: OrderStatus.AWAITING_REVIEW,
              note: 'Booking submitted by customer and awaiting admin review',
              changedById: customerId,
            },
          },
          payments: {
            create: {
              method: dto.paymentMethod,
              amount: new Prisma.Decimal(totalAmount),
              status: PaymentStatus.PENDING,
            },
          },
        },
        include: {
          items: true,
          payments: true,
          statusHistory: true,
        },
      });
      await recordAuditLog(tx, {
        userId: customerId,
        action: 'ORDER_CREATE',
        entity: 'Order',
        entityId: order.id,
        details: `Created booking ${order.orderNumber}; first-order discount ₹${welcomeOfferDiscount}.`,
      });

      return order;
    });

    // Notify administrators before the customer can proceed to payment.
    await NotificationService.notifyAdmins({
      title: 'New Cylinder Order Placed',
      message: `New booking ${createdOrder.orderNumber} is awaiting review for ₹${totalAmount} by ${dto.deliveryName}.`,
      type: NotificationType.ORDER_UPDATE,
      orderId: createdOrder.id,
    });

    await NotificationService.createNotification({
      userId: customerId,
      title: 'Booking submitted',
      message: `Your ${createdOrder.items.map((item) => `${item.sizeKg} kg`).join(', ')} cylinder booking (${dto.bookingDurationDays} days) is awaiting admin review. Payment is available after approval.`,
      type: NotificationType.ORDER_UPDATE,
      orderId: createdOrder.id,
    });

    return {
      order: createdOrder,
    };
  }

  /**
   * List customer's orders with pagination and filtering
   */
  static async getCustomerOrders(
    customerId: string,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {
      customerId,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          payments: true,
          rider: {
            include: {
              user: {
                select: { name: true, phone: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  /**
   * Get single order detail for customer
   */
  static async getCustomerOrderDetail(orderId: string, customerId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedBy: {
              select: { name: true, role: true },
            },
          },
        },
        rider: {
          include: {
            user: {
              select: { name: true, phone: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  static async updateReminderPreference(orderId: string, customerId: string, enabled: boolean) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
      select: {
        id: true,
        status: true,
        deliveredAt: true,
        bookingDurationDays: true,
        remindersEndAt: true,
      },
    });
    if (!order) throw new NotFoundError('Order not found');
    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REJECTED) {
      throw new BadRequestError('Reminders cannot be changed for a cancelled or rejected booking.');
    }

    let nextReminderAt: Date | null = null;
    let remindersEndAt = order.remindersEndAt;
    if (enabled && order.status === OrderStatus.DELIVERED) {
      if (!order.deliveredAt) {
        throw new BadRequestError('Delivery date is unavailable; reminders cannot be scheduled.');
      }
      remindersEndAt ??= new Date(
        order.deliveredAt.getTime() + order.bookingDurationDays * 24 * 60 * 60 * 1000
      );
      if (remindersEndAt <= new Date()) {
        throw new BadRequestError('The reminder period for this booking has ended.');
      }
      nextReminderAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      if (nextReminderAt >= remindersEndAt) nextReminderAt = null;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: order.id },
        data: {
          remindersEnabled: enabled,
          nextReminderAt: enabled ? nextReminderAt : null,
          ...(order.status === OrderStatus.DELIVERED && { remindersEndAt }),
        },
      });
      await recordAuditLog(tx, {
        userId: customerId,
        action: enabled ? 'REMINDERS_ENABLED' : 'REMINDERS_DISABLED',
        entity: 'Order',
        entityId: order.id,
        details: `Customer ${enabled ? 'enabled' : 'disabled'} in-app reminders.`,
      });
      return result;
    });
    return updated;
  }

  /**
   * Order Tracking Timeline
   */
  static async getOrderTracking(orderId: string, userId?: string, userRole?: Role) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        rider: {
          include: {
            user: {
              select: { name: true, phone: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Permission check: if normal customer, must be their order
    if (userRole === Role.CUSTOMER && order.customerId !== userId) {
      throw new ForbiddenError('You do not have permission to view tracking for this order');
    }

    const timelineSteps = [
      OrderStatus.ORDER_PLACED,
      OrderStatus.ACCEPTED,
      OrderStatus.RIDER_ASSIGNED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.ARRIVED,
      OrderStatus.DELIVERED,
    ];

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      rider: order.rider
        ? {
            name: order.rider.user.name,
            phone: order.rider.user.phone,
            vehicleNumber: order.rider.vehicleNumber,
          }
        : null,
      history: order.statusHistory,
      steps: timelineSteps,
    };
  }

  /**
   * Cancel Order (with cancellation policy checks)
   */
  static async cancelOrder(orderId: string, userId: string, role: Role, reason: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Customer cancellation policy: only allowed before delivery starts
    if (role === Role.CUSTOMER) {
      if (order.customerId !== userId) {
        throw new ForbiddenError('You cannot cancel another customer’s order');
      }

      const cancellableStatuses: string[] = [OrderStatus.ORDER_PLACED, OrderStatus.AWAITING_REVIEW, OrderStatus.ACCEPTED];
      if (!cancellableStatuses.includes(order.status)) {
        throw new BadRequestError(
          `Order cannot be cancelled at stage: ${order.status}. Please contact support directly.`
        );
      }
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestError('Delivered orders cannot be cancelled');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError('Order is already cancelled');
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancellationReason: reason,
        },
      });

      // Free up rider if assigned
      if (order.riderId) {
        await tx.rider.update({
          where: { id: order.riderId },
          data: { isAvailable: true },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.CANCELLED,
          note: `Order cancelled by ${role}. Reason: ${reason}`,
          changedById: userId,
        },
      });

      return ord;
    });

    // Notify respective parties
    if (role === Role.CUSTOMER) {
      await NotificationService.notifyAdmins({
        title: 'Order Cancelled by Customer',
        message: `Order ${order.orderNumber} was cancelled by customer. Reason: ${reason}`,
        type: NotificationType.ORDER_UPDATE,
        orderId: order.id,
      });
    } else {
      await NotificationService.createNotification({
        userId: order.customerId,
        title: 'Order Cancelled',
        message: `Your order ${order.orderNumber} was cancelled. Reason: ${reason}`,
        type: NotificationType.ORDER_UPDATE,
        orderId: order.id,
      });
    }

    return cancelledOrder;
  }

}
