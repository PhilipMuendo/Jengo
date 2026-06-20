import { createClient } from '@/lib/supabase/client';
import type { Building } from '@/types/database.types';
import type { BuildingInput } from '@/lib/validations/building.schema';

export async function getBuildings(orgId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('organization_id', orgId)
    .order('name');
  if (error) throw error;
  return data as Building[];
}

export async function getBuilding(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from('buildings').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Building;
}

export async function createBuilding(orgId: string, input: BuildingInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('buildings')
    .insert({ ...input, organization_id: orgId, total_units: 0, amenities: input.amenities || [] })
    .select()
    .single();
  if (error) throw error;
  return data as Building;
}

export async function updateBuilding(id: string, input: Partial<BuildingInput>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('buildings')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Building;
}

export async function deleteBuilding(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('buildings').delete().eq('id', id);
  if (error) throw error;
}
