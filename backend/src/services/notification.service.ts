import { NotificationType, Role } from '../constants/enums.js';
import prisma from '../config/database.js';

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    orderId?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        orderId: params.orderId,
      },
    });
  }

  /**
   * Send notification to all active administrators
   */
  static async notifyAdmins(params: {
    title: string;
    message: string;
    type?: NotificationType;
    orderId?: string;
  }) {
    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN, isActive: true },
      select: { id: true },
    });

    if (admins.length === 0) return;

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: params.title,
        message: params.message,
        type: params.type || NotificationType.SYSTEM,
        orderId: params.orderId,
      })),
    });
  }

  /**
   * Get notifications for a user with pagination
   */
  static async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return { notifications, total };
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications for a user as read
   */
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Get count of unread notifications for a user
   */
  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
