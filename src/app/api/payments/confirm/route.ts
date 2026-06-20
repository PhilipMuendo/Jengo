import { NextRequest, NextResponse } from 'next/server';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { paymentSchema } from '@/lib/validations/payment.schema';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['owner', 'property_manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = paymentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        ...result.data,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (result.data.invoice_id) {
      await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', result.data.invoice_id);
    }

    return NextResponse.json({ data: payment });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
