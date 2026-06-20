import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callback = body.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const resultCode = callback.ResultCode;
    const checkoutRequestId = callback.CheckoutRequestID;
    const metadata = callback.CallbackMetadata?.Item || [];

    const receiptNumber = metadata.find((i: { Name: string }) => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = metadata.find((i: { Name: string }) => i.Name === 'Amount')?.Value;

    const supabase = getServiceClient();

    if (resultCode === 0) {
      const { data: payment } = await supabase
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
        await supabase
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', payment.invoice_id);
      }
    } else {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('transaction_id', checkoutRequestId);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
