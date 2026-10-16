import api from './api';
import { User, Address } from '../types';

export interface CustomerBusinessDetails {
  fsiNumber?: string;
  udyamDocument?: File;
  udyamConsent?: boolean;
}

function normalizeAddress(raw: any): Address {
  return {
    ...raw,
    id: String(raw.id),
    pincode: raw.pincode || raw.pinCode || '',
  };
}

function addressPayload(data: Partial<Address>) {
  const { id: _id, pincode, ...fields } = data;
  return {
    ...fields,
    ...(pincode !== undefined && { pinCode: pincode }),
  };
}

export const customerService = {
  async getProfile(): Promise<User> {
    const res = await api.get<{ success: boolean; data: User }>('/customer/profile');
    return res.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.put<{ success: boolean; data: User }>('/customer/profile', data);
    return res.data.data;
  },

  async saveBusinessDetails(details: CustomerBusinessDetails): Promise<void> {
    const form = new FormData();
    if (details.fsiNumber !== undefined) form.append('fsiNumber', details.fsiNumber);
    if (details.udyamDocument) form.append('udyamDocument', details.udyamDocument);
    if (details.udyamDocument && details.udyamConsent) form.append('udyamConsent', 'true');
    await api.put('/customer/business-details', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },

  async getAddresses(): Promise<Address[]> {
    const res = await api.get<{ success: boolean; data: Address[] }>('/customer/addresses');
    return res.data.data.map(normalizeAddress);
  },

  async addAddress(data: Omit<Address, 'id'>): Promise<Address> {
    const res = await api.post<{ success: boolean; data: Address }>('/customer/addresses', addressPayload(data));
    return normalizeAddress(res.data.data);
  },

  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    const res = await api.put<{ success: boolean; data: Address }>(`/customer/addresses/${id}`, addressPayload(data));
    return normalizeAddress(res.data.data);
  },

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/customer/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<Address> {
    return this.updateAddress(id, { isDefault: true });
  },
};
