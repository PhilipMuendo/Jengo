import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';

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

    const { requestId, assignedTo } = await req.json();
    if (!requestId || !assignedTo) {
      return Response.json({ error: 'requestId and assignedTo are required' }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from('maintenance_requests')
      .update({ assigned_to: assignedTo, status: 'assigned' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to assign maintenance request' }, { status: 500 });
  }
});
