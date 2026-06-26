import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  try {
    const { data: profile } = await ctx.supabase
      .from('users')
      .select('role')
      .eq('id', ctx.userClaims!.id)
      .single();

    if (!profile || !['owner', 'property_manager', 'caretaker'].includes(profile.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { requestId, resolutionNotes } = await req.json();
    if (!requestId) {
      return Response.json({ error: 'requestId is required' }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from('maintenance_requests')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes || null,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to resolve maintenance request' }, { status: 500 });
  }
});
