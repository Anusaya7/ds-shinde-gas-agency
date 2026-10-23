import api from './api';
import { CustomerApplication, CustomerApprovalStatus } from '../types';

export type RiderApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RiderApplication {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  vehicleNumber: string;
  status: RiderApplicationStatus;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RiderApplicationDocuments {
  rcDocument: File;
  frontPhoto: File;
  backPhoto: File;
  selfie: File;
}

export const applicationService = {
  async getMine(): Promise<RiderApplication | null> {
    const response = await api.get<{ data: RiderApplication | null }>('/rider/application');
    return response.data.data;
  },

  async submitRiderApplication(
    details: { fullName: string; address: string; vehicleNumber: string; phone: string; consent: true },
    documents: RiderApplicationDocuments
  ): Promise<RiderApplication> {
    const form = new FormData();
    Object.entries(details).forEach(([key, value]) => form.append(key, String(value)));
    form.set('consent', 'true');
    Object.entries(documents).forEach(([key, file]) => form.append(key, file));
    const response = await api.post<{ data: RiderApplication }>('/rider/application', form, {
      timeout: 60000,
    });
    return response.data.data;
  },

  async listRiderApplications(status?: RiderApplicationStatus): Promise<RiderApplication[]> {
    const response = await api.get<{ data: RiderApplication[] }>('/admin/rider-applications', {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  async reviewRiderApplication(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    reason?: string
  ): Promise<RiderApplication> {
    const response = await api.patch<{ data: RiderApplication }>(
      `/admin/rider-applications/${id}/review`,
      { status, ...(reason ? { reason } : {}) }
    );
    return response.data.data;
  },

  async downloadRiderDocument(id: string, document: string): Promise<Blob> {
    const response = await api.get(`/admin/rider-applications/${id}/documents/${document}`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  async deleteRiderDocuments(id: string): Promise<void> {
    await api.delete(`/admin/rider-applications/${id}/documents`);
  },

  async deleteCustomerDocuments(id: string): Promise<void> {
    await api.delete(`/admin/customers/${id}/documents`);
  },

  async downloadCustomerUdyamDocument(customerId: string): Promise<Blob> {
    const response = await api.get(`/admin/customers/${customerId}/udyam-certificate`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  async downloadCustomerAadhaarDocument(customerId: string): Promise<Blob> {
    const response = await api.get(`/admin/customers/${customerId}/aadhaar-document`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  async listCustomerApplications(status?: CustomerApprovalStatus): Promise<CustomerApplication[]> {
    const response = await api.get<{ data: CustomerApplication[] }>('/admin/customer-applications', {
      params: status ? { status } : undefined,
    });
    return response.data.data || [];
  },

  async reviewCustomerApplication(
    customerId: string,
    status: 'APPROVED' | 'REJECTED',
    reason?: string
  ): Promise<CustomerApplication> {
    const response = await api.patch<{ data: CustomerApplication }>(
      `/admin/customer-applications/${customerId}/review`,
      { status, ...(reason ? { reason } : {}) }
    );
    return response.data.data;
  },
};
