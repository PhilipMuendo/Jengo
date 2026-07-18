-- Role-scope write access.
--
-- The 0003 policies were org-scoped but not role-scoped: every FOR ALL
-- policy granted INSERT/UPDATE/DELETE to any authenticated member of the
-- organization — including tenants and caretakers. A tenant could, from the
-- browser with their own JWT, edit buildings/units/leases, cancel invoices,
-- or insert a pre-confirmed payment for themselves.
--
-- This migration splits each FOR ALL policy into:
--   * SELECT for all org members (unchanged visibility), and
--   * writes gated on role IN ('owner', 'property_manager'),
-- with narrow carve-outs for legitimate tenant/caretaker writes.

CREATE OR REPLACE FUNCTION public.is_org_staff()
RETURNS boolean AS $$
  SELECT public.get_user_role() IN ('owner', 'property_manager');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_org_staff() TO authenticated;

-- BUILDINGS
DROP POLICY IF EXISTS buildings_org ON buildings;
CREATE POLICY buildings_org_select ON buildings FOR SELECT
  USING (organization_id = public.get_user_org_id());
CREATE POLICY buildings_staff_write ON buildings FOR ALL
  USING (organization_id = public.get_user_org_id() AND public.is_org_staff())
  WITH CHECK (organization_id = public.get_user_org_id() AND public.is_org_staff());

-- FLOORS
DROP POLICY IF EXISTS floors_org ON floors;
CREATE POLICY floors_org_select ON floors FOR SELECT
  USING (building_id IN (
    SELECT id FROM buildings WHERE organization_id = public.get_user_org_id()
  ));
CREATE POLICY floors_staff_write ON floors FOR ALL
  USING (
    public.is_org_staff()
    AND building_id IN (
      SELECT id FROM buildings WHERE organization_id = public.get_user_org_id()
    )
  )
  WITH CHECK (
    public.is_org_staff()
    AND building_id IN (
      SELECT id FROM buildings WHERE organization_id = public.get_user_org_id()
    )
  );

-- UNITS (tenant_unit_select from 0003/0005 remains for tenant reads)
DROP POLICY IF EXISTS units_org ON units;
CREATE POLICY units_org_select ON units FOR SELECT
  USING (building_id IN (
    SELECT id FROM buildings WHERE organization_id = public.get_user_org_id()
  ));
CREATE POLICY units_staff_write ON units FOR ALL
  USING (
    public.is_org_staff()
    AND building_id IN (
      SELECT id FROM buildings WHERE organization_id = public.get_user_org_id()
    )
  )
  WITH CHECK (
    public.is_org_staff()
    AND building_id IN (
      SELECT id FROM buildings WHERE organization_id = public.get_user_org_id()
    )
  );

-- LEASES (tenant_lease_select from 0003 remains; unit_org_id from 0005)
DROP POLICY IF EXISTS leases_org ON leases;
CREATE POLICY leases_org_select ON leases FOR SELECT
  USING (public.unit_org_id(unit_id) = public.get_user_org_id());
CREATE POLICY leases_staff_write ON leases FOR ALL
  USING (public.unit_org_id(unit_id) = public.get_user_org_id() AND public.is_org_staff())
  WITH CHECK (public.unit_org_id(unit_id) = public.get_user_org_id() AND public.is_org_staff());

-- INVOICES (tenant_invoice_select from 0003 remains)
DROP POLICY IF EXISTS invoices_org ON invoices;
CREATE POLICY invoices_org_select ON invoices FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM users WHERE organization_id = public.get_user_org_id()
  ));
CREATE POLICY invoices_staff_write ON invoices FOR ALL
  USING (
    public.is_org_staff()
    AND tenant_id IN (SELECT id FROM users WHERE organization_id = public.get_user_org_id())
  )
  WITH CHECK (
    public.is_org_staff()
    AND tenant_id IN (SELECT id FROM users WHERE organization_id = public.get_user_org_id())
  );

-- PAYMENTS (tenant_payment_select from 0003 remains)
DROP POLICY IF EXISTS payments_org ON payments;
CREATE POLICY payments_org_select ON payments FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM users WHERE organization_id = public.get_user_org_id()
  ));
CREATE POLICY payments_staff_write ON payments FOR ALL
  USING (
    public.is_org_staff()
    AND tenant_id IN (SELECT id FROM users WHERE organization_id = public.get_user_org_id())
  )
  WITH CHECK (
    public.is_org_staff()
    AND tenant_id IN (SELECT id FROM users WHERE organization_id = public.get_user_org_id())
  );
-- Tenants may create their own *pending* payment (M-Pesa STK push initiation).
-- Confirmation happens via the admin client in the callback route.
CREATE POLICY payments_tenant_insert_pending ON payments FOR INSERT
  WITH CHECK (tenant_id = auth.uid() AND status = 'pending');

-- MAINTENANCE (tenant_maintenance FOR ALL on own requests remains from 0003)
DROP POLICY IF EXISTS maintenance_org ON maintenance_requests;
CREATE POLICY maintenance_org_select ON maintenance_requests FOR SELECT
  USING (unit_id IN (
    SELECT u.id FROM units u
    JOIN buildings b ON b.id = u.building_id
    WHERE b.organization_id = public.get_user_org_id()
  ));
CREATE POLICY maintenance_staff_write ON maintenance_requests FOR ALL
  USING (
    public.unit_org_id(unit_id) = public.get_user_org_id()
    AND (public.is_org_staff() OR assigned_to = auth.uid())
  )
  WITH CHECK (
    public.unit_org_id(unit_id) = public.get_user_org_id()
    AND (public.is_org_staff() OR assigned_to = auth.uid())
  );

-- NOTICES
DROP POLICY IF EXISTS notices_org ON notices;
CREATE POLICY notices_org_select ON notices FOR SELECT
  USING (organization_id = public.get_user_org_id());
CREATE POLICY notices_staff_write ON notices FOR ALL
  USING (organization_id = public.get_user_org_id() AND public.is_org_staff())
  WITH CHECK (organization_id = public.get_user_org_id() AND public.is_org_staff());

-- NOTICE DELIVERIES: reads stay org-wide + own; writes staff-only except a
-- tenant marking their own delivery opened.
DROP POLICY IF EXISTS notice_deliveries_org ON notice_deliveries;
CREATE POLICY notice_deliveries_select ON notice_deliveries FOR SELECT
  USING (
    tenant_id = auth.uid()
    OR tenant_id IN (SELECT id FROM users WHERE organization_id = public.get_user_org_id())
  );
CREATE POLICY notice_deliveries_staff_write ON notice_deliveries FOR ALL
  USING (
    public.is_org_staff()
    AND tenant_id IN (SELECT id FROM users WHERE organization_id = public.get_user_org_id())
  )
  WITH CHECK (
    public.is_org_staff()
    AND tenant_id IN (SELECT id FROM users WHERE organization_id = public.get_user_org_id())
  );
CREATE POLICY notice_deliveries_tenant_update ON notice_deliveries FOR UPDATE
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());
