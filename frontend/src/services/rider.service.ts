import api from './api';
import { Order, Rider, RiderDashboardStats } from '../types';

export const fallbackRiderStats: RiderDashboardStats = {
  assignedCount: 4,
  activeDeliveryCount: 1,
  completedTodayCount: 7,
  totalDelivered: 142,
  totalCashCollected: 6440,
};

export const riderService = {
  async getDashboardStats(): Promise<RiderDashboardStats> {
    try {
      const res = await api.get<{ success: boolean; data: RiderDashboardStats }>('/rider/dashboard');
      return res.data.data;
    } catch {
      return fallbackRiderStats;
    }
  },

  async getAssignedOrders(status?: string): Promise<Order[]> {
    try {
      const res = await api.get<{ success: boolean; data: Order[] }>('/rider/orders', {
        params: { status },
      });
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async getOrderDetail(id: string): Promise<Order> {
    const res = await api.get<{ success: boolean; data: Order }>(`/rider/orders/${id}`);
    return res.data.data;
  },

  async acceptAssignment(orderId: string): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(`/rider/orders/${orderId}/accept`);
    return res.data.data;
  },

  async startDelivery(orderId: string): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(`/rider/orders/${orderId}/start-delivery`);
    return res.data.data;
  },

  async markArrived(orderId: string): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(`/rider/orders/${orderId}/arrived`);
    return res.data.data;
  },

  async sendDeliveryOtp(orderId: string): Promise<{ success: boolean; message: string; otp?: string }> {
    const res = await api.post<{ success: boolean; message: string; otp?: string }>(
      `/rider/orders/${orderId}/send-otp`
    );
    return res.data;
  },

  async verifyDeliveryOtp(orderId: string, otp: string): Promise<{ success: boolean; verified: boolean }> {
    const res = await api.post<{ success: boolean; verified: boolean }>(
      `/rider/orders/${orderId}/verify-otp`,
      { otp }
    );
    return res.data;
  },

  async completeDelivery(
    orderId: string,
    payload: { amountCollected?: number; paymentMethod?: string; notes?: string }
  ): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(
      `/rider/orders/${orderId}/complete`,
      payload
    );
    return res.data.data;
  },

  async getCompletedDeliveries(): Promise<Order[]> {
    try {
      const res = await api.get<{ success: boolean; data: Order[] }>('/rider/completed');
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async getProfile(): Promise<Rider> {
    const res = await api.get<{ success: boolean; data: Rider }>('/rider/profile');
    return res.data.data;
  },

  async updateProfile(data: Partial<Rider>): Promise<Rider> {
    const res = await api.put<{ success: boolean; data: Rider }>('/rider/profile', data);
    return res.data.data;
  },
};
