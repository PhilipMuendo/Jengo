import { createClient } from '@/lib/supabase/client';
import type { User, UserRole } from '@/types/database.types';
import type { StaffInput } from '@/lib/validations/staff.schema';

export async function getStaff(orgId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', orgId)
    .in('role', ['property_manager', 'caretaker'])
    .order('full_name');
  if (error) throw error;
  return data as User[];
}

export async function getStaffPage(
  orgId: string,
  page: number,
  pageSize: number,
): Promise<{ rows: User[]; count: number }> {
  const supabase = createClient();
  const from = page * pageSize;
  const { data, count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .eq('organization_id', orgId)
    .in('role', ['property_manager', 'caretaker'])
    .order('full_name')
    .range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: (data as User[]) ?? [], count: count ?? 0 };
}

export async function createStaffMember(orgId: string, input: StaffInput, password: string) {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password,
    options: { data: { full_name: input.full_name } },
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create staff account');

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      organization_id: orgId,
      email: input.email,
      phone: input.phone,
      full_name: input.full_name,
      role: input.role as UserRole,
      is_active: true,
      building_access: input.building_access || [],
      preferences: {},
    })
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

export async function deactivateStaff(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as User;
}
