import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';
import { signupAccountSchema, signupOrganizationSchema } from '@/lib/validations/auth.schema';

export const POST = withSupabaseRoute({ auth: 'none' }, async (req, ctx) => {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Signup route JSON parse failed:', parseError);
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!ctx?.supabaseAdmin) {
      console.error('Missing supabaseAdmin in context');
      return Response.json({ error: 'Supabase admin client unavailable' }, { status: 500 });
    }

    const accountResult = signupAccountSchema.safeParse(body);
    const orgResult = signupOrganizationSchema.safeParse(body);

    if (!accountResult.success) {
      return Response.json({ error: accountResult.error.issues[0].message }, { status: 400 });
    }
    if (!orgResult.success) {
      return Response.json({ error: orgResult.error.issues[0].message }, { status: 400 });
    }

    const account = accountResult.data;
    const organization = orgResult.data;
    const { tier } = body as { tier?: string };

    const { data: org, error: orgError } = await ctx.supabaseAdmin
      .from('organizations')
      .insert({
        name: organization.organizationName,
        business_type: organization.businessType,
        city: organization.city,
        county: organization.county,
        address: organization.address || null,
        email: account.email,
        phone: account.phone,
        subscription_tier: tier || 'silver',
        subscription_status: 'trial',
        subscription_start_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (orgError) {
      console.error('Organization creation error (full):', orgError);
      return Response.json({ error: orgError.message || JSON.stringify(orgError) }, { status: 500 });
    }

    const { data: authData, error: authError } = await ctx.supabaseAdmin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName,
        phone: account.phone,
        role: 'owner',
        organization_id: org.id,
      },
      // Claims read by middleware for route gating without a DB round-trip.
      app_metadata: {
        role: 'owner',
        organization_id: org.id,
        is_active: true,
      },
    });

    if (authError) {
      await ctx.supabaseAdmin.from('organizations').delete().eq('id', org.id);
      console.error('User creation error (full):', authError);
      console.error('AuthData:', authData);
      return Response.json({ error: authError.message || JSON.stringify(authError) }, { status: 500 });
    }

    const { error: userUpsertError } = await ctx.supabaseAdmin.from('users').upsert({
      id: authData.user.id,
      organization_id: org.id,
      email: account.email,
      phone: account.phone,
      full_name: account.fullName,
      role: 'owner',
    });

    if (userUpsertError) {
      await ctx.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await ctx.supabaseAdmin.from('organizations').delete().eq('id', org.id);
      console.error('User upsert error:', userUpsertError);
      return Response.json({ error: userUpsertError.message }, { status: 500 });
    }

    return Response.json({ data: { organizationId: org.id, userId: authData.user.id } });
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return Response.json({ error: errorMessage || 'Failed to create account' }, { status: 500 });
  }
});
