import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';
import { paymentSchema } from '@/lib/validations/payment.schema';

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  try {
    const { data: profile } = await ctx.supabase
      .from('users')
      .select('role')
      .eq('id', ctx.userClaims!.id)
      .single();

    if (!profile || !['owner', 'property_manager'].includes(profile.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const result = paymentSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { data: payment, error } = await ctx.supabase
      .from('payments')
      .insert({
        ...result.data,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: ctx.userClaims!.id,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (result.data.invoice_id) {
      await ctx.supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', result.data.invoice_id);
    }

    return Response.json({ data: payment });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return Response.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
});
