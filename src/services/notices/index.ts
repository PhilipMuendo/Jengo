import { createClient } from '@/lib/supabase/client';
import type { Notice, NoticeType } from '@/types/database.types';

export interface NoticeInput {
  title: string;
  body: string;
  type: NoticeType;
  building_id?: string | null;
  sent_to_all_tenants?: boolean;
  sent_via_sms?: boolean;
  sent_via_email?: boolean;
  expires_at?: string | null;
}

export async function getNotices(orgId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notices')
    .select('*, buildings(name)')
    .eq('organization_id', orgId)
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data as (Notice & { buildings?: { name: string } | null })[];
}

export async function createNotice(orgId: string, input: NoticeInput, createdBy?: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notices')
    .insert({
      organization_id: orgId,
      title: input.title,
      body: input.body,
      type: input.type,
      building_id: input.building_id || null,
      sent_to_all_tenants: input.sent_to_all_tenants ?? true,
      sent_via_sms: input.sent_via_sms ?? false,
      sent_via_email: input.sent_via_email ?? false,
      published_at: new Date().toISOString(),
      expires_at: input.expires_at || null,
      created_by: createdBy || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Notice;
}
