import api from './api';
import { User, Address } from '../types';

export const customerService = {
  async getProfile(): Promise<User> {
    const res = await api.get<{ success: boolean; data: User }>('/customer/profile');
    return res.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.put<{ success: boolean; data: User }>('/customer/profile', data);
    return res.data.data;
  },

  async getAddresses(): Promise<Address[]> {
    const res = await api.get<{ success: boolean; data: Address[] }>('/customer/addresses');
    return res.data.data;
  },

  async addAddress(data: Omit<Address, 'id'>): Promise<Address> {
    const res = await api.post<{ success: boolean; data: Address }>('/customer/addresses', data);
    return res.data.data;
  },

  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    const res = await api.put<{ success: boolean; data: Address }>(`/customer/addresses/${id}`, data);
    return res.data.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/customer/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<Address> {
    const res = await api.patch<{ success: boolean; data: Address }>(`/customer/addresses/${id}/default`);
    return res.data.data;
  },
};
