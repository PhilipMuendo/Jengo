-- Fix infinite recursion (42P17) in RLS policies between `units` and `leases`.
--
-- The cycle:
--   units.tenant_unit_select  reads leases  (is this unit leased to me?)
--   leases.leases_org         reads units   (does this lease's unit belong to my org?)
-- Each read re-triggers the other table's policies, so Postgres aborts with
-- 42P17 and BOTH tables become unreadable under RLS. This breaks Units,
-- Tenants, Dashboard, Reports, Maintenance and Payments reads.
--
-- Fix: resolve a lease's owning organization through a SECURITY DEFINER helper
-- that bypasses RLS on units/buildings, so `leases_org` no longer reads `units`
-- under RLS. Access semantics are unchanged — the policy still requires the
-- resolved org to equal the caller's org.

CREATE OR REPLACE FUNCTION public.unit_org_id(p_unit_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.organization_id
  FROM units u
  JOIN buildings b ON b.id = u.building_id
  WHERE u.id = p_unit_id;
$$;

GRANT EXECUTE ON FUNCTION public.unit_org_id(uuid) TO authenticated;

-- Recreate leases_org so it no longer reads `units` under RLS.
DROP POLICY IF EXISTS leases_org ON leases;
CREATE POLICY leases_org ON leases FOR ALL
  USING (public.unit_org_id(unit_id) = public.get_user_org_id())
  WITH CHECK (public.unit_org_id(unit_id) = public.get_user_org_id());
