import { Role } from '../constants/enums.js';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
}

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}
