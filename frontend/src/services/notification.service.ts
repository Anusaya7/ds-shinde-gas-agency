import api from './api';
import { AppNotification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    const res = await api.get<{ success: boolean; data: AppNotification[] }>('/notifications');
    if (!Array.isArray(res.data.data)) throw new Error('The notifications response was invalid.');
    return res.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};
