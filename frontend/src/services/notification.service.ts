import api from './api';
import { AppNotification } from '../types';

export const fallbackNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New Cylinder Order Placed',
    message: 'Order #DS-2026-1049 placed for 14.2 kg Domestic cylinder.',
    type: 'ORDER',
    isRead: false,
    linkUrl: '/admin/orders',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Stock Alert: 19 kg Commercial',
    message: 'Commercial cylinder inventory count is below 30 units.',
    type: 'ALERT',
    isRead: false,
    linkUrl: '/admin/products',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'System Delivery Completed',
    message: 'Rider Rajesh Kumar delivered order #DS-2026-1042 successfully.',
    type: 'SYSTEM',
    isRead: true,
    linkUrl: '/admin/orders',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const res = await api.get<{ success: boolean; data: AppNotification[] }>('/notifications');
      return res.data.data || fallbackNotifications;
    } catch {
      return fallbackNotifications;
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // ignore
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // ignore
    }
  },
};
