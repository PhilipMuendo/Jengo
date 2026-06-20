import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, amount, accountReference, transactionDesc } = await req.json();

    const baseUrl = Deno.env.get("MPESA_ENV") === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

    const auth = btoa(`${Deno.env.get("MPESA_CONSUMER_KEY")}:${Deno.env.get("MPESA_CONSUMER_SECRET")}`);
    const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const { access_token } = await tokenRes.json();

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = btoa(`${Deno.env.get("MPESA_SHORTCODE")}${Deno.env.get("MPESA_PASSKEY")}${timestamp}`);

    const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: Deno.env.get("MPESA_SHORTCODE"),
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: phone,
        PartyB: Deno.env.get("MPESA_SHORTCODE"),
        PhoneNumber: phone,
        CallBackURL: Deno.env.get("MPESA_CALLBACK_URL"),
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      }),
    });

    const data = await stkRes.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
