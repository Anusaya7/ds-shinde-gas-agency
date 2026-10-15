import { Prisma } from '@prisma/client';
import { OrderStatus, PaymentMethod, PaymentStatus, Role, NotificationType } from '../constants/enums.js';
import prisma from '../config/database.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { createRazorpayOrder } from '../utils/payment.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { NotificationService } from './notification.service.js';

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
          in: ['delivery_charge_default', 'tax_percentage', 'online_payment_fee_percent'],
        },
      },
    });

    const settingMap = new Map(settings.map((s) => [s.key, s.value]));
    const defaultDeliveryFee = parseFloat(settingMap.get('delivery_charge_default') || '50.00');
    const taxRatePercent = parseFloat(settingMap.get('tax_percentage') || '5.0');
    const onlineFeePercent = parseFloat(settingMap.get('online_payment_fee_percent') || '0');

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

    // 4. Calculate Taxes and Payment Fees
    // Domestic cylinders are exempted or minimal GST, commercial applies configured tax
    const taxes = hasCommercialItem ? (subtotal * taxRatePercent) / 100 : 0;
    const paymentFee = dto.paymentMethod === PaymentMethod.ONLINE ? (subtotal * onlineFeePercent) / 100 : 0;
    const totalAmount = subtotal + totalDeliveryCharge + taxes + paymentFee;

    const orderNumber = generateOrderNumber();

    // 5. Pre-create Razorpay order if online payment
    let razorpayOrderData: any = null;
    if (dto.paymentMethod === PaymentMethod.ONLINE || dto.paymentMethod === PaymentMethod.CARD) {
      try {
        razorpayOrderData = await createRazorpayOrder({
          amountInRupees: totalAmount,
          receipt: orderNumber,
          notes: {
            orderNumber,
            deliveryPhone: dto.deliveryPhone,
          },
        });
      } catch (err) {
        console.error('Error creating Razorpay order:', err);
        // Fallback: order will still be created and online payment retried
      }
    }

    // 6. Execute atomic database transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          status: OrderStatus.ORDER_PLACED,
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
          paymentStatus: PaymentStatus.PENDING,
          notes: dto.notes,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: OrderStatus.ORDER_PLACED,
              note: 'Order placed by customer via web platform',
              changedById: customerId,
            },
          },
          payments: {
            create: {
              method: dto.paymentMethod,
              amount: new Prisma.Decimal(totalAmount),
              status: PaymentStatus.PENDING,
              razorpayOrderId: razorpayOrderData?.id || null,
            },
          },
        },
        include: {
          items: true,
          payments: true,
          statusHistory: true,
        },
      });

      return order;
    });

    // 7. Notify Admins & Customer
    await NotificationService.notifyAdmins({
      title: 'New Cylinder Order Placed',
      message: `New order ${createdOrder.orderNumber} placed for ₹${totalAmount} by ${dto.deliveryName}.`,
      type: NotificationType.ORDER_UPDATE,
      orderId: createdOrder.id,
    });

    await NotificationService.createNotification({
      userId: customerId,
      title: 'Order Confirmed',
      message: `Your LPG cylinder order ${createdOrder.orderNumber} has been placed successfully.`,
      type: NotificationType.ORDER_UPDATE,
      orderId: createdOrder.id,
    });

    return {
      order: createdOrder,
      razorpayOrder: razorpayOrderData,
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
