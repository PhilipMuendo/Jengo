import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date().toISOString().split("T")[0];

  const { data: overdueInvoices } = await supabase
    .from("invoices")
    .select("*, users!invoices_tenant_id_fkey(phone, full_name, email)")
    .eq("status", "pending")
    .lt("due_date", today);

  let sent = 0;

  for (const invoice of overdueInvoices || []) {
    const tenant = invoice.users as { phone: string; full_name: string; email: string };
    if (tenant?.phone && Deno.env.get("AT_API_KEY")) {
      const message = `Dear ${tenant.full_name}, your rent invoice ${invoice.invoice_number} of KES ${invoice.amount} is overdue. Please pay via M-Pesa. - Jengo`;
      await fetch("https://api.africastalking.com/version1/messaging", {
        method: "POST",
        headers: {
          apiKey: Deno.env.get("AT_API_KEY")!,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          username: Deno.env.get("AT_USERNAME") || "sandbox",
          to: tenant.phone,
          message,
          from: Deno.env.get("AT_SENDER_ID") || "JENGO",
        }),
      });
      sent++;
    }
  }

  return new Response(JSON.stringify({ sent, total: overdueInvoices?.length || 0 }), {
    headers: { "Content-Type": "application/json" },
  });
});
