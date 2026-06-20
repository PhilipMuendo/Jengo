import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();
    const callback = body.Body?.stkCallback;

    if (!callback) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }));
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resultCode = callback.ResultCode;
    const checkoutRequestId = callback.CheckoutRequestID;
    const metadata = callback.CallbackMetadata?.Item || [];
    const receiptNumber = metadata.find((i: { Name: string }) => i.Name === "MpesaReceiptNumber")?.Value;

    if (resultCode === 0) {
      const { data: payment } = await supabase
        .from("payments")
        .update({
          status: "confirmed",
          mpesa_receipt: receiptNumber,
          confirmed_at: new Date().toISOString(),
        })
        .eq("transaction_id", checkoutRequestId)
        .select("invoice_id")
        .single();

      if (payment?.invoice_id) {
        await supabase.from("invoices").update({ status: "paid" }).eq("id", payment.invoice_id);
      }
    } else {
      await supabase.from("payments").update({ status: "failed" }).eq("transaction_id", checkoutRequestId);
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }));
  } catch {
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }));
  }
});
