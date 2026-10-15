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

export const fallbackAdminStats: DashboardStats = {
  totalOrders: 284,
  newOrders: 14,
  awaitingReview: 9,
  accepted: 18,
  outForDelivery: 12,
  delivered: 235,
  cancelled: 10,
  rejected: 5,
  pendingPayments: 7,
  totalCollected: 248650,
  activeRidersCount: 8,
  activeCustomersCount: 192,
};

export const fallbackSettings: AgencySettings = {
  agencyName: 'D.S SHINDE GAS AGENCY',
  primaryPhone: '9511760208',
  secondaryPhone: '9975300929',
  email: 'support@dsshindegas.com',
  address: 'Shop No. 4, Main Road, Near Market Yard, Maharashtra, India',
  deliveryAreas: ['Central City', 'East Suburb', 'Industrial Area', 'Market Ward', 'North Colony', 'South Avenue'],
  deliveryCharges: 0,
  taxPercentage: 5,
  onlinePaymentFee: 0,
  cardPaymentFee: 15,
  codPaymentFee: 0,
  isOrderingEnabled: true,
  businessHours: '8:00 AM - 8:00 PM (Mon - Sun)',
};

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await api.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard');
      return res.data.data;
    } catch {
      return fallbackAdminStats;
    }
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
    try {
      const res = await api.get<{
        success: boolean;
        data: Order[];
        meta?: { total: number };
      }>('/admin/orders', { params });
      return {
        orders: res.data.data || [],
        total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
      };
    } catch {
      return { orders: [], total: 0 };
    }
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await api.get<{ success: boolean; data: Order }>(`/admin/orders/${id}`);
    return res.data.data;
  },

  async acceptOrder(id: string): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(`/admin/orders/${id}/accept`);
    return res.data.data;
  },

  async rejectOrder(id: string, reason: string): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(`/admin/orders/${id}/reject`, { reason });
    return res.data.data;
  },

  async assignRider(orderId: string, riderId: string): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(`/admin/orders/${orderId}/assign-rider`, {
      riderId,
    });
    return res.data.data;
  },

  async cancelOrder(id: string, reason: string): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>(`/admin/orders/${id}/cancel`, { reason });
    return res.data.data;
  },

  async getRiders(): Promise<Rider[]> {
    try {
      const res = await api.get<{ success: boolean; data: Rider[] }>('/admin/riders');
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async addRider(data: { name: string; phone: string; email?: string; vehicleNumber?: string; password?: string }): Promise<Rider> {
    const res = await api.post<{ success: boolean; data: Rider }>('/admin/riders', data);
    return res.data.data;
  },

  async updateRider(id: string, data: Partial<Rider>): Promise<Rider> {
    const res = await api.put<{ success: boolean; data: Rider }>(`/admin/riders/${id}`, data);
    return res.data.data;
  },

  async toggleRiderStatus(id: string, isActive: boolean): Promise<Rider> {
    const res = await api.patch<{ success: boolean; data: Rider }>(`/admin/riders/${id}/status`, { isActive });
    return res.data.data;
  },

  async getCustomers(params?: { search?: string; page?: number; limit?: number }): Promise<{ customers: User[]; total: number }> {
    try {
      const res = await api.get<{ success: boolean; data: User[]; meta?: { total: number } }>('/admin/customers', { params });
      return {
        customers: res.data.data || [],
        total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
      };
    } catch {
      return { customers: [], total: 0 };
    }
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
      const res = await api.get<{ success: boolean; data: ReportItem[] }>('/admin/reports', { params });
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async getSettings(): Promise<AgencySettings> {
    try {
      const res = await api.get<any>('/admin/settings');
      const raw = res.data.data;
      if (Array.isArray(raw)) {
        const map = new Map(raw.map((s: any) => [s.key, s.value]));
        return {
          agencyName: map.get('agency_name') || fallbackSettings.agencyName,
          primaryPhone: map.get('contact_phone_1') || fallbackSettings.primaryPhone,
          secondaryPhone: map.get('contact_phone_2') || fallbackSettings.secondaryPhone,
          email: map.get('agency_email') || fallbackSettings.email,
          address: map.get('agency_address') || fallbackSettings.address,
          deliveryAreas: (map.get('service_areas') || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean).length > 0
            ? (map.get('service_areas') || '').split(',').map((s: string) => s.trim()).filter(Boolean)
            : fallbackSettings.deliveryAreas,
          deliveryCharges: Number(map.get('delivery_charge_default') ?? fallbackSettings.deliveryCharges),
          taxPercentage: Number(map.get('tax_percentage') ?? fallbackSettings.taxPercentage),
          onlinePaymentFee: Number(map.get('online_payment_fee_percent') ?? fallbackSettings.onlinePaymentFee),
          cardPaymentFee: fallbackSettings.cardPaymentFee,
          codPaymentFee: fallbackSettings.codPaymentFee,
          isOrderingEnabled: fallbackSettings.isOrderingEnabled,
          businessHours: map.get('support_hours') || fallbackSettings.businessHours,
        };
      }
      if (raw && typeof raw === 'object') {
        return {
          ...fallbackSettings,
          ...raw,
          deliveryAreas: Array.isArray(raw.deliveryAreas) ? raw.deliveryAreas : fallbackSettings.deliveryAreas,
        };
      }
      return fallbackSettings;
    } catch {
      return fallbackSettings;
    }
  },

  async updateSettings(data: Partial<AgencySettings>): Promise<AgencySettings> {
    const res = await api.put<any>('/admin/settings', data);
    return res.data.data;
  },
};
