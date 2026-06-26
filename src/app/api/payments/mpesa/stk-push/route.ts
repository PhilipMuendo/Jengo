import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';
import { mpesaPaymentSchema } from '@/lib/validations/payment.schema';
import { initiateStkPush } from '@/services/payments/mpesa';

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  try {
    const body = await req.json();
    const result = mpesaPaymentSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { phone, amount, invoice_id, unit_id } = result.data;

    const { data: payment, error: paymentError } = await ctx.supabase
      .from('payments')
      .insert({
        invoice_id,
        tenant_id: ctx.userClaims!.id,
        unit_id,
        amount,
        method: 'mpesa',
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError) {
      return Response.json({ error: paymentError.message }, { status: 500 });
    }

    const stkResponse = await initiateStkPush({
      phone,
      amount,
      accountReference: payment.id,
      transactionDesc: `Rent payment - Invoice ${invoice_id.slice(0, 8)}`,
    });

    await ctx.supabase
      .from('payments')
      .update({
        transaction_id: stkResponse.checkoutRequestId,
        metadata: { merchantRequestId: stkResponse.merchantRequestId },
      })
      .eq('id', payment.id);

    return Response.json({
      data: {
        checkoutRequestId: stkResponse.checkoutRequestId,
        merchantRequestId: stkResponse.merchantRequestId,
        responseDescription: stkResponse.responseDescription,
      },
    });
  } catch (error) {
    console.error('STK Push error:', error);
    return Response.json({ error: 'Failed to initiate M-Pesa payment' }, { status: 500 });
  }
});
