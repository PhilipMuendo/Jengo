export { ROLE_REDIRECTS, ROLE_LABELS } from '@/types/auth.types';
export type { UserRole } from '@/types/database.types';

export const USER_ROLES = ['owner', 'property_manager', 'tenant', 'caretaker'] as const;

export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 4,
  property_manager: 3,
  caretaker: 2,
  tenant: 1,
};

export function canAccessRoute(role: string, route: string): boolean {
  const ownerRoutes = ['/dashboard', '/buildings', '/units', '/tenants', '/payments', '/invoices', '/arrears', '/maintenance', '/notices', '/staff', '/reports', '/settings'];
  const pmRoutes = ['/buildings', '/units', '/tenants', '/payments', '/invoices', '/arrears', '/maintenance', '/notices', '/reports'];
  const tenantRoutes = ['/tenant', '/maintenance'];
  const caretakerRoutes = ['/maintenance'];

  const routeMap: Record<string, string[]> = {
    owner: ownerRoutes,
    property_manager: pmRoutes,
    tenant: tenantRoutes,
    caretaker: caretakerRoutes,
  };

  const allowed = routeMap[role] || [];
  // Segment-aware match: '/tenant' must allow '/tenant/portal' but not '/tenants'.
  return allowed.some((r) => route === r || route.startsWith(r + '/'));
}
