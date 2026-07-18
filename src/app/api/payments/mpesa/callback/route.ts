import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';

/**
 * Safaricom Daraja STK Push callback. Unauthenticated by necessity, so it
 * must be defensive:
 *  - only transitions payments that are still `pending` (idempotent —
 *    Daraja retries callbacks, and a replayed body must not re-confirm or
 *    overwrite a settled record);
 *  - verifies the callback amount against the amount we initiated with
 *    before marking the invoice paid (short-pays become `partial`).
 * Always ACKs with ResultCode 0 — non-zero makes Daraja retry forever.
 */
export const POST = withSupabaseRoute({ auth: 'none' }, async (req, ctx) => {
  const ack = Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  try {
    const body = await req.json();
    const callback = body.Body?.stkCallback;
    if (!callback?.CheckoutRequestID) return ack;

    const checkoutRequestId: string = callback.CheckoutRequestID;
    const metadata: { Name: string; Value?: unknown }[] = callback.CallbackMetadata?.Item ?? [];
    const receiptNumber = metadata.find((i) => i.Name === 'MpesaReceiptNumber')?.Value;
    const paidAmount = Number(metadata.find((i) => i.Name === 'Amount')?.Value ?? NaN);

    const { data: payment } = await ctx.supabaseAdmin
      .from('payments')
      .select('id, amount, invoice_id, status')
      .eq('transaction_id', checkoutRequestId)
      .single();

    if (!payment || payment.status !== 'pending') return ack;

    if (callback.ResultCode !== 0) {
      await ctx.supabaseAdmin
        .from('payments')
        .update({
          status: 'failed',
          metadata: { resultCode: callback.ResultCode, resultDesc: callback.ResultDesc },
        })
        .eq('id', payment.id)
        .eq('status', 'pending');
      return ack;
    }

    const fullyPaid = Number.isFinite(paidAmount) && paidAmount >= Number(payment.amount);

    const { data: updated } = await ctx.supabaseAdmin
      .from('payments')
      .update({
        status: fullyPaid ? 'confirmed' : 'partial',
        mpesa_receipt: receiptNumber,
        confirmed_at: new Date().toISOString(),
        metadata: { amount: paidAmount, receiptNumber },
      })
      .eq('id', payment.id)
      .eq('status', 'pending') // guard against a concurrent callback replay
      .select('id')
      .single();

    if (updated && fullyPaid && payment.invoice_id) {
      await ctx.supabaseAdmin
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', payment.invoice_id);
    }

    return ack;
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return ack;
  }
});
