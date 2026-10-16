import api from './api';
import { Order, OrderStatus, PaymentMethod, Address, OrderItem } from '../types';

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
  notes?: string;
}

export interface GetOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export interface QuickBookPayload {
  customerName: string;
  phone: string;
  email?: string;
  sizeKg?: number;
  productId?: string;
  quantity: number;
  deliveryAddress: string;
  deliveryArea: string;
  deliveryCity: string;
  deliveryPinCode: string;
  deliveryLandmark?: string;
  paymentMethod: PaymentMethod | 'COD' | 'ONLINE';
  notes?: string;
}

export interface QuickBookResponse {
  order: any;
  orderNumber: string;
  orderId: string;
  productName: string;
  sizeKg: number;
  totalAmount: number;
  trackingUrl: string;
  customerPhone: string;
  customerEmail: string;
}

export const orderService = {
  async quickBook(data: QuickBookPayload): Promise<QuickBookResponse> {
    const res = await api.post<{ success: boolean; data: QuickBookResponse }>('/orders/quick-book', data);
    return res.data.data;
  },
  async createOrder(data: CreateOrderPayload): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>('/orders', data);
    return res.data.data;
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
      orders: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
      page: res.data.meta?.page || 1,
      totalPages: res.data.meta?.totalPages || 1,
    };
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return res.data.data;
  },

  async getOrderTracking(id: string): Promise<Order> {
    const res = await api.get<{ success: boolean; data: Order }>(`/orders/${id}/tracking`);
    return res.data.data;
  },

  async cancelOrder(id: string, reason: string): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(`/orders/${id}/cancel`, { reason });
    return res.data.data;
  },
};
