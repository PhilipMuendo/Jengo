import type { UserRole } from '@/types/database.types';

export const APP_NAME = 'Jengo';
export const APP_TAGLINE = 'Property Management for Kenyan High-Rises';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Kisumu',
  'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Meru',
] as const;

export const NAIROBI_NEIGHBORHOODS = [
  'Kilimani', 'Eastleigh', 'South B', 'Lavington',
  'Westlands', 'Karen', 'Parklands', 'Kileleshwa',
] as const;

export const SUBSCRIPTION_TIERS = {
  silver: { name: 'Silver', price: 5000, maxBuildings: 2, maxUnits: 100 },
  gold: { name: 'Gold', price: 12000, maxBuildings: 5, maxUnits: 300 },
  platinum: { name: 'Platinum', price: 25000, maxBuildings: -1, maxUnits: -1 },
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: ['dashboard', 'buildings', 'units', 'tenants', 'payments', 'invoices', 'arrears', 'maintenance', 'notices', 'staff', 'reports', 'settings'],
  property_manager: ['buildings', 'units', 'tenants', 'payments', 'invoices', 'arrears', 'maintenance', 'notices', 'reports'],
  tenant: ['tenant-portal', 'maintenance'],
  caretaker: ['maintenance'],
};

export const NAV_ITEMS: Record<UserRole, { href: string; label: string; icon: string }[]> = {
  owner: [
    { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/buildings', label: 'Buildings', icon: 'Building2' },
    { href: '/units', label: 'Units', icon: 'DoorOpen' },
    { href: '/tenants', label: 'Tenants', icon: 'Users' },
    { href: '/payments', label: 'Payments', icon: 'CreditCard' },
    { href: '/invoices', label: 'Invoices', icon: 'FileText' },
    { href: '/arrears', label: 'Arrears', icon: 'AlertTriangle' },
    { href: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
    { href: '/notices', label: 'Notices', icon: 'Bell' },
    { href: '/staff', label: 'Staff', icon: 'UserCog' },
    { href: '/reports', label: 'Reports', icon: 'BarChart3' },
    { href: '/settings', label: 'Settings', icon: 'Settings' },
  ],
  property_manager: [
    { href: '/buildings', label: 'Buildings', icon: 'Building2' },
    { href: '/units', label: 'Units', icon: 'DoorOpen' },
    { href: '/tenants', label: 'Tenants', icon: 'Users' },
    { href: '/payments', label: 'Payments', icon: 'CreditCard' },
    { href: '/invoices', label: 'Invoices', icon: 'FileText' },
    { href: '/arrears', label: 'Arrears', icon: 'AlertTriangle' },
    { href: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
    { href: '/notices', label: 'Notices', icon: 'Bell' },
    { href: '/reports', label: 'Reports', icon: 'BarChart3' },
  ],
  tenant: [
    { href: '/tenant/portal', label: 'My Portal', icon: 'Home' },
    { href: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
  ],
  caretaker: [
    { href: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
  ],
};
