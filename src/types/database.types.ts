export type UserRole = 'owner' | 'property_manager' | 'tenant' | 'caretaker';
export type UnitStatus = 'vacant' | 'occupied' | 'maintenance' | 'reserved';
export type PaymentMethod = 'mpesa' | 'cash' | 'bank' | 'cheque';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded' | 'partial';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type MaintenanceStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type NoticeType = 'general' | 'maintenance' | 'payment' | 'emergency';
export type LeaseStatus = 'active' | 'expired' | 'terminated' | 'pending';
export type SubscriptionTier = 'silver' | 'gold' | 'platinum';

export interface Organization {
  id: string;
  name: string;
  business_type: string;
  subscription_tier: SubscriptionTier;
  subscription_status: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  mpesa_shortcode: string | null;
  mpesa_till_number: string | null;
  address: string | null;
  city: string | null;
  county: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  id_number: string | null;
  is_active: boolean;
  last_login_at: string | null;
  profile_image_url: string | null;
  preferences: Record<string, unknown>;
  building_access: string[];
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  city: string;
  county: string;
  total_floors: number;
  total_units: number;
  year_built: number | null;
  amenities: string[];
  caretaker_name: string | null;
  caretaker_phone: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  building_id: string;
  floor_id: string | null;
  unit_number: string;
  unit_label: string | null;
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  rent_amount: number;
  status: UnitStatus;
  amenities: string[];
  maintenance_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lease {
  id: string;
  unit_id: string;
  tenant_id: string;
  property_manager_id: string | null;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  deposit_paid: boolean;
  status: LeaseStatus;
  signed_at: string | null;
  document_url: string | null;
  terms: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  lease_id: string;
  unit_id: string;
  tenant_id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  issue_date: string;
  type: string;
  description: string | null;
  status: InvoiceStatus;
  late_fee: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string | null;
  tenant_id: string;
  unit_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string | null;
  mpesa_receipt: string | null;
  payment_date: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  unit_id: string;
  tenant_id: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  property_manager_id: string | null;
  category: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  images: string[];
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  organization_id: string;
  building_id: string | null;
  title: string;
  body: string;
  type: NoticeType;
  sent_to_all_tenants: boolean;
  sent_via_sms: boolean;
  sent_via_email: boolean;
  published_at: string;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> };
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      buildings: { Row: Building; Insert: Partial<Building>; Update: Partial<Building> };
      units: { Row: Unit; Insert: Partial<Unit>; Update: Partial<Unit> };
      leases: { Row: Lease; Insert: Partial<Lease>; Update: Partial<Lease> };
      invoices: { Row: Invoice; Insert: Partial<Invoice>; Update: Partial<Invoice> };
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> };
      maintenance_requests: { Row: MaintenanceRequest; Insert: Partial<MaintenanceRequest>; Update: Partial<MaintenanceRequest> };
      notices: { Row: Notice; Insert: Partial<Notice>; Update: Partial<Notice> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
