import { z } from 'zod';
import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';
import { tenantSchema } from '@/lib/validations/tenant.schema';

const createTenantSchema = tenantSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Creates a tenant account server-side with the admin client.
 *
 * Tenant creation must not run in the browser: `auth.signUp` there replaces
 * the staff member's own session with the new tenant's, and the
 * `handle_new_user` trigger requires `organization_id` metadata that only
 * the server knows to attach.
 */
export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  const { data: caller } = await ctx.supabase
    .from('users')
    .select('role, organization_id')
    .eq('id', ctx.userClaims!.id)
    .single();

  if (!caller || !['owner', 'property_manager'].includes(caller.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const result = createTenantSchema.safeParse(await req.json().catch(() => null));
  if (!result.success) {
    return Response.json({ error: result.error.issues[0].message }, { status: 400 });
  }
  const input = result.data;

  const { data: unit } = await ctx.supabaseAdmin
    .from('units')
    .select('id, status, buildings!inner(organization_id)')
    .eq('id', input.unit_id)
    .eq('buildings.organization_id', caller.organization_id)
    .single();

  if (!unit) {
    return Response.json({ error: 'Unit not found in your organization' }, { status: 404 });
  }
  if (unit.status !== 'vacant') {
    return Response.json({ error: 'Unit is not vacant' }, { status: 409 });
  }

  // handle_new_user trigger creates the public.users profile from this metadata.
  const { data: authData, error: authError } = await ctx.supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.full_name,
      phone: input.phone,
      role: 'tenant',
      organization_id: caller.organization_id,
    },
    // Claims read by middleware for route gating without a DB round-trip.
    app_metadata: {
      role: 'tenant',
      organization_id: caller.organization_id,
      is_active: true,
    },
  });
  if (authError) {
    return Response.json({ error: authError.message }, { status: 500 });
  }
  const tenantId = authData.user.id;

  try {
    if (input.id_number) {
      await ctx.supabaseAdmin.from('users').update({ id_number: input.id_number }).eq('id', tenantId);
    }

    const { data: lease, error: leaseError } = await ctx.supabaseAdmin
      .from('leases')
      .insert({
        unit_id: input.unit_id,
        tenant_id: tenantId,
        property_manager_id: caller.role === 'property_manager' ? ctx.userClaims!.id : null,
        start_date: input.start_date,
        end_date: input.end_date,
        monthly_rent: input.monthly_rent,
        deposit_amount: input.deposit_amount,
        deposit_paid: false,
        status: 'active',
        terms: {},
      })
      .select()
      .single();
    if (leaseError) throw leaseError;

    const { error: unitError } = await ctx.supabaseAdmin
      .from('units')
      .update({ status: 'occupied' })
      .eq('id', input.unit_id);
    if (unitError) throw unitError;

    return Response.json({ data: { userId: tenantId, leaseId: lease.id } });
  } catch (error) {
    // Compensate: the auth delete cascades to users/leases rows.
    await ctx.supabaseAdmin.auth.admin.deleteUser(tenantId);
    console.error('Tenant creation failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to create tenant';
    return Response.json({ error: message }, { status: 500 });
  }
});
