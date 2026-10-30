import { NotificationType, OrderStatus, PaymentStatus } from '../constants/enums.js';
import prisma from '../config/database.js';
import { NotificationService } from './notification.service.js';

const REMINDER_INTERVAL_MS = 2 * 24 * 60 * 60 * 1000;

async function getSettingNumber(key: string, fallback: number): Promise<number> {
  const row = await prisma.agencySetting.findUnique({ where: { key } });
  const parsed = Number(row?.value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function recentlyNotified(orderId: string, title: string, withinMs: number): Promise<boolean> {
  const since = new Date(Date.now() - withinMs);
  const existing = await prisma.notification.findFirst({
    where: {
      orderId,
      title,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export class ReminderService {
  static async dispatchDueReminders(now = new Date()): Promise<{
    sent: number;
    paymentReminders: number;
    stuckDeliveryAlerts: number;
  }> {
    const refill = await this.dispatchRefillReminders(now);
    const paymentReminders = await this.dispatchPendingPaymentReminders(now);
    const stuckDeliveryAlerts = await this.dispatchStuckDeliveryAlerts(now);
    return {
      sent: refill + paymentReminders + stuckDeliveryAlerts,
      paymentReminders,
      stuckDeliveryAlerts,
    };
  }

  private static async dispatchRefillReminders(now: Date): Promise<number> {
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
      const message =
        'It has been two days since your DS Shinde Gas cylinder delivery. Need a refill? Sign in to your customer dashboard to book your next LPG cylinder.';

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
    return sent;
  }

  private static async dispatchPendingPaymentReminders(now: Date): Promise<number> {
    const hours = await getSettingNumber('payment_reminder_hours', 24);
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const windowMs = hours * 60 * 60 * 1000;

    const unpaid = await prisma.order.findMany({
      where: {
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
        status: {
          in: [
            OrderStatus.ACCEPTED,
            OrderStatus.RIDER_ASSIGNED,
            OrderStatus.OUT_FOR_DELIVERY,
            OrderStatus.ARRIVED,
            OrderStatus.OTP_PENDING,
          ],
        },
        updatedAt: { lte: cutoff },
      },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        totalAmount: true,
      },
      take: 50,
    });

    let sent = 0;
    for (const order of unpaid) {
      const title = 'Pending payment reminder';
      if (await recentlyNotified(order.id, title, windowMs)) continue;

      await NotificationService.createNotification({
        userId: order.customerId,
        title,
        message: `Your booking ${order.orderNumber} still has ₹${order.totalAmount} pending. Please pay online from My Orders or settle with the delivery rider.`,
        type: NotificationType.PAYMENT,
        orderId: order.id,
      });
      sent += 1;
    }
    return sent;
  }

  private static async dispatchStuckDeliveryAlerts(now: Date): Promise<number> {
    const minutes = await getSettingNumber('delivery_stuck_alert_minutes', 10);
    const cutoff = new Date(now.getTime() - minutes * 60 * 1000);
    const windowMs = minutes * 60 * 1000;

    const active = await prisma.order.findMany({
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
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        rider: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
      take: 80,
    });

    let sent = 0;
    for (const order of active) {
      const lastUpdate = order.statusHistory[0]?.createdAt || order.updatedAt;
      if (lastUpdate > cutoff) continue;

      const title = 'Delivery update missing';
      if (await recentlyNotified(order.id, title, windowMs)) continue;

      const riderLabel = order.rider?.user?.name
        ? `${order.rider.user.name} (${order.rider.user.phone || 'no phone'})`
        : 'Unassigned rider';

      await NotificationService.notifyAdmins({
        title,
        message: `No delivery status update for ${order.orderNumber} in ${minutes}+ minutes. Rider: ${riderLabel}. Current status: ${order.status}.`,
        type: NotificationType.DELIVERY,
        orderId: order.id,
      });
      sent += 1;
    }
    return sent;
  }
}
