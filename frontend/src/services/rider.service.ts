import api from './api';
import { Order, RiderDashboardStats } from '../types';
import { normalizeOrder } from '../utils/order';

export interface RiderProfileData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleNumber?: string;
  isActive: boolean;
}

interface RiderProfileResponse {
  id: string;
  vehicleNumber?: string;
  user: {
    name: string;
    phone: string;
    email?: string | null;
    isActive: boolean;
  };
}

export const riderService = {
  async getDashboardStats(): Promise<RiderDashboardStats> {
    const res = await api.get<{ success: boolean; data: RiderDashboardStats }>('/rider/dashboard');
    return res.data.data;
  },

  async getAssignedOrders(status?: string): Promise<Order[]> {
    const res = await api.get<{ success: boolean; data: Order[] }>('/rider/orders', {
      params: { status },
    });
    return (res.data.data || []).map(normalizeOrder);
  },

  async getOrderDetail(id: string): Promise<Order> {
    const res = await api.get<{ success: boolean; data: Order }>(`/rider/orders/${id}`);
    return normalizeOrder(res.data.data);
  },

  async acceptAssignment(orderId: string): Promise<Order> {
    const res = await api.put<{ success: boolean; data: Order }>(`/rider/orders/${orderId}/accept`);
    return normalizeOrder(res.data.data);
  },

  async startDelivery(orderId: string): Promise<Order> {
    const res = await api.put<{ success: boolean; data: Order }>(`/rider/orders/${orderId}/out-for-delivery`);
    return normalizeOrder(res.data.data);
  },

  async markArrived(orderId: string): Promise<Order> {
    const res = await api.put<{ success: boolean; data: Order }>(`/rider/orders/${orderId}/arrived`);
    return normalizeOrder(res.data.data);
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
    orderId: string
  ): Promise<Order> {
    const res = await api.put<{ success: boolean; data: Order }>(`/rider/orders/${orderId}/complete`);
    return normalizeOrder(res.data.data);
  },

  async collectCash(orderId: string, amount: number): Promise<void> {
    await api.put(`/rider/orders/${orderId}/collect-payment`, { amount });
  },

  async getCompletedDeliveries(): Promise<Order[]> {
    const res = await api.get<{ success: boolean; data: Order[] }>('/rider/completed');
    return (res.data.data || []).map(normalizeOrder);
  },

  async getProfile(): Promise<RiderProfileData> {
    const res = await api.get<{ success: boolean; data: RiderProfileResponse }>('/rider/profile');
    const profile = res.data.data;
    return {
      id: profile.id,
      name: profile.user.name,
      phone: profile.user.phone,
      email: profile.user.email || undefined,
      vehicleNumber: profile.vehicleNumber,
      isActive: profile.user.isActive,
    };
  },
};
