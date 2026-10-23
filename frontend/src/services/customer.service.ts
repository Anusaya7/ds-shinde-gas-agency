import api from './api';
import { User, Address, CustomerKycStatus } from '../types';

export interface CustomerBusinessDetails {
  fsiNumber?: string;
  udyamDocument?: File;
  udyamConsent?: boolean;
  aadhaarNumber?: string;
  aadhaarDocument?: File;
  aadhaarConsent?: boolean;
  fullName?: string;
  phone?: string;
  altPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  mapLink?: string;
  bookingDurationDays?: number;
  remindersEnabled?: boolean;
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

  async getKycStatus(): Promise<CustomerKycStatus> {
    const res = await api.get<{ success: boolean; data: CustomerKycStatus }>('/customer/kyc-status');
    return res.data.data;
  },

  async saveBusinessDetails(details: CustomerBusinessDetails): Promise<void> {
    const form = new FormData();
    form.append('kycSubmit', 'true');
    if (details.fsiNumber !== undefined) form.append('fsiNumber', details.fsiNumber);
    if (details.udyamDocument) form.append('udyamDocument', details.udyamDocument);
    if (details.udyamDocument && details.udyamConsent) form.append('udyamConsent', 'true');
    if (details.aadhaarNumber !== undefined) form.append('aadhaarNumber', details.aadhaarNumber);
    if (details.aadhaarDocument) form.append('aadhaarDocument', details.aadhaarDocument);
    if (details.aadhaarDocument && details.aadhaarConsent) form.append('aadhaarConsent', 'true');
    if (details.fullName) form.append('fullName', details.fullName);
    if (details.phone) form.append('phone', details.phone);
    if (details.altPhone) form.append('altPhone', details.altPhone);
    if (details.addressLine1) form.append('addressLine1', details.addressLine1);
    if (details.addressLine2) form.append('addressLine2', details.addressLine2);
    if (details.area) form.append('area', details.area);
    if (details.city) form.append('city', details.city);
    if (details.state) form.append('state', details.state);
    if (details.pincode) form.append('pinCode', details.pincode);
    if (details.landmark) form.append('landmark', details.landmark);
    if (details.mapLink) form.append('mapLink', details.mapLink);
    if (details.bookingDurationDays) form.append('bookingDurationDays', String(details.bookingDurationDays));
    if (details.remindersEnabled) form.append('remindersEnabled', 'true');
    await api.put('/customer/business-details', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },

  async submitKyc(details: CustomerBusinessDetails): Promise<void> {
    return this.saveBusinessDetails(details);
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
