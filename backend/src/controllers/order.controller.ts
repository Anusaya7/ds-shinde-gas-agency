import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '../constants/enums.js';
import { OrderService } from '../services/order.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class OrderController {
  /**
   * Create new cylinder booking order
   */
  static async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user!.id;
      const result = await OrderService.createOrder(customerId, req.body);
      ApiResponse.created(res, result, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List orders for the authenticated customer
   */
  static async listCustomerOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user!.id;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const status = req.query.status as OrderStatus | undefined;

      const { orders, total } = await OrderService.getCustomerOrders(customerId, page, limit, status);

      ApiResponse.paginated(res, orders, total, page, limit, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer order details
   */
  static async getOrderDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user!.id;
      const { id } = req.params;

      const order = await OrderService.getCustomerOrderDetail(id, customerId);
      ApiResponse.success(res, order, 'Order details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Track order delivery progression
   */
  static async trackOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const tracking = await OrderService.getOrderTracking(id, userId, userRole);
      ApiResponse.success(res, tracking, 'Order tracking details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;
      const { reason } = req.body;

      const cancelledOrder = await OrderService.cancelOrder(
        id,
        userId,
        role,
        reason || 'Cancelled by user request'
      );

      ApiResponse.success(res, cancelledOrder, 'Order cancelled successfully');
    } catch (error) {
      next(error);
    }
  }
}
