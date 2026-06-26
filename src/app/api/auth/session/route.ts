import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route';

export const GET = withSupabaseRoute(
  { auth: ['user', 'none'] },
  async (_req, ctx) => {
    if (ctx.authMode === 'none' || !ctx.userClaims) {
      return Response.json({ user: null });
    }

    const { data: profile } = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', ctx.userClaims.id)
      .single();

    return Response.json({ user: profile });
  },
);
