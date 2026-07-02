import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';
import { signupAccountSchema, signupOrganizationSchema } from '@/lib/validations/auth.schema';

export const POST = withSupabaseRoute({ auth: 'none' }, async (req, ctx) => {
  try {
    const body = await req.json();

    const accountResult = signupAccountSchema.safeParse(body);
    const orgResult = signupOrganizationSchema.safeParse(body);

    if (!accountResult.success) {
      return Response.json({ error: accountResult.error.issues[0].message }, { status: 400 });
    }
    if (!orgResult.success) {
      return Response.json({ error: orgResult.error.issues[0].message }, { status: 400 });
    }

    const { data: org, error: orgError } = await ctx.supabaseAdmin
      .from('organizations')
      .insert({
        name: body.organizationName,
        business_type: body.businessType,
        city: body.city,
        county: body.county,
        address: body.address || null,
        email: body.email,
        phone: body.phone,
        subscription_tier: body.tier || 'silver',
        subscription_status: 'trial',
        subscription_start_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (orgError) {
      console.error('Organization creation error:', orgError);
      return Response.json({ error: orgError.message || JSON.stringify(orgError) }, { status: 500 });
    }

    const { data: authData, error: authError } = await ctx.supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName,
        phone: body.phone,
        role: 'owner',
        organization_id: org.id,
      },
    });

    if (authError) {
      await ctx.supabaseAdmin.from('organizations').delete().eq('id', org.id);
      console.error('User creation error:', authError);
      return Response.json({ error: authError.message || JSON.stringify(authError) }, { status: 500 });
    }

    const { error: userUpsertError } = await ctx.supabaseAdmin.from('users').upsert({
      id: authData.user.id,
      organization_id: org.id,
      email: body.email,
      phone: body.phone,
      full_name: body.fullName,
      role: 'owner',
    });

    if (userUpsertError) {
      console.error('User upsert error:', userUpsertError);
    }

    return Response.json({ data: { organizationId: org.id, userId: authData.user.id } });
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return Response.json({ error: errorMessage || 'Failed to create account' }, { status: 500 });
  }
});
