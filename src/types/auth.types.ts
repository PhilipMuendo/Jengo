import type { User, UserRole } from './database.types';

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  organizationName: string;
  businessType: string;
  city: string;
  county: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  owner: '/dashboard',
  property_manager: '/buildings',
  tenant: '/tenant/portal',
  caretaker: '/maintenance',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  property_manager: 'Property Manager',
  tenant: 'Tenant',
  caretaker: 'Caretaker',
};
