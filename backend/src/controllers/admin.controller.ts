import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { OrderStatus, PaymentStatus, Role, NotificationType } from '../constants/enums.js';
import prisma from '../config/database.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { NotificationService } from '../services/notification.service.js';
import { recordAuditLog } from '../services/audit.service.js';

export class AdminController {
  /**
   * Real Dashboard Counts and Statistics
   */
  static async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalOrders,
        newOrders,
        awaitingReview,
        accepted,
        outForDelivery,
        delivered,
        cancelled,
        pendingPayments,
        paidPaymentsAggregate,
        totalCustomers,
        totalRiders,
        availableRiders,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: OrderStatus.ORDER_PLACED } }),
        prisma.order.count({ where: { status: OrderStatus.AWAITING_REVIEW } }),
        prisma.order.count({ where: { status: OrderStatus.ACCEPTED } }),
        prisma.order.count({ where: { status: OrderStatus.OUT_FOR_DELIVERY } }),
        prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
        prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
        prisma.order.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
        prisma.payment.aggregate({
          where: { status: PaymentStatus.PAID },
          _sum: { amount: true },
        }),
        prisma.user.count({ where: { role: Role.CUSTOMER } }),
        prisma.rider.count(),
        prisma.rider.count({ where: { isAvailable: true } }),
      ]);

      const totalCollected = Number(paidPaymentsAggregate._sum.amount || 0);

      // Recent 5 orders for dashboard feed
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
          items: true,
        },
      });

      ApiResponse.success(
        res,
        {
          totalOrders,
          newOrders,
          awaitingReview,
          accepted,
          outForDelivery,
          delivered,
          cancelled,
          pendingPayments,
          totalCollected,
          totalCustomers,
          totalRiders,
          availableRiders,
          recentOrders,
        },
        'Dashboard statistics retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders with filtering, search, and pagination
   */
  static async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as OrderStatus | undefined;
      const paymentStatus = req.query.paymentStatus as PaymentStatus | undefined;
      const search = req.query.search as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const skip = (page - 1) * limit;

      const where: Prisma.OrderWhereInput = {};

      if (status) {
        where.status = status;
      }

      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      if (search) {
        where.OR = [
          { orderNumber: { contains: search } },
          { deliveryName: { contains: search } },
          { deliveryPhone: { contains: search } },
          { deliveryAddress: { contains: search } },
          { deliveryArea: { contains: search } },
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            customer: { select: { id: true, name: true, phone: true, email: true } },
            rider: { include: { user: { select: { name: true, phone: true } } } },
            items: true,
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      ApiResponse.paginated(res, orders, total, page, limit, 'Orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single order by ID for admin
   */
  static async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: {
            select: { id: true, name: true, phone: true, email: true },
          },
          rider: {
            include: {
              user: { select: { id: true, name: true, phone: true } },
            },
          },
          items: {
            include: { product: true },
          },
          payments: {
            include: {
              collectedBy: { select: { id: true, name: true } },
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'asc' },
            include: {
              changedBy: { select: { id: true, name: true, role: true } },
            },
          },
          deliveryOtp: {
            select: {
              otpCode: true,
              isUsed: true,
              expiresAt: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      ApiResponse.success(
        res,
        {
          ...order,
          deliveryOtp: order.deliveryOtp?.otpCode || null,
          isOtpVerified: Boolean(order.deliveryOtp?.isUsed),
          otpGenerated: Boolean(order.deliveryOtp),
        },
        'Order details retrieved'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept an order
   */
  static async acceptOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;

      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Order not found');
      }

      if (existing.status === OrderStatus.CANCELLED || existing.status === OrderStatus.REJECTED) {
        throw new BadRequestError(`Cannot accept order with status: ${existing.status}`);
      }
      if (existing.status !== OrderStatus.ORDER_PLACED && existing.status !== OrderStatus.AWAITING_REVIEW) {
        throw new BadRequestError(
          `Only bookings awaiting review can be accepted (current status: ${existing.status}).`
        );
      }

      const order = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: { status: OrderStatus.ACCEPTED },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: OrderStatus.ACCEPTED,
            note: 'Order reviewed and accepted by administration',
            changedById: adminId,
          },
        });
        await recordAuditLog(tx, {
          userId: adminId,
          action: 'ORDER_APPROVE',
          entity: 'Order',
          entityId: id,
          details: `Approved order ${existing.orderNumber}.`,
          ipAddress: req.ip,
        });

        return ord;
      });

      await NotificationService.createNotification({
        userId: existing.customerId,
        title: 'Order Accepted',
        message: `Your LPG cylinder order ${existing.orderNumber} has been verified and accepted. Delivery preparation started.`,
        type: NotificationType.ORDER_UPDATE,
        orderId: existing.id,
      });

      ApiResponse.success(res, order, 'Order accepted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject an order with reason
   */
  static async rejectOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const { reason } = req.body;

      if (!reason) {
        throw new BadRequestError('Rejection reason is required');
      }

      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Order not found');
      }
      if (existing.status !== OrderStatus.ORDER_PLACED && existing.status !== OrderStatus.AWAITING_REVIEW) {
        throw new BadRequestError(
          `Only bookings awaiting review can be rejected (current status: ${existing.status}).`
        );
      }
      if (existing.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestError('A paid order cannot be rejected before its payment has been refunded.');
      }

      const order = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: {
            status: OrderStatus.REJECTED,
            rejectionReason: reason,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: OrderStatus.REJECTED,
            note: `Order rejected by admin. Reason: ${reason}`,
            changedById: adminId,
          },
        });
        await recordAuditLog(tx, {
          userId: adminId,
          action: 'ORDER_REJECT',
          entity: 'Order',
          entityId: id,
          details: `Rejected order ${existing.orderNumber}: ${reason}`,
          ipAddress: req.ip,
        });

        return ord;
      });

      await NotificationService.createNotification({
        userId: existing.customerId,
        title: 'Order Rejected',
        message: `Your cylinder order ${existing.orderNumber} could not be processed. Reason: ${reason}`,
        type: NotificationType.ORDER_UPDATE,
        orderId: existing.id,
      });

      ApiResponse.success(res, order, 'Order rejected');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign rider to an order
   */
  static async assignRider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const { riderId } = req.body;

      if (!riderId) {
        throw new BadRequestError('riderId is required');
      }

      const [order, rider] = await Promise.all([
        prisma.order.findUnique({ where: { id } }),
        prisma.rider.findUnique({
          where: { id: riderId },
          include: { user: true },
        }),
      ]);

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      if (!rider) {
        throw new NotFoundError('Rider not found');
      }

      if (!rider.user.isActive) {
        throw new BadRequestError('Cannot assign inactive rider');
      }

      if (order.status !== OrderStatus.ACCEPTED && order.status !== OrderStatus.RIDER_ASSIGNED) {
        throw new BadRequestError('Approve this booking first, then assign a delivery rider.');
      }

      const previousRiderId = order.riderId;
      const isReassignment = Boolean(previousRiderId && previousRiderId !== riderId);
      let previousRiderUserId: string | null = null;

      if (isReassignment && previousRiderId) {
        const prevRider = await prisma.rider.findUnique({
          where: { id: previousRiderId },
          select: { userId: true },
        });
        if (prevRider) previousRiderUserId = prevRider.userId;
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (isReassignment && previousRiderId) {
          await tx.rider.update({
            where: { id: previousRiderId },
            data: { isAvailable: true },
          });
        }

        const ord = await tx.order.update({
          where: { id },
          data: {
            riderId,
            status: OrderStatus.RIDER_ASSIGNED,
          },
          include: {
            rider: { include: { user: true } },
          },
        });

        await tx.rider.update({
          where: { id: riderId },
          data: { isAvailable: false },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: OrderStatus.RIDER_ASSIGNED,
            note: isReassignment
              ? `Order reassigned to delivery partner ${rider.user.name} (${rider.vehicleNumber || 'No vehicle'})`
              : `Assigned to delivery partner ${rider.user.name} (${rider.vehicleNumber || 'No vehicle'})`,
            changedById: adminId,
          },
        });

        return ord;
      });

      // Notify new rider
      await NotificationService.createNotification({
        userId: rider.userId,
        title: 'New Delivery Assignment',
        message: `You have been assigned to deliver order ${order.orderNumber} to ${order.deliveryArea}.`,
        type: NotificationType.DELIVERY,
        orderId: order.id,
      });

      // Notify previous rider if reassigned
      if (previousRiderUserId) {
        await NotificationService.createNotification({
          userId: previousRiderUserId,
          title: 'Order Reassigned',
          message: `Order ${order.orderNumber} was reassigned by administration to another partner.`,
          type: NotificationType.DELIVERY,
          orderId: order.id,
        });
      }

      // Notify customer
      await NotificationService.createNotification({
        userId: order.customerId,
        title: 'Delivery Partner Assigned',
        message: `Rider ${rider.user.name} has been assigned for your order ${order.orderNumber}.`,
        type: NotificationType.DELIVERY,
        orderId: order.id,
      });

      ApiResponse.success(res, updated, 'Rider assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order as admin
   */
  static async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const { reason } = req.body;

      if (!reason) {
        throw new BadRequestError('Cancellation reason is required');
      }

      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Order not found');
      }
      if (
        existing.status === OrderStatus.DELIVERED ||
        existing.status === OrderStatus.CANCELLED ||
        existing.status === OrderStatus.REJECTED
      ) {
        throw new BadRequestError(`Cannot cancel an order that is already ${existing.status}.`);
      }

      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: {
            status: OrderStatus.CANCELLED,
            cancellationReason: reason,
          },
        });

        if (existing.riderId) {
          await tx.rider.update({
            where: { id: existing.riderId },
            data: { isAvailable: true },
          });
        }

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: OrderStatus.CANCELLED,
            note: `Order cancelled by admin. Reason: ${reason}`,
            changedById: adminId,
          },
        });

        await recordAuditLog(tx, {
          userId: adminId,
          action: 'ORDER_CANCELLED',
          entity: 'Order',
          entityId: id,
          details: `Admin cancelled ${existing.orderNumber}. Reason: ${reason}`,
          ipAddress: req.ip,
        });

        return ord;
      });

      await NotificationService.createNotification({
        userId: existing.customerId,
        title: 'Order Cancelled',
        message: `Your order ${existing.orderNumber} has been cancelled by administration. Reason: ${reason}`,
        type: NotificationType.ORDER_UPDATE,
        orderId: existing.id,
      });

      ApiResponse.success(res, updated, 'Order cancelled');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove one line item from an open order and recalculate totals
   */
  static async deleteOrderItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, itemId } = req.params;
      const adminId = req.user!.id;

      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) throw new NotFoundError('Order not found');
      if (
        [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(
          order.status as OrderStatus
        )
      ) {
        throw new BadRequestError('Items cannot be removed from a closed order.');
      }
      if (order.items.length <= 1) {
        throw new BadRequestError('Cannot remove the last item. Cancel the order instead.');
      }

      const item = order.items.find((row) => row.id === itemId);
      if (!item) throw new NotFoundError('Order item not found');

      const remaining = order.items.filter((row) => row.id !== itemId);
      const subtotal = remaining.reduce((sum, row) => sum + Number(row.totalPrice), 0);
      const deliveryCharges = Number(order.deliveryCharges);
      const taxes = Number(order.taxes);
      const paymentFee = Number(order.paymentFee);
      const welcomeOfferDiscount = Number(order.welcomeOfferDiscount || 0);
      const totalAmount = Math.max(0, subtotal + deliveryCharges + taxes + paymentFee - welcomeOfferDiscount);

      const updated = await prisma.$transaction(async (tx) => {
        await tx.orderItem.delete({ where: { id: itemId } });
        const ord = await tx.order.update({
          where: { id },
          data: {
            subtotal,
            totalAmount,
          },
          include: {
            items: true,
            customer: { select: { id: true, name: true, phone: true, email: true } },
            rider: { include: { user: { select: { id: true, name: true, phone: true } } } },
          },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: order.status,
            note: `Admin removed item "${item.productName}" (x${item.quantity}). New total ₹${totalAmount}.`,
            changedById: adminId,
          },
        });
        await recordAuditLog(tx, {
          userId: adminId,
          action: 'ORDER_ITEM_DELETED',
          entity: 'Order',
          entityId: id,
          details: `Removed ${item.productName} from ${order.orderNumber}.`,
          ipAddress: req.ip,
        });
        return ord;
      });

      ApiResponse.success(res, updated, 'Order item removed and totals updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send pending-payment reminder to the customer
   */
  static async sendPaymentReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id },
        include: { customer: { select: { id: true, email: true, name: true } } },
      });
      if (!order) throw new NotFoundError('Order not found');
      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestError('This order is already marked as paid.');
      }
      if (
        [OrderStatus.CANCELLED, OrderStatus.REJECTED, OrderStatus.DELIVERED].includes(
          order.status as OrderStatus
        )
      ) {
        throw new BadRequestError('Payment reminders are not sent for closed orders.');
      }

      await NotificationService.createNotification({
        userId: order.customerId,
        title: 'Pending payment reminder',
        message: `Your booking ${order.orderNumber} still has ₹${order.totalAmount} pending. Open My Orders and pay online, or pay the rider at doorstep.`,
        type: NotificationType.PAYMENT,
        orderId: order.id,
      });

      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'PAYMENT_REMINDER_SENT',
        entity: 'Order',
        entityId: order.id,
        details: `Payment reminder sent for ${order.orderNumber}.`,
        ipAddress: req.ip,
      });

      ApiResponse.success(res, { orderId: order.id }, 'Payment reminder sent to customer');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all riders
   */
  static async listRiders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riders = await prisma.rider.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
            },
          },
          orders: {
            where: {
              status: {
                in: [
                  OrderStatus.RIDER_ASSIGNED,
                  OrderStatus.OUT_FOR_DELIVERY,
                  OrderStatus.ARRIVED,
                  OrderStatus.OTP_PENDING,
                ],
              },
            },
            select: { id: true, orderNumber: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = riders.map((r) => ({
        id: r.id,
        userId: r.userId,
        name: r.user.name,
        email: r.user.email,
        phone: r.user.phone,
        vehicleNumber: r.vehicleNumber,
        isAvailable: r.isAvailable,
        isActive: r.user.isActive,
        activeOrdersCount: r.orders.length,
        createdAt: r.createdAt,
      }));

      ApiResponse.success(res, formatted, 'Riders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update rider profile
   */
  static async updateRider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params; // Rider ID
      const { name, phone, vehicleNumber, isAvailable } = req.body;

      const rider = await prisma.rider.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!rider) {
        throw new NotFoundError('Rider not found');
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (name || phone) {
          await tx.user.update({
            where: { id: rider.userId },
            data: {
              ...(name && { name }),
              ...(phone && { phone }),
            },
          });
        }

        return tx.rider.update({
          where: { id },
          data: {
            ...(vehicleNumber !== undefined && { vehicleNumber }),
            ...(isAvailable !== undefined && { isAvailable }),
          },
          include: { user: true },
        });
      });

      ApiResponse.success(res, updated, 'Rider updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle rider active status
   */
  static async toggleRiderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const rider = await prisma.rider.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!rider) {
        throw new NotFoundError('Rider not found');
      }

      const newStatus = !rider.user.isActive;

      await prisma.user.update({
        where: { id: rider.userId },
        data: { isActive: newStatus },
      });

      ApiResponse.success(
        res,
        { riderId: id, isActive: newStatus },
        `Rider ${newStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List customers with pagination and search
   */
  static async listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string | undefined;
      const skip = (page - 1) * limit;

      const where: Prisma.UserWhereInput = {
        role: Role.CUSTOMER,
      };

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ];
      }

      const [customers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            isVerified: true,
            createdAt: true,
            _count: {
              select: { orders: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'CUSTOMER_LIST',
        entity: 'Customer',
        entityId: 'list',
        details: `Listed customer accounts; page ${page}.`,
        ipAddress: req.ip,
      });
      ApiResponse.paginated(res, customers, total, page, limit, 'Customers retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single customer detail with order history
   */
  static async getCustomerDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const customer = await prisma.user.findFirst({
        where: { id, role: Role.CUSTOMER },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          customerProfile: {
            include: {
              addresses: true,
            },
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            include: {
              items: true,
              payments: true,
            },
          },
        },
      });

      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'CUSTOMER_PROFILE_VIEW',
        entity: 'Customer',
        entityId: customer.id,
        details: 'Viewed customer profile, saved addresses, and booking history.',
        ipAddress: req.ip,
      });
      ApiResponse.success(res, customer, 'Customer detail retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all products (including inactive)
   */
  static async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await prisma.product.findMany({
        orderBy: { sizeKg: 'asc' },
      });

      ApiResponse.success(res, products, 'Products retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new cylinder product
   */
  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        sizeKg,
        description,
        price,
        deliveryCharge,
        isActive,
        minQuantity,
        maxQuantity,
        isCommercial,
        requiresQuotation,
        imageUrl,
      } = req.body;

      const product = await prisma.product.create({
        data: {
          name,
          sizeKg: parseFloat(sizeKg),
          description,
          price: new Prisma.Decimal(price),
          deliveryCharge: deliveryCharge !== undefined ? new Prisma.Decimal(deliveryCharge) : new Prisma.Decimal(0),
          isActive: isActive !== undefined ? isActive : true,
          minQuantity: minQuantity || 1,
          maxQuantity: maxQuantity || 10,
          isCommercial: !!isCommercial,
          requiresQuotation: !!requiresQuotation,
          imageUrl,
        },
      });

      ApiResponse.created(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product (including price and delivery charge)
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        sizeKg,
        description,
        price,
        deliveryCharge,
        isActive,
        minQuantity,
        maxQuantity,
        isCommercial,
        requiresQuotation,
        imageUrl,
      } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(sizeKg !== undefined && { sizeKg: parseFloat(sizeKg) }),
          ...(description !== undefined && { description }),
          ...(price !== undefined && { price: new Prisma.Decimal(price) }),
          ...(deliveryCharge !== undefined && { deliveryCharge: new Prisma.Decimal(deliveryCharge) }),
          ...(isActive !== undefined && { isActive }),
          ...(minQuantity !== undefined && { minQuantity }),
          ...(maxQuantity !== undefined && { maxQuantity }),
          ...(isCommercial !== undefined && { isCommercial }),
          ...(requiresQuotation !== undefined && { requiresQuotation }),
          ...(imageUrl !== undefined && { imageUrl }),
        },
      });

      ApiResponse.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft-delete (disable) or hard-delete unused catalog product
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundError('Product not found');

      const usedCount = await prisma.orderItem.count({ where: { productId: id } });
      if (usedCount > 0) {
        const disabled = await prisma.product.update({
          where: { id },
          data: { isActive: false },
        });
        ApiResponse.success(
          res,
          disabled,
          'Product is used on past orders, so it was disabled instead of deleted.'
        );
        return;
      }

      await prisma.product.delete({ where: { id } });
      ApiResponse.success(res, { id }, 'Product deleted');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reports: Orders report with date filter
   */
  static async getOrdersReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, status } = req.query;

      const where: Prisma.OrderWhereInput = {};
      if (status) where.status = status as OrderStatus;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalRevenue = orders.reduce((acc, o) => acc + Number(o.totalAmount), 0);
      const totalCylinders = orders.reduce(
        (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
        0
      );

      ApiResponse.success(
        res,
        {
          totalOrders: orders.length,
          totalRevenue,
          totalCylinders,
          orders,
        },
        'Orders report generated'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reports: Payments report
   */
  static async getPaymentsReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, method, status } = req.query;

      const where: Prisma.PaymentWhereInput = {};
      if (method) where.method = method as any;
      if (status) where.status = status as any;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const payments = await prisma.payment.findMany({
        where,
        include: {
          order: {
            select: { orderNumber: true, deliveryName: true, deliveryPhone: true },
          },
          collectedBy: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalAmount = payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const onlineTotal = payments
        .filter((p) => p.method === 'ONLINE' && p.status === 'PAID')
        .reduce((acc, p) => acc + Number(p.amount), 0);
      const codTotal = payments
        .filter((p) => p.method === 'COD' && p.status === 'PAID')
        .reduce((acc, p) => acc + Number(p.amount), 0);

      ApiResponse.success(
        res,
        {
          totalTransactions: payments.length,
          totalAmount,
          onlineTotal,
          codTotal,
          payments,
        },
        'Payments report generated'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reports: Rider performance
   */
  static async getRidersReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riders = await prisma.rider.findMany({
        include: {
          user: { select: { name: true, phone: true } },
          orders: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              deliveredAt: true,
              createdAt: true,
            },
          },
        },
      });

      const report = riders.map((r) => {
        const completed = r.orders.filter((o) => o.status === OrderStatus.DELIVERED);
        const inProgress = r.orders.filter((o) =>
          ([OrderStatus.RIDER_ASSIGNED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.ARRIVED] as string[]).includes(
            o.status
          )
        );

        return {
          riderId: r.id,
          name: r.user.name,
          phone: r.user.phone,
          vehicleNumber: r.vehicleNumber,
          isAvailable: r.isAvailable,
          totalAssigned: r.orders.length,
          totalDelivered: completed.length,
          inProgress: inProgress.length,
        };
      });

      ApiResponse.success(res, report, 'Rider performance report');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reports: Export orders as CSV format
   */
  static async exportOrdersCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await prisma.order.findMany({
        include: {
          customer: { select: { name: true, phone: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const headers = [
        'Order Number',
        'Customer Name',
        'Phone',
        'Status',
        'Address',
        'PinCode',
        'Payment Method',
        'Payment Status',
        'Subtotal',
        'Delivery Charge',
        'Taxes',
        'Total Amount',
        'Items',
        'Date',
      ];

      const rows = orders.map((o) => {
        const itemsSummary = o.items.map((i) => `${i.productName} (x${i.quantity})`).join('; ');
        return [
          `"${o.orderNumber}"`,
          `"${o.deliveryName}"`,
          `"${o.deliveryPhone}"`,
          `"${o.status}"`,
          `"${o.deliveryAddress.replace(/"/g, '""')}"`,
          `"${o.deliveryPinCode}"`,
          `"${o.paymentMethod}"`,
          `"${o.paymentStatus}"`,
          Number(o.subtotal).toFixed(2),
          Number(o.deliveryCharges).toFixed(2),
          Number(o.taxes).toFixed(2),
          Number(o.totalAmount).toFixed(2),
          `"${itemsSummary}"`,
          `"${o.createdAt.toISOString()}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="orders-report-${Date.now()}.csv"`
      );
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all agency settings
   */
  static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settingsList = await prisma.agencySetting.findMany({
        orderBy: { key: 'asc' },
      });

      const map = new Map(settingsList.map((s) => [s.key, s.value]));

      const structured = {
        agencyName: map.get('agency_name') || 'DS Shinde Gas',
        primaryPhone: map.get('contact_phone_1') || '9511760208',
        secondaryPhone: map.get('contact_phone_2') || '9975300929',
        email: map.get('agency_email') || 'contact@dsshinde.com',
        address: map.get('agency_address') || 'Main Road, Opp. Market Yard, Karad, Maharashtra 415110',
        deliveryAreas: (map.get('service_areas') || 'Karad, Malkapur, Ogalewadi, Saidapur, Vidyanagar, Wathar')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        deliveryCharges: Number(map.get('delivery_charge_default') || 50),
        taxPercentage: Number(map.get('tax_percentage') || 0),
        onlinePaymentFee: Number(map.get('online_payment_fee') || map.get('online_payment_fee_percent') || 0),
        welcomeOfferEnabled: map.get('welcome_offer_enabled') === 'true',
        welcomeOfferAmount: Number(map.get('welcome_offer_amount') || 0),
        isOrderingEnabled: map.get('is_ordering_enabled') !== 'false',
        businessHours: map.get('support_hours') || '8:00 AM - 8:00 PM (Monday to Saturday)',
        heroHeadline: map.get('hero_headline') || 'Your Trusted LPG Gas Partner',
        heroSubheadline: map.get('hero_subheadline') || 'Reliable LPG Cylinder Solutions for Home and Business',
        heroDescription: map.get('hero_description') || 'Explore cylinder capacities, place your order conveniently and manage your delivery through a simple ordering experience.',
        heroPrimaryCtaText: map.get('hero_primary_cta_text') || 'Order a Cylinder',
        heroPrimaryCtaLink: map.get('hero_primary_cta_link') || '/dashboard/orders/new',
        heroSecondaryCtaText: map.get('hero_secondary_cta_text') || 'Explore Cylinder Sizes',
        heroSecondaryCtaLink: map.get('hero_secondary_cta_link') || '/#cylinder-gallery',
        heroImageUrl: map.get('hero_image_url') || '/assets/cylinders/cylinder-size-range.jpeg',
        cylinderSectionTitle: map.get('cylinder_section_title') || 'Gaspoint cylinder size guide',
        cylinderSectionSubtitle: map.get('cylinder_section_subtitle') || 'Compare the cylinder capacities shown in the supplied Gaspoint reference image.',
        announcementBanner: map.get('announcement_banner') || '',
        headerCtaText: map.get('header_cta_text') || 'Order Cylinder',
        headerCtaLink: map.get('header_cta_link') || '/dashboard/orders/new',
        bankAccountName: map.get('bank_account_name') || '',
        bankName: map.get('bank_name') || '',
        bankAccountNumber: map.get('bank_account_number') || '',
        bankIfsc: map.get('bank_ifsc') || '',
        bankBranch: map.get('bank_branch') || '',
        upiId: map.get('upi_id') || '',
        upiDisplayName: map.get('upi_display_name') || '',
        paymentReminderHours: Number(map.get('payment_reminder_hours') || 24),
        deliveryStuckAlertMinutes: Number(map.get('delivery_stuck_alert_minutes') || 10),
        rawSettings: settingsList,
      };

      ApiResponse.success(res, structured, 'Agency settings retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update or upsert an agency setting (supports single key/value or full AgencySettings object)
   */
  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.body.key && req.body.value !== undefined) {
        const { key, value, description } = req.body;
        let settingValue = String(value);

        if (['tax_percentage', 'welcome_offer_amount', 'delivery_charge_default'].includes(key)) {
          if (typeof value !== 'number' && typeof value !== 'string') {
            throw new BadRequestError('This setting must be a valid non-negative number.');
          }
          if (typeof value === 'string' && !value.trim()) {
            throw new BadRequestError('This setting must be a valid non-negative number.');
          }
          const parsedValue = typeof value === 'string' ? Number(value.trim()) : value;
          const max = key === 'tax_percentage' ? 100 : Number.POSITIVE_INFINITY;
          if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > max) {
            throw new BadRequestError(
              key === 'tax_percentage'
                ? 'Tax percentage must be between 0 and 100.'
                : 'This setting must be a valid non-negative number.'
            );
          }
          settingValue = String(parsedValue);
        }

        if (key === 'welcome_offer_enabled') {
          if (value !== true && value !== false && value !== 'true' && value !== 'false') {
            throw new BadRequestError('Welcome offer enabled must be true or false.');
          }
          settingValue = String(value);
        }

        const setting = await prisma.$transaction(async (tx) => {
          const updated = await tx.agencySetting.upsert({
            where: { key },
            update: {
              value: settingValue,
              ...(description !== undefined && { description }),
            },
            create: {
              key,
              value: settingValue,
              description,
            },
          });
          await recordAuditLog(tx, {
            userId: req.user!.id,
            action: 'AGENCY_SETTING_UPDATE',
            entity: 'AgencySetting',
            entityId: updated.id,
            details: `Updated setting "${key}".`,
            ipAddress: req.ip,
          });
          return updated;
        });
        ApiResponse.success(res, setting, 'Setting updated successfully');
        return;
      }

      // Bulk AgencySettings update
      const b = req.body;
      const updates: Array<{ key: string; value: string; description?: string }> = [];

      if (b.agencyName !== undefined) updates.push({ key: 'agency_name', value: String(b.agencyName) });
      if (b.primaryPhone !== undefined) updates.push({ key: 'contact_phone_1', value: String(b.primaryPhone) });
      if (b.secondaryPhone !== undefined) updates.push({ key: 'contact_phone_2', value: String(b.secondaryPhone) });
      if (b.email !== undefined) updates.push({ key: 'agency_email', value: String(b.email) });
      if (b.address !== undefined) updates.push({ key: 'agency_address', value: String(b.address) });
      if (b.deliveryAreas !== undefined) {
        const areasStr = Array.isArray(b.deliveryAreas) ? b.deliveryAreas.join(', ') : String(b.deliveryAreas);
        updates.push({ key: 'service_areas', value: areasStr });
      }
      if (b.deliveryCharges !== undefined) {
        const deliveryCharges = Number(b.deliveryCharges);
        if (!Number.isFinite(deliveryCharges) || deliveryCharges < 0) {
          throw new BadRequestError('Delivery charge must be a non-negative number.');
        }
        updates.push({ key: 'delivery_charge_default', value: String(deliveryCharges) });
      }
      if (b.taxPercentage !== undefined) {
        const taxPercentage = Number(b.taxPercentage);
        if (!Number.isFinite(taxPercentage) || taxPercentage < 0 || taxPercentage > 100) {
          throw new BadRequestError('Tax percentage must be between 0 and 100.');
        }
        updates.push({ key: 'tax_percentage', value: String(taxPercentage) });
      }
      if (b.onlinePaymentFee !== undefined) {
        const fee = Number(b.onlinePaymentFee);
        if (!Number.isFinite(fee) || fee < 0 || fee > 100) {
          throw new BadRequestError('Online payment fee must be between 0 and 100.');
        }
        updates.push({ key: 'online_payment_fee', value: String(fee) });
      }
      if (b.welcomeOfferEnabled !== undefined && typeof b.welcomeOfferEnabled !== 'boolean') {
        throw new BadRequestError('Welcome offer enabled must be true or false.');
      }
      if (b.welcomeOfferEnabled !== undefined) {
        updates.push({ key: 'welcome_offer_enabled', value: String(Boolean(b.welcomeOfferEnabled)) });
      }
      if (b.welcomeOfferAmount !== undefined) {
        const amount = Number(b.welcomeOfferAmount);
        if (!Number.isFinite(amount) || amount < 0) {
          throw new BadRequestError('Welcome offer amount must be a non-negative number.');
        }
        updates.push({ key: 'welcome_offer_amount', value: String(amount) });
      }
      if (b.businessHours !== undefined) updates.push({ key: 'support_hours', value: String(b.businessHours) });
      if (b.isOrderingEnabled !== undefined) {
        updates.push({ key: 'is_ordering_enabled', value: String(Boolean(b.isOrderingEnabled)) });
      }

      // CMS & Website Fields
      if (b.heroHeadline !== undefined) updates.push({ key: 'hero_headline', value: String(b.heroHeadline) });
      if (b.heroSubheadline !== undefined) updates.push({ key: 'hero_subheadline', value: String(b.heroSubheadline) });
      if (b.heroDescription !== undefined) updates.push({ key: 'hero_description', value: String(b.heroDescription) });
      if (b.heroPrimaryCtaText !== undefined) updates.push({ key: 'hero_primary_cta_text', value: String(b.heroPrimaryCtaText) });
      if (b.heroPrimaryCtaLink !== undefined) updates.push({ key: 'hero_primary_cta_link', value: String(b.heroPrimaryCtaLink) });
      if (b.heroSecondaryCtaText !== undefined) updates.push({ key: 'hero_secondary_cta_text', value: String(b.heroSecondaryCtaText) });
      if (b.heroSecondaryCtaLink !== undefined) updates.push({ key: 'hero_secondary_cta_link', value: String(b.heroSecondaryCtaLink) });
      if (b.heroImageUrl !== undefined) updates.push({ key: 'hero_image_url', value: String(b.heroImageUrl) });
      if (b.cylinderSectionTitle !== undefined) updates.push({ key: 'cylinder_section_title', value: String(b.cylinderSectionTitle) });
      if (b.cylinderSectionSubtitle !== undefined) updates.push({ key: 'cylinder_section_subtitle', value: String(b.cylinderSectionSubtitle) });
      if (b.announcementBanner !== undefined) updates.push({ key: 'announcement_banner', value: String(b.announcementBanner) });
      if (b.headerCtaText !== undefined) updates.push({ key: 'header_cta_text', value: String(b.headerCtaText) });
      if (b.headerCtaLink !== undefined) updates.push({ key: 'header_cta_link', value: String(b.headerCtaLink) });
      if (b.bankAccountName !== undefined) updates.push({ key: 'bank_account_name', value: String(b.bankAccountName) });
      if (b.bankName !== undefined) updates.push({ key: 'bank_name', value: String(b.bankName) });
      if (b.bankAccountNumber !== undefined) updates.push({ key: 'bank_account_number', value: String(b.bankAccountNumber) });
      if (b.bankIfsc !== undefined) updates.push({ key: 'bank_ifsc', value: String(b.bankIfsc) });
      if (b.bankBranch !== undefined) updates.push({ key: 'bank_branch', value: String(b.bankBranch) });
      if (b.upiId !== undefined) updates.push({ key: 'upi_id', value: String(b.upiId) });
      if (b.upiDisplayName !== undefined) updates.push({ key: 'upi_display_name', value: String(b.upiDisplayName) });
      if (b.paymentReminderHours !== undefined) {
        const hours = Number(b.paymentReminderHours);
        if (!Number.isFinite(hours) || hours < 1 || hours > 720) {
          throw new BadRequestError('Payment reminder hours must be between 1 and 720.');
        }
        updates.push({ key: 'payment_reminder_hours', value: String(hours) });
      }
      if (b.deliveryStuckAlertMinutes !== undefined) {
        const minutes = Number(b.deliveryStuckAlertMinutes);
        if (!Number.isFinite(minutes) || minutes < 5 || minutes > 1440) {
          throw new BadRequestError('Delivery stuck alert minutes must be between 5 and 1440.');
        }
        updates.push({ key: 'delivery_stuck_alert_minutes', value: String(minutes) });
      }

      await prisma.$transaction(async (tx) => {
        for (const item of updates) {
          await tx.agencySetting.upsert({
            where: { key: item.key },
            update: { value: item.value },
            create: { key: item.key, value: item.value },
          });
        }
        await recordAuditLog(tx, {
          userId: req.user!.id,
          action: 'AGENCY_SETTINGS_UPDATE',
          entity: 'AgencySetting',
          entityId: 'configuration',
          details: `Updated settings: ${updates.map((setting) => setting.key).join(', ')}.`,
          ipAddress: req.ip,
        });
      });

      ApiResponse.success(res, b, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all contact enquiries
   */
  static async getContactEnquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enquiries = await (prisma as any).contactEnquiry.findMany({
        orderBy: { createdAt: 'desc' },
      });
      ApiResponse.success(res, enquiries, 'Contact enquiries retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update enquiry status (NEW -> REVIEWED -> RESOLVED)
   */
  static async updateEnquiryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await (prisma as any).contactEnquiry.update({
        where: { id },
        data: { status },
      });
      ApiResponse.success(res, updated, 'Enquiry status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin notifications
   */
  static async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.id;
      const notifications = await prisma.notification.findMany({
        where: { userId: adminId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      ApiResponse.success(res, notifications, 'Admin notifications retrieved');
    } catch (error) {
      next(error);
    }
  }
}
