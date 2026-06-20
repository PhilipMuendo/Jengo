import { NextRequest, NextResponse } from 'next/server';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { mpesaPaymentSchema } from '@/lib/validations/payment.schema';
import { initiateStkPush } from '@/services/payments/mpesa';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = mpesaPaymentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { phone, amount, invoice_id, unit_id } = result.data;
    const supabase = await createClient();

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id,
        tenant_id: user.id,
        unit_id,
        amount,
        method: 'mpesa',
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    const stkResponse = await initiateStkPush({
      phone,
      amount,
      accountReference: payment.id,
      transactionDesc: `Rent payment - Invoice ${invoice_id.slice(0, 8)}`,
    });

    await supabase
      .from('payments')
      .update({
        transaction_id: stkResponse.checkoutRequestId,
        metadata: { merchantRequestId: stkResponse.merchantRequestId },
      })
      .eq('id', payment.id);

    return NextResponse.json({
      data: {
        checkoutRequestId: stkResponse.checkoutRequestId,
        merchantRequestId: stkResponse.merchantRequestId,
        responseDescription: stkResponse.responseDescription,
      },
    });
  } catch (error) {
    console.error('STK Push error:', error);
    return NextResponse.json({ error: 'Failed to initiate M-Pesa payment' }, { status: 500 });
  }
}
