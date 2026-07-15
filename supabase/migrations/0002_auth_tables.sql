-- Auth trigger: create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata jsonb := COALESCE(NEW.raw_user_meta_data, NEW.user_metadata, '{}'::jsonb);
  organization_id uuid;
  user_role_value user_role := 'owner';
BEGIN
  IF metadata ? 'organization_id' THEN
    organization_id := (metadata->>'organization_id')::uuid;
  ELSE
    RAISE EXCEPTION 'Missing organization_id in auth user metadata';
  END IF;

  IF metadata ? 'role' THEN
    BEGIN
      user_role_value := (metadata->>'role')::user_role;
    EXCEPTION WHEN invalid_text_representation THEN
      user_role_value := 'owner';
    END;
  END IF;

  INSERT INTO public.users (id, organization_id, email, phone, full_name, role)
  VALUES (
    NEW.id,
    organization_id,
    NEW.email,
    COALESCE(metadata->>'phone', ''),
    COALESCE(metadata->>'full_name', NEW.email),
    user_role_value
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_buildings_updated_at
    BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leases_updated_at
    BEFORE UPDATE ON leases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_maintenance_updated_at
    BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update total_units on buildings
CREATE OR REPLACE FUNCTION update_building_unit_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE buildings SET total_units = (
            SELECT COUNT(*) FROM units WHERE building_id = OLD.building_id
        ) WHERE id = OLD.building_id;
        RETURN OLD;
    ELSE
        UPDATE buildings SET total_units = (
            SELECT COUNT(*) FROM units WHERE building_id = NEW.building_id
        ) WHERE id = NEW.building_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_units_count
    AFTER INSERT OR DELETE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_building_unit_count();

-- Auto-update unit status on lease end
CREATE OR REPLACE FUNCTION update_unit_status_on_lease_end()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'expired' AND OLD.status = 'active' THEN
        UPDATE units SET status = 'vacant' WHERE id = NEW.unit_id;
    ELSIF NEW.status = 'active' AND OLD.status != 'active' THEN
        UPDATE units SET status = 'occupied' WHERE id = NEW.unit_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lease_status_change
    AFTER UPDATE ON leases
    FOR EACH ROW
    EXECUTE FUNCTION update_unit_status_on_lease_end();

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's organization
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
