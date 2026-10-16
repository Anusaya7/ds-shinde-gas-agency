import { NotificationType, OrderStatus } from '../constants/enums.js';
import prisma from '../config/database.js';

const REMINDER_INTERVAL_MS = 2 * 24 * 60 * 60 * 1000;

export class ReminderService {
  static async dispatchDueReminders(now = new Date()): Promise<{ sent: number }> {
    const dueOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        remindersEnabled: true,
        nextReminderAt: { lte: now },
        remindersEndAt: { gt: now },
      },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        nextReminderAt: true,
        remindersEndAt: true,
      },
      orderBy: { nextReminderAt: 'asc' },
      take: 100,
    });

    let sent = 0;
    for (const order of dueOrders) {
      if (!order.nextReminderAt || !order.remindersEndAt) continue;
      const scheduledAt = order.nextReminderAt;
      const nextReminderAt = new Date(scheduledAt.getTime() + REMINDER_INTERVAL_MS);
      const keepReminding = nextReminderAt < order.remindersEndAt;
      const message = `It has been two days since your DS Shinde Gas cylinder delivery. Need a refill? Sign in to your customer dashboard to book your next LPG cylinder.`;

      const claimed = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.updateMany({
          where: {
            id: order.id,
            status: OrderStatus.DELIVERED,
            remindersEnabled: true,
            nextReminderAt: scheduledAt,
            remindersEndAt: { gt: now },
          },
          data: { nextReminderAt: keepReminding ? nextReminderAt : null },
        });
        if (updated.count !== 1) return false;

        await tx.notification.create({
          data: {
            userId: order.customerId,
            title: 'Your LPG refill reminder',
            message,
            type: NotificationType.DELIVERY,
            orderId: order.id,
          },
        });
        return true;
      });

      if (!claimed) continue;
      sent += 1;
    }
    return { sent };
  }
}
