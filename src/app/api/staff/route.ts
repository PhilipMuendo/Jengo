import { z } from 'zod';
import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';
import { staffSchema } from '@/lib/validations/staff.schema';

const createStaffSchema = staffSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Creates a staff account (property manager / caretaker) server-side.
 * Owner-only; see /api/tenants for why this cannot use browser auth.signUp.
 */
export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  const { data: caller } = await ctx.supabase
    .from('users')
    .select('role, organization_id')
    .eq('id', ctx.userClaims!.id)
    .single();

  if (!caller || caller.role !== 'owner') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const result = createStaffSchema.safeParse(await req.json().catch(() => null));
  if (!result.success) {
    return Response.json({ error: result.error.issues[0].message }, { status: 400 });
  }
  const input = result.data;

  const { data: authData, error: authError } = await ctx.supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.full_name,
      phone: input.phone,
      role: input.role,
      organization_id: caller.organization_id,
    },
    // Claims read by middleware for route gating without a DB round-trip.
    app_metadata: {
      role: input.role,
      organization_id: caller.organization_id,
      is_active: true,
    },
  });
  if (authError) {
    return Response.json({ error: authError.message }, { status: 500 });
  }

  const { data: user, error: updateError } = await ctx.supabaseAdmin
    .from('users')
    .update({ building_access: input.building_access ?? [] })
    .eq('id', authData.user.id)
    .select()
    .single();

  if (updateError) {
    await ctx.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  return Response.json({ data: user });
});
