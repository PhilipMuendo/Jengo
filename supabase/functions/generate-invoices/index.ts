import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date();
  const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);

  const { data: leases } = await supabase
    .from("leases")
    .select("*, units(*)")
    .eq("status", "active");

  let generated = 0;

  for (const lease of leases || []) {
    const invoiceNumber = `INV${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .eq("lease_id", lease.id)
      .gte("issue_date", `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`)
      .single();

    if (existing) continue;

    await supabase.from("invoices").insert({
      lease_id: lease.id,
      unit_id: lease.unit_id,
      tenant_id: lease.tenant_id,
      invoice_number: invoiceNumber,
      amount: lease.monthly_rent,
      due_date: dueDate.toISOString().split("T")[0],
      type: "rent",
      description: `Rent for ${now.toLocaleString("en-KE", { month: "long", year: "numeric" })}`,
      status: "pending",
    });
    generated++;
  }

  return new Response(JSON.stringify({ generated, message: `Generated ${generated} invoices` }), {
    headers: { "Content-Type": "application/json" },
  });
});
