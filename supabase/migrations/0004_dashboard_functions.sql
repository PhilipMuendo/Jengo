-- Dashboard/report aggregate functions.
-- Replace multi-query, pull-rows-and-sum-in-JS patterns with a single
-- server-side round trip each. SECURITY INVOKER so existing RLS still applies
-- (callers only ever see their own org's rows).

-- ---------------------------------------------------------------------------
-- One-shot summary for the dashboard and reports pages.
-- Returns a single row of pre-aggregated portfolio metrics.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_org_dashboard_summary(p_org_id UUID)
RETURNS TABLE (
  building_count      INTEGER,
  unit_count          INTEGER,
  occupied_units      INTEGER,
  vacant_units        INTEGER,
  active_tenants      INTEGER,
  monthly_revenue     NUMERIC,
  overdue_amount      NUMERIC,
  overdue_tenants     INTEGER,
  open_maintenance    INTEGER,
  urgent_maintenance  INTEGER,
  expiring_leases     INTEGER
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM buildings b
       WHERE b.organization_id = p_org_id)::int,

    (SELECT count(*) FROM units u
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id)::int,

    (SELECT count(*) FROM units u
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id AND u.status = 'occupied')::int,

    (SELECT count(*) FROM units u
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id AND u.status = 'vacant')::int,

    (SELECT count(*) FROM users usr
       WHERE usr.organization_id = p_org_id
         AND usr.role = 'tenant'
         AND usr.is_active)::int,

    coalesce((SELECT sum(p.amount) FROM payments p
       JOIN units u ON u.id = p.unit_id
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id
         AND p.status = 'confirmed'
         AND p.payment_date >= date_trunc('month', now())), 0),

    coalesce((SELECT sum(i.amount + coalesce(i.late_fee, 0)) FROM invoices i
       JOIN units u ON u.id = i.unit_id
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id
         AND i.status = 'overdue'), 0),

    (SELECT count(DISTINCT i.tenant_id) FROM invoices i
       JOIN units u ON u.id = i.unit_id
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id
         AND i.status = 'overdue')::int,

    (SELECT count(*) FROM maintenance_requests m
       JOIN units u ON u.id = m.unit_id
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id
         AND m.status IN ('open', 'assigned', 'in_progress'))::int,

    (SELECT count(*) FROM maintenance_requests m
       JOIN units u ON u.id = m.unit_id
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id
         AND m.status IN ('open', 'assigned', 'in_progress')
         AND m.priority = 'urgent')::int,

    (SELECT count(*) FROM leases l
       JOIN units u ON u.id = l.unit_id
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id
         AND l.status = 'active'
         AND l.end_date BETWEEN current_date AND current_date + INTERVAL '30 days')::int;
$$;

-- ---------------------------------------------------------------------------
-- Confirmed revenue bucketed by calendar month for the last p_months months.
-- Always returns exactly p_months rows (zero-filled) so the chart has no gaps.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_org_revenue_trend(
  p_org_id UUID,
  p_months INTEGER DEFAULT 6
)
RETURNS TABLE (
  month_start DATE,
  revenue     NUMERIC
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', now()) - make_interval(months => p_months - 1),
      date_trunc('month', now()),
      INTERVAL '1 month'
    )::date AS month_start
  )
  SELECT
    m.month_start,
    coalesce(sum(p.amount), 0) AS revenue
  FROM months m
  LEFT JOIN payments p
    ON date_trunc('month', p.payment_date)::date = m.month_start
   AND p.status = 'confirmed'
   AND p.unit_id IN (
     SELECT u.id FROM units u
       JOIN buildings b ON b.id = u.building_id
       WHERE b.organization_id = p_org_id
   )
  GROUP BY m.month_start
  ORDER BY m.month_start;
$$;

GRANT EXECUTE ON FUNCTION public.get_org_dashboard_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_revenue_trend(UUID, INTEGER) TO authenticated;
