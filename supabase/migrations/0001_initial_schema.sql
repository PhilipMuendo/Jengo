-- JENGO DATABASE SCHEMA v2.0
-- PostgreSQL (Supabase)

-- ENUMS
CREATE TYPE user_role AS ENUM ('owner', 'property_manager', 'tenant', 'caretaker');
CREATE TYPE unit_status AS ENUM ('vacant', 'occupied', 'maintenance', 'reserved');
CREATE TYPE payment_method AS ENUM ('mpesa', 'cash', 'bank', 'cheque');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'failed', 'refunded', 'partial');
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE maintenance_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'cancelled');
CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notice_type AS ENUM ('general', 'maintenance', 'payment', 'emergency');
CREATE TYPE lease_status AS ENUM ('active', 'expired', 'terminated', 'pending');
CREATE TYPE subscription_tier AS ENUM ('silver', 'gold', 'platinum');

-- ORGANIZATIONS
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    subscription_tier subscription_tier DEFAULT 'silver',
    subscription_status VARCHAR(50) DEFAULT 'trial',
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    mpesa_shortcode VARCHAR(50),
    mpesa_till_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    county VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS (linked to Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    id_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    profile_image_url TEXT,
    preferences JSONB DEFAULT '{}',
    building_access UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- BUILDINGS
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100) NOT NULL,
    total_floors INTEGER NOT NULL DEFAULT 1,
    total_units INTEGER NOT NULL DEFAULT 0,
    year_built INTEGER,
    amenities JSONB DEFAULT '[]',
    caretaker_name VARCHAR(255),
    caretaker_phone VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_buildings_org ON buildings(organization_id);

-- FLOORS
CREATE TABLE floors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    label VARCHAR(50),
    units_per_floor INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_floors_building_floor ON floors(building_id, floor_number);

-- UNITS
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_id UUID REFERENCES floors(id) ON DELETE SET NULL,
    unit_number VARCHAR(50) NOT NULL,
    unit_label VARCHAR(10),
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    square_feet INTEGER,
    rent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status unit_status DEFAULT 'vacant',
    amenities JSONB DEFAULT '[]',
    maintenance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(building_id, unit_number)
);

CREATE INDEX idx_units_building ON units(building_id);
CREATE INDEX idx_units_status ON units(status);

-- LEASES
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(12, 2) NOT NULL,
    deposit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    deposit_paid BOOLEAN DEFAULT false,
    status lease_status DEFAULT 'active',
    signed_at DATE,
    document_url TEXT,
    terms JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_end_date ON leases(end_date);

-- INVOICES
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    type VARCHAR(50) DEFAULT 'rent',
    description TEXT,
    status invoice_status DEFAULT 'pending',
    late_fee DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_unit ON invoices(unit_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    mpesa_receipt VARCHAR(50),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_unit ON payments(unit_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- MAINTENANCE REQUESTS
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    property_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority maintenance_priority DEFAULT 'medium',
    status maintenance_status DEFAULT 'open',
    images JSONB DEFAULT '[]',
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maint_unit ON maintenance_requests(unit_id);
CREATE INDEX idx_maint_assigned ON maintenance_requests(assigned_to);
CREATE INDEX idx_maint_status ON maintenance_requests(status);
CREATE INDEX idx_maint_priority ON maintenance_requests(priority);

-- NOTICES
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type notice_type DEFAULT 'general',
    sent_to_all_tenants BOOLEAN DEFAULT false,
    sent_via_sms BOOLEAN DEFAULT false,
    sent_via_email BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notices_org ON notices(organization_id);
CREATE INDEX idx_notices_building ON notices(building_id);

-- NOTICE DELIVERIES
CREATE TABLE notice_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivered_via_sms BOOLEAN DEFAULT false,
    delivered_via_email BOOLEAN DEFAULT false,
    opened_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliveries_notice ON notice_deliveries(notice_id);
CREATE INDEX idx_deliveries_tenant ON notice_deliveries(tenant_id);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_org ON audit_logs(organization_id);

-- SUBSCRIPTION HISTORY
CREATE TABLE subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
