import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';

export const POST = withSupabaseRoute({ auth: 'none' }, async (req, ctx) => {
  try {
    const body = await req.json();
    const callback = body.Body?.stkCallback;

    if (!callback) {
      return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const resultCode = callback.ResultCode;
    const checkoutRequestId = callback.CheckoutRequestID;
    const metadata = callback.CallbackMetadata?.Item || [];

    const receiptNumber = metadata.find((i: { Name: string }) => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = metadata.find((i: { Name: string }) => i.Name === 'Amount')?.Value;

    if (resultCode === 0) {
      const { data: payment } = await ctx.supabaseAdmin
        .from('payments')
        .update({
          status: 'confirmed',
          mpesa_receipt: receiptNumber,
          confirmed_at: new Date().toISOString(),
          metadata: { amount, receiptNumber },
        })
        .eq('transaction_id', checkoutRequestId)
        .select('invoice_id')
        .single();

      if (payment?.invoice_id) {
        await ctx.supabaseAdmin
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', payment.invoice_id);
      }
    } else {
      await ctx.supabaseAdmin
        .from('payments')
        .update({ status: 'failed' })
        .eq('transaction_id', checkoutRequestId);
    }

    return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});
