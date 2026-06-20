import { createClient } from '@/lib/supabase/client';
import type { User, Organization } from '@/types/database.types';

export async function getSessionUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
  return data;
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const supabase = createClient();
  const { data } = await supabase.from('organizations').select('*').eq('id', orgId).single();
  return data;
}

export async function updateOrganization(orgId: string, updates: Partial<Organization>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('organizations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', orgId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
