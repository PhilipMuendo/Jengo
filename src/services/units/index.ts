import { createClient } from '@/lib/supabase/client';
import type { Unit } from '@/types/database.types';
import type { UnitInput } from '@/lib/validations/unit.schema';

export type UnitWithBuilding = Unit & { buildings?: { name: string; organization_id: string } };

export async function getUnits(orgId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('units')
    .select('*, buildings!inner(name, organization_id)')
    .eq('buildings.organization_id', orgId)
    .order('unit_number');
  if (error) throw error;
  return data as UnitWithBuilding[];
}

export async function getUnitsPage(
  orgId: string,
  page: number,
  pageSize: number,
): Promise<{ rows: UnitWithBuilding[]; count: number }> {
  const supabase = createClient();
  const from = page * pageSize;
  const { data, count, error } = await supabase
    .from('units')
    .select('*, buildings!inner(name, organization_id)', { count: 'exact' })
    .eq('buildings.organization_id', orgId)
    .order('unit_number')
    .range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: (data as UnitWithBuilding[]) ?? [], count: count ?? 0 };
}

export async function getUnitsByBuilding(buildingId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('building_id', buildingId)
    .order('unit_number');
  if (error) throw error;
  return data as Unit[];
}

export async function getUnit(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from('units').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Unit;
}

export async function createUnit(input: UnitInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('units')
    .insert({ ...input, amenities: [] })
    .select()
    .single();
  if (error) throw error;
  return data as Unit;
}

export async function updateUnit(id: string, input: Partial<UnitInput>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('units')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Unit;
}
