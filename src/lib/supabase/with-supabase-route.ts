import { withSupabase as withSupabaseFetch } from '@supabase/server';
import type { WithSupabaseConfig } from '@supabase/server';
import type { NextRequest } from 'next/server';
import { createSupabaseContext } from './context';
import { asAppContext, type AppSupabaseContext } from './app-context';

export { withSupabaseFetch as withSupabase };

type RouteHandler = (
  req: NextRequest,
  ctx: AppSupabaseContext,
) => Promise<Response>;

/**
 * Wraps a Next.js Route Handler with `@supabase/server` auth + clients.
 *
 * - Requests with `Authorization` or `apikey` headers → standard `withSupabase`
 *   (Edge Function / mobile / server-to-server style).
 * - Cookie-based browser sessions → composed `@supabase/ssr` + core primitives.
 */
export function withSupabaseRoute(
  config: WithSupabaseConfig,
  handler: RouteHandler,
) {
  const fetchHandler = withSupabaseFetch(config, (req, ctx) =>
    handler(req as NextRequest, asAppContext(ctx)),
  );

  return async (req: NextRequest): Promise<Response> => {
    const usesHeaderAuth =
      req.headers.has('authorization') || req.headers.has('apikey');

    if (usesHeaderAuth) {
      return fetchHandler(req);
    }

    const { data: ctx, error } = await createSupabaseContext({
      auth: config.auth,
      env: config.env,
    });

    if (error) {
      return Response.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return handler(req, asAppContext(ctx));
  };
}

export function authErrorResponse(error: { message: string; status: number }) {
  return Response.json({ message: error.message }, { status: error.status });
}
