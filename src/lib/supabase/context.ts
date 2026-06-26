import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  verifyCredentials,
  createContextClient,
  createAdminClient,
} from '@supabase/server/core';
import type {
  SupabaseContext,
  WithSupabaseConfig,
} from '@supabase/server';
import { resolveSupabaseEnv } from './env';

/**
 * Builds a SupabaseContext for Next.js Route Handlers and Server Components.
 *
 * Composes `@supabase/ssr` (cookie session) with `@supabase/server` core
 * primitives (JWKS verification, RLS-scoped + admin clients).
 *
 * @see https://github.com/supabase/server/blob/main/docs/ssr-frameworks.md
 */
export async function createSupabaseContext(
  options: Pick<WithSupabaseConfig, 'auth' | 'env'> = { auth: 'user' },
): Promise<
  | { data: SupabaseContext; error: null }
  | { data: null; error: { message: string; status: number } }
> {
  const nextEnv = { ...resolveSupabaseEnv(), ...options.env };

  if (!nextEnv.url || !nextEnv.publishableKeys?.default) {
    return {
      data: null,
      error: {
        message: 'Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY',
        status: 500,
      },
    };
  }

  const cookieStore = await cookies();
  const ssrClient = createServerClient(
    nextEnv.url,
    nextEnv.publishableKeys.default,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies — middleware handles refresh.
          }
        },
      },
    },
  );

  const {
    data: { session },
  } = await ssrClient.auth.getSession();

  const authModes = options.auth ?? 'user';
  const { data: auth, error } = await verifyCredentials(
    { token: session?.access_token ?? null, apikey: null },
    { auth: authModes, env: nextEnv },
  );

  if (error) {
    return {
      data: null,
      error: { message: error.message, status: error.status },
    };
  }

  const supabase = createContextClient({
    auth: { token: auth!.token },
    env: nextEnv,
  });
  const supabaseAdmin = createAdminClient({ env: nextEnv });

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: auth!.userClaims,
      jwtClaims: auth!.jwtClaims,
      authMode: auth!.authMode,
      authKeyName: auth!.keyName ?? undefined,
    },
    error: null,
  };
}

export async function getCurrentUserProfile() {
  const { data: ctx, error } = await createSupabaseContext({ auth: 'user' });
  if (error || !ctx?.userClaims) return null;

  const { data: profile } = await ctx.supabase
    .from('users')
    .select('*')
    .eq('id', ctx.userClaims.id)
    .single();

  return profile;
}
