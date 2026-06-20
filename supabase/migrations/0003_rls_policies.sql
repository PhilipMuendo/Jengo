-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS
CREATE POLICY org_select ON organizations FOR SELECT
  USING (id = public.get_user_org_id());

CREATE POLICY org_update ON organizations FOR UPDATE
  USING (id = public.get_user_org_id() AND public.get_user_role() = 'owner');

-- USERS
CREATE POLICY users_select_own ON users FOR SELECT
  USING (organization_id = public.get_user_org_id());

CREATE POLICY users_update_own ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY users_insert_owner ON users FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() = 'owner'
  );

-- BUILDINGS
CREATE POLICY buildings_org ON buildings FOR ALL
  USING (organization_id = public.get_user_org_id())
  WITH CHECK (organization_id = public.get_user_org_id());

CREATE POLICY buildings_pm_access ON buildings FOR SELECT
  USING (
    public.get_user_role() = 'property_manager'
    AND id = ANY(
      SELECT unnest(building_access) FROM users WHERE id = auth.uid()
    )
  );

-- FLOORS
CREATE POLICY floors_org ON floors FOR ALL
  USING (
    building_id IN (
      SELECT id FROM buildings WHERE organization_id = public.get_user_org_id()
    )
  );

-- UNITS
CREATE POLICY units_org ON units FOR ALL
  USING (
    building_id IN (
      SELECT id FROM buildings WHERE organization_id = public.get_user_org_id()
    )
  );

CREATE POLICY tenant_unit_select ON units FOR SELECT
  USING (
    id IN (
      SELECT unit_id FROM leases
      WHERE tenant_id = auth.uid() AND status = 'active'
    )
  );

-- LEASES
CREATE POLICY leases_org ON leases FOR ALL
  USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN buildings b ON b.id = u.building_id
      WHERE b.organization_id = public.get_user_org_id()
    )
  );

CREATE POLICY tenant_lease_select ON leases FOR SELECT
  USING (tenant_id = auth.uid());

-- INVOICES
CREATE POLICY invoices_org ON invoices FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM users WHERE organization_id = public.get_user_org_id()
    )
  );

CREATE POLICY tenant_invoice_select ON invoices FOR SELECT
  USING (tenant_id = auth.uid());

-- PAYMENTS
CREATE POLICY payments_org ON payments FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM users WHERE organization_id = public.get_user_org_id()
    )
  );

CREATE POLICY tenant_payment_select ON payments FOR SELECT
  USING (tenant_id = auth.uid());

-- MAINTENANCE
CREATE POLICY maintenance_org ON maintenance_requests FOR ALL
  USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN buildings b ON b.id = u.building_id
      WHERE b.organization_id = public.get_user_org_id()
    )
  );

CREATE POLICY tenant_maintenance ON maintenance_requests FOR ALL
  USING (
    tenant_id = auth.uid()
    OR reported_by = auth.uid()
  );

-- NOTICES
CREATE POLICY notices_org ON notices FOR ALL
  USING (organization_id = public.get_user_org_id());

CREATE POLICY notice_deliveries_org ON notice_deliveries FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM users WHERE organization_id = public.get_user_org_id()
    )
    OR tenant_id = auth.uid()
  );

-- AUDIT LOGS
CREATE POLICY audit_org ON audit_logs FOR SELECT
  USING (organization_id = public.get_user_org_id());

-- SUBSCRIPTION HISTORY
CREATE POLICY subscription_org ON subscription_history FOR SELECT
  USING (organization_id = public.get_user_org_id());
