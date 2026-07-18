import { createClient } from '@/lib/supabase/client';
import { ORG_FILTER, pageRange, toPage } from '@/services/shared';
import type { Page } from '@/lib/hooks/usePaginatedQuery';
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

export type NoticeWithBuilding = Notice & { buildings?: { name: string } | null };

export async function getNoticesPage(
  orgId: string,
  page: number,
  pageSize: number,
): Promise<Page<NoticeWithBuilding>> {
  const supabase = createClient();
  const [from, to] = pageRange(page, pageSize);
  return toPage<NoticeWithBuilding>(
    await supabase
      .from('notices')
      .select('*, buildings(name)', { count: 'exact' })
      .eq(ORG_FILTER.direct, orgId)
      .order('published_at', { ascending: false })
      .range(from, to),
  );
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
