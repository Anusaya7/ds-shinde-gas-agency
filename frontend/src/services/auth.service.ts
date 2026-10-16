import api from './api';
import { User } from '../types';

export interface LoginPayload {
  identifier: string; // phone or email
  password?: string;
  otp?: string;
  type: 'PASSWORD' | 'OTP';
  role?: 'CUSTOMER' | 'RIDER';
  purpose?: 'LOGIN' | 'REGISTER';
  name?: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  accessToken?: string;
}

export const authService = {
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: any }>('/auth/register', data);
    const raw = res.data.data;
    const token = raw.token || raw.accessToken || '';
    return { user: raw.user, token, accessToken: token };
  },

  async login(data: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: any }>('/auth/login', data);
    const raw = res.data.data;
    const token = raw.token || raw.accessToken || '';
    return { user: raw.user, token, accessToken: token };
  },

  async sendOtp(
    identifier: string,
    role: 'CUSTOMER' | 'RIDER',
    purpose: 'LOGIN' | 'REGISTER' = 'LOGIN'
  ): Promise<{ message: string }> {
    const res = await api.post<{ success: boolean; data: { message: string } }>('/auth/send-otp', {
      identifier,
      purpose,
      role,
    });
    return res.data.data;
  },

  async verifyOtp(
    identifier: string,
    otp: string,
    role: 'CUSTOMER' | 'RIDER',
    purpose: 'LOGIN' | 'REGISTER' = 'LOGIN',
    name?: string
  ): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: any }>('/auth/verify-otp', {
      identifier,
      otp,
      purpose,
      role,
      name,
    });
    const raw = res.data.data;
    const token = raw.token || raw.accessToken || '';
    return { user: raw.user, token, accessToken: token };
  },

  async forgotPassword(identifier: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { identifier });
    return res.data;
  },

  async resetPassword(identifier: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post<{ success: boolean; message: string }>('/auth/reset-password', {
      identifier,
      otp,
      newPassword,
    });
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<{ success: boolean; data: User }>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};
