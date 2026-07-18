import { createClient } from '@/lib/supabase/client';
import { ORG_FILTER, pageRange, toPage } from '@/services/shared';
import type { Page } from '@/lib/hooks/usePaginatedQuery';
import type { MaintenanceRequest } from '@/types/database.types';
import type { MaintenanceInput } from '@/lib/validations/maintenance.schema';

export type MaintenanceWithRelations = MaintenanceRequest & {
  units?: { unit_number: string; buildings?: { name: string } };
  users?: { full_name: string };
};

export async function getMaintenancePage(
  orgId: string,
  page: number,
  pageSize: number,
): Promise<Page<MaintenanceWithRelations>> {
  const supabase = createClient();
  const [from, to] = pageRange(page, pageSize);
  return toPage<MaintenanceWithRelations>(
    await supabase
      .from('maintenance_requests')
      .select('*, units!inner(unit_number, buildings!inner(name, organization_id))', { count: 'exact' })
      .eq(ORG_FILTER.viaUnit, orgId)
      .order('created_at', { ascending: false })
      .range(from, to),
  );
}

export async function getMaintenanceByTenant(tenantId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*, units(unit_number)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as MaintenanceWithRelations[];
}

export async function createMaintenanceRequest(
  input: MaintenanceInput,
  meta?: { tenantId?: string; reportedBy?: string }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert({
      ...input,
      tenant_id: meta?.tenantId || null,
      reported_by: meta?.reportedBy || null,
      status: 'open',
      images: [],
    })
    .select()
    .single();
  if (error) throw error;
  return data as MaintenanceRequest;
}

export async function updateMaintenanceStatus(id: string, status: MaintenanceRequest['status']) {
  const supabase = createClient();
  const updates: Partial<MaintenanceRequest> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === 'resolved') updates.resolved_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as MaintenanceRequest;
}
