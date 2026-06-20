-- Seed data for development
-- Run after migrations with: supabase db reset or psql

-- Note: Users must be created via Supabase Auth first.
-- This seed provides sample organization and building data structure.

INSERT INTO organizations (id, name, business_type, subscription_tier, subscription_status, city, county, phone, email)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Skyline Properties Ltd',
  'company',
  'gold',
  'active',
  'Nairobi',
  'Nairobi',
  '254712345678',
  'admin@skyline.co.ke'
) ON CONFLICT DO NOTHING;

INSERT INTO buildings (id, organization_id, name, address, city, county, total_floors, year_built, amenities)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Kilimani Heights', 'Argwings Kodhek Road', 'Nairobi', 'Nairobi', 15, 2018, '["Parking", "Gym", "Swimming Pool", "24hr Security"]'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'South B Towers', 'Muhoho Avenue', 'Nairobi', 'Nairobi', 12, 2020, '["Parking", "Generator", "CCTV"]')
ON CONFLICT DO NOTHING;

INSERT INTO floors (building_id, floor_number, label, units_per_floor)
SELECT 'b0000000-0000-0000-0000-000000000001', generate_series(1, 15), NULL, 4
ON CONFLICT DO NOTHING;

INSERT INTO units (building_id, unit_number, bedrooms, bathrooms, rent_amount, status)
SELECT
  'b0000000-0000-0000-0000-000000000001',
  floor_num || letter,
  CASE WHEN floor_num <= 5 THEN 1 WHEN floor_num <= 10 THEN 2 ELSE 3 END,
  CASE WHEN floor_num <= 5 THEN 1 ELSE 2 END,
  CASE WHEN floor_num <= 5 THEN 25000 WHEN floor_num <= 10 THEN 45000 ELSE 65000 END,
  CASE WHEN random() > 0.2 THEN 'occupied'::unit_status ELSE 'vacant'::unit_status END
FROM generate_series(1, 15) AS floor_num
CROSS JOIN (VALUES ('A'), ('B'), ('C'), ('D')) AS t(letter)
ON CONFLICT DO NOTHING;
