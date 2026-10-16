import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '../constants/enums.js';
import prisma from '../config/database.js';
import { DeliveryService } from '../services/delivery.service.js';
import { PaymentService } from '../services/payment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class RiderController {
  static async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rider = await prisma.rider.findUnique({ where: { userId: req.user!.id } });
      if (!rider) throw new NotFoundError('Rider profile not found');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeStatuses: OrderStatus[] = [
        OrderStatus.RIDER_ASSIGNED,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.ARRIVED,
        OrderStatus.OTP_PENDING,
      ];
      const [assignedCount, activeDeliveryCount, completedTodayCount, totalDelivered, cashAggregate] =
        await Promise.all([
          prisma.order.count({ where: { riderId: rider.id, status: OrderStatus.RIDER_ASSIGNED } }),
          prisma.order.count({
            where: { riderId: rider.id, status: { in: activeStatuses.filter((status) => status !== OrderStatus.RIDER_ASSIGNED) } },
          }),
          prisma.order.count({
            where: { riderId: rider.id, status: OrderStatus.DELIVERED, deliveredAt: { gte: today } },
          }),
          prisma.order.count({ where: { riderId: rider.id, status: OrderStatus.DELIVERED } }),
          prisma.payment.aggregate({
            where: {
              collectedById: req.user!.id,
              status: 'PAID',
              method: 'COD',
              createdAt: { gte: today },
            },
            _sum: { amount: true },
          }),
        ]);

      ApiResponse.success(res, {
        assignedCount,
        activeDeliveryCount,
        completedTodayCount,
        totalDelivered,
        totalCashCollected: Number(cashAggregate._sum.amount || 0),
      }, 'Rider dashboard statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active orders assigned to the logged-in rider
   */
  static async getAssignedOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const rider = await prisma.rider.findUnique({
        where: { userId: riderUserId },
      });

      if (!rider) {
        throw new NotFoundError('Rider profile not found');
      }

      const activeStatuses: OrderStatus[] = [
        OrderStatus.RIDER_ASSIGNED,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.ARRIVED,
        OrderStatus.OTP_PENDING,
      ];

      const orders = await prisma.order.findMany({
        where: {
          riderId: rider.id,
          status: { in: activeStatuses },
        },
        include: {
          items: true,
          payments: true,
          deliveryOtp: {
            select: {
              isUsed: true,
              attempts: true,
              expiresAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      ApiResponse.success(res, orders, 'Assigned orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific order details for rider
   */
  static async getOrderDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const { id } = req.params;

      const rider = await prisma.rider.findUnique({
        where: { userId: riderUserId },
      });

      if (!rider) {
        throw new NotFoundError('Rider profile not found');
      }

      const order = await prisma.order.findFirst({
        where: {
          id,
          riderId: rider.id,
        },
        include: {
          items: true,
          payments: true,
          customer: {
            select: { name: true, phone: true, email: true },
          },
          deliveryOtp: {
            select: {
              isUsed: true,
              attempts: true,
              expiresAt: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundError('Order not found or not assigned to you');
      }

      ApiResponse.success(res, order, 'Order details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept assigned order
   */
  static async acceptAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const { id } = req.params;

      const order = await DeliveryService.acceptAssignment(id, riderUserId);
      ApiResponse.success(res, order, 'Order assignment accepted');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject assigned order
   */
  static async rejectAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        throw new BadRequestError('Reason is required to reject an order assignment');
      }

      const order = await DeliveryService.rejectAssignment(id, riderUserId, reason);
      ApiResponse.success(res, order, 'Order assignment declined');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark order out for delivery
   */
  static async markOutForDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const { id } = req.params;

      const order = await DeliveryService.markOutForDelivery(id, riderUserId);
      ApiResponse.success(res, order, 'Order marked out for delivery');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark arrived at customer location
   */
  static async markArrived(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const { id } = req.params;

      const order = await DeliveryService.markArrived(id, riderUserId);
      ApiResponse.success(res, order, 'Marked arrived at customer destination');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request Delivery OTP to be dispatched to customer
   */
  static async sendDeliveryOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const { id } = req.params;

      const result = await DeliveryService.sendDeliveryOtp(id, riderUserId);
      ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Delivery OTP given by customer
   */
  static async verifyDeliveryOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const { id } = req.params;
      const { otp } = req.body;

      if (!otp) {
        throw new BadRequestError('OTP is required for verification');
      }

      const result = await DeliveryService.verifyDeliveryOtp(id, riderUserId, otp);
      ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark order delivery completed
   */
  static async completeDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const { id } = req.params;

      const order = await DeliveryService.completeDelivery(id, riderUserId);
      ApiResponse.success(res, order, 'Delivery completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record COD payment collection
   */
  static async collectPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const { id } = req.params;
      const { amount, transactionId } = req.body;

      const payment = await PaymentService.recordCodPayment({
        orderId: id,
        riderUserId,
        amount: amount ? Number(amount) : undefined,
        transactionId,
      });

      ApiResponse.success(res, payment, 'Payment recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rider profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;

      const rider = await prisma.rider.findUnique({
        where: { userId: riderUserId },
        include: {
          user: {
            select: { name: true, phone: true, email: true, isActive: true },
          },
        },
      });

      if (!rider) {
        throw new NotFoundError('Rider profile not found');
      }

      ApiResponse.success(res, rider, 'Rider profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Completed deliveries history for rider
   */
  static async getCompletedDeliveries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riderUserId = req.user!.id;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const skip = (page - 1) * limit;

      const rider = await prisma.rider.findUnique({
        where: { userId: riderUserId },
      });

      if (!rider) {
        throw new NotFoundError('Rider profile not found');
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: {
            riderId: rider.id,
            status: OrderStatus.DELIVERED,
          },
          include: {
            items: true,
            payments: true,
          },
          orderBy: { deliveredAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.order.count({
          where: {
            riderId: rider.id,
            status: OrderStatus.DELIVERED,
          },
        }),
      ]);

      ApiResponse.paginated(res, orders, total, page, limit, 'Completed deliveries');
    } catch (error) {
      next(error);
    }
  }
}
