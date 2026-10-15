import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class NotificationController {
  /**
   * Get paginated notifications for current user
   */
  static async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const { notifications, total } = await NotificationService.getUserNotifications(
        userId,
        page,
        limit
      );

      ApiResponse.paginated(res, notifications, total, page, limit, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark single notification as read
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await NotificationService.markAsRead(id, userId);
      ApiResponse.success(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      await NotificationService.markAllAsRead(userId);
      ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const count = await NotificationService.getUnreadCount(userId);
      ApiResponse.success(res, { count }, 'Unread notifications count');
    } catch (error) {
      next(error);
    }
  }
}
