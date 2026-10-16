import api from './api';
import { Order, OrderStatus, PaymentMethod, Address, OrderItem } from '../types';
import { normalizeOrder } from '../utils/order';

export interface CreateOrderPayload {
  deliveryAddress: Address;
  items: Array<{
    productId: string;
    productName: string;
    size: string;
    unitPrice: number;
    quantity: number;
  }>;
  paymentMethod: PaymentMethod;
  bookingDurationDays: number;
  remindersEnabled: boolean;
  fsiNumber?: string;
  notes?: string;
}

export interface GetOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export const orderService = {
  async createOrder(data: CreateOrderPayload): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>('/orders', {
      ...data,
      deliveryName: data.deliveryAddress.fullName,
      deliveryPhone: data.deliveryAddress.phone,
      deliveryAltPhone: data.deliveryAddress.altPhone,
      deliveryAddress: data.deliveryAddress.addressLine1,
      deliveryArea: data.deliveryAddress.area,
      deliveryCity: data.deliveryAddress.city,
      deliveryState: data.deliveryAddress.state,
      deliveryPinCode: data.deliveryAddress.pincode,
      deliveryLandmark: data.deliveryAddress.landmark,
      deliveryMapLink: data.deliveryAddress.mapLink,
      items: data.items.map(({ productId, quantity }) => ({ productId, quantity })),
    });
    return normalizeOrder(res.data.data);
  },

  async getOrders(params?: {
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }): Promise<GetOrdersResponse> {
    const res = await api.get<{
      success: boolean;
      data: Order[];
      meta?: { total: number; page: number; totalPages: number };
    }>('/orders', { params });

    return {
      orders: (res.data.data || []).map(normalizeOrder),
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
      page: res.data.meta?.page || 1,
      totalPages: res.data.meta?.totalPages || 1,
    };
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return normalizeOrder(res.data.data);
  },

  async getOrderTracking(id: string): Promise<Order> {
    const [orderResponse, trackingResponse] = await Promise.all([
      api.get<{ success: boolean; data: any }>(`/orders/${id}`),
      api.get<{ success: boolean; data: any }>(`/orders/${id}/track`),
    ]);
    const tracking = trackingResponse.data.data;
    return normalizeOrder({
      ...orderResponse.data.data,
      status: tracking.currentStatus,
      statusHistory: tracking.history,
      riderName: tracking.rider?.name,
      riderPhone: tracking.rider?.phone,
      deliveredAt: tracking.deliveredAt,
      estimatedDelivery: tracking.estimatedDelivery,
    });
  },

  async cancelOrder(id: string, reason: string): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(`/orders/${id}/cancel`, { reason });
    return normalizeOrder(res.data.data);
  },

  async updateReminderPreference(id: string, enabled: boolean): Promise<Order> {
    const res = await api.patch<{ success: boolean; data: Order }>(`/orders/${id}/reminders`, { enabled });
    return normalizeOrder(res.data.data);
  },
};
