import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signupAccountSchema, signupOrganizationSchema } from '@/lib/validations/auth.schema';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const accountResult = signupAccountSchema.safeParse(body);
    const orgResult = signupOrganizationSchema.safeParse(body);

    if (!accountResult.success) {
      return NextResponse.json({ error: accountResult.error.issues[0].message }, { status: 400 });
    }
    if (!orgResult.success) {
      return NextResponse.json({ error: orgResult.error.issues[0].message }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: org, error: orgError } = await supabase
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
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
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
      await supabase.from('organizations').delete().eq('id', org.id);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    await supabase.from('users').upsert({
      id: authData.user.id,
      organization_id: org.id,
      email: body.email,
      phone: body.phone,
      full_name: body.fullName,
      role: 'owner',
    });

    return NextResponse.json({ data: { organizationId: org.id, userId: authData.user.id } });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
