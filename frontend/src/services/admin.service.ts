import api from './api';
import {
  Order,
  Rider,
  User,
  Product,
  DashboardStats,
  AgencySettings,
  ReportItem,
  OrderStatus,
} from '../types';
import { normalizeOrder } from '../utils/order';

export const fallbackSettings: AgencySettings = {
  agencyName: 'DS Shinde Gas',
  primaryPhone: '9511760208',
  secondaryPhone: '9975300929',
  email: 'support@dsshindegas.com',
  address: 'Shop No. 4, Main Road, Near Market Yard, Maharashtra, India',
  deliveryAreas: ['Karad', 'Malkapur', 'Ogalewadi', 'Saidapur', 'Vidyanagar', 'Wathar'],
  deliveryCharges: 50,
  taxPercentage: 0,
  welcomeOfferEnabled: false,
  welcomeOfferAmount: 0,
  isOrderingEnabled: true,
  businessHours: '8:00 AM - 8:00 PM (Monday to Saturday)',
  heroHeadline: 'Your Trusted LPG Gas Partner',
  heroSubheadline: 'Reliable LPG Cylinder Solutions for Home and Business',
  heroDescription: 'Explore cylinder capacities, place your order conveniently and manage your delivery through a simple ordering experience.',
  heroPrimaryCtaText: 'Order a Cylinder',
  heroPrimaryCtaLink: '/dashboard/orders/new',
  heroSecondaryCtaText: 'Explore Cylinder Sizes',
  heroSecondaryCtaLink: '/#cylinder-gallery',
  heroImageUrl: '/assets/cylinders/hero-cylinder.jpg',
  cylinderSectionTitle: 'Explore Our LPG Cylinder Sizes',
  cylinderSectionSubtitle: 'Choose a cylinder capacity that matches your requirements.',
  announcementBanner: '',
  headerCtaText: 'Order Cylinder',
  headerCtaLink: '/dashboard/orders/new',
};

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<{ success: boolean; data: DashboardStats & {
      totalCustomers?: number;
      totalRiders?: number;
      availableRiders?: number;
    } }>('/admin/dashboard');
    return {
      ...res.data.data,
      activeCustomersCount: res.data.data.totalCustomers ?? 0,
      activeRidersCount: res.data.data.availableRiders ?? 0,
    };
  },

  async getOrders(params?: {
    search?: string;
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    const res = await api.get<{
      success: boolean;
      data: Order[];
      meta?: { total: number };
    }>('/admin/orders', { params });
    return {
      orders: (res.data.data || []).map(normalizeOrder),
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await api.get<{ success: boolean; data: Order }>(`/admin/orders/${id}`);
    return normalizeOrder(res.data.data);
  },

  async acceptOrder(id: string): Promise<Order> {
    const res = await api.put<{ success: boolean; data: Order }>(`/admin/orders/${id}/accept`);
    return normalizeOrder(res.data.data);
  },

  async rejectOrder(id: string, reason: string): Promise<Order> {
    const res = await api.put<{ success: boolean; data: Order }>(`/admin/orders/${id}/reject`, { reason });
    return normalizeOrder(res.data.data);
  },

  async assignRider(orderId: string, riderId: string): Promise<Order> {
    const res = await api.put<{ success: boolean; data: Order }>(`/admin/orders/${orderId}/assign-rider`, {
      riderId,
    });
    return normalizeOrder(res.data.data);
  },

  async cancelOrder(id: string, reason: string): Promise<Order> {
    const res = await api.put<{ success: boolean; data: Order }>(`/admin/orders/${id}/cancel`, { reason });
    return normalizeOrder(res.data.data);
  },

  async getRiders(): Promise<Rider[]> {
    const res = await api.get<{ success: boolean; data: Array<Rider & {
      userId?: string;
      isAvailable?: boolean;
      activeOrdersCount?: number;
    }> }>('/admin/riders');
    return (res.data.data || []).map((rider) => ({
      ...rider,
      assignedOrdersCount: rider.activeOrdersCount ?? 0,
      completedOrdersCount: rider.completedOrdersCount ?? 0,
    }));
  },

  async updateRider(id: string, data: Partial<Rider>): Promise<Rider> {
    const res = await api.put<{ success: boolean; data: Rider }>(`/admin/riders/${id}`, data);
    return res.data.data;
  },

  async toggleRiderStatus(id: string): Promise<Rider> {
    const res = await api.put<{ success: boolean; data: Rider }>(`/admin/riders/${id}/toggle-status`);
    return res.data.data;
  },

  async getCustomers(params?: { search?: string; page?: number; limit?: number }): Promise<{ customers: User[]; total: number }> {
    const res = await api.get<{ success: boolean; data: User[]; meta?: { total: number } }>('/admin/customers', { params });
    return {
      customers: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },

  async getCustomerById(id: string): Promise<{ customer: User; orders: Order[] }> {
    const res = await api.get<{ success: boolean; data: { customer: User; orders: Order[] } }>(`/admin/customers/${id}`);
    return res.data.data;
  },

  async getProducts(): Promise<Product[]> {
    const res = await api.get<{ success: boolean; data: Product[] }>('/admin/products');
    return res.data.data;
  },

  async addProduct(data: Omit<Product, 'id'>): Promise<Product> {
    const res = await api.post<{ success: boolean; data: Product }>('/admin/products', data);
    return res.data.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await api.put<{ success: boolean; data: Product }>(`/admin/products/${id}`, data);
    return res.data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },

  async getReports(params?: { startDate?: string; endDate?: string }): Promise<ReportItem[]> {
    try {
      const res = await api.get<{ success: boolean; data: ReportItem[] }>('/admin/reports/orders', { params });
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async getSettings(): Promise<AgencySettings> {
    const res = await api.get<any>('/admin/settings');
    const raw = res.data.data;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error('Agency settings response is invalid.');
    }
    return {
      ...fallbackSettings,
      ...raw,
      deliveryAreas: Array.isArray(raw.deliveryAreas) ? raw.deliveryAreas : fallbackSettings.deliveryAreas,
    };
  },

  async getPublicSettings(): Promise<AgencySettings> {
    const res = await api.get<any>('/settings/public');
    const raw = res.data?.data;
    if (!raw || typeof raw !== 'object') {
      throw new Error('Public settings response is invalid.');
    }
    return {
      ...fallbackSettings,
      ...raw,
      deliveryAreas: Array.isArray(raw.deliveryAreas) ? raw.deliveryAreas : fallbackSettings.deliveryAreas,
    };
  },

  async updateSettings(data: Partial<AgencySettings>): Promise<AgencySettings> {
    const res = await api.put<any>('/admin/settings', data);
    return res.data.data;
  },

  async submitContact(data: { name: string; phone: string; email?: string; subject?: string; message: string }): Promise<any> {
    const res = await api.post('/contact', data);
    return res.data;
  },

  async getEnquiries(): Promise<any[]> {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/admin/enquiries');
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  async updateEnquiryStatus(id: string, status: string): Promise<any> {
    const res = await api.put(`/admin/enquiries/${id}/status`, { status });
    return res.data;
  },
};
