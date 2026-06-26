import type { SupabaseEnv } from '@supabase/server';

/** Project URL — server-side canonical name; falls back to NEXT_PUBLIC_* for Next.js. */
export function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/** Publishable key for client + anon RLS contexts. */
export function getSupabasePublishableKey(): string | undefined {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Secret key for admin / service-role operations. Never expose to the browser. */
export function getSupabaseSecretKey(): string | undefined {
  return (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/** Remote JWKS endpoint for JWT verification (`auth: "user"`). */
export function getSupabaseJwksUrl(): string | undefined {
  const url = getSupabaseUrl();
  return (
    process.env.SUPABASE_JWKS_URL ??
    (url ? `${url}/auth/v1/.well-known/jwks.json` : undefined)
  );
}

/** Map framework env vars to the shape `@supabase/server` core primitives expect. */
export function resolveSupabaseEnv(): Partial<SupabaseEnv> {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();
  const secretKey = getSupabaseSecretKey();
  const jwksUrl = getSupabaseJwksUrl();

  return {
    url: url ?? undefined,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {},
    jwks: jwksUrl ? new URL(jwksUrl) : null,
  };
}

/** `@supabase/ssr` browser/server client pair — needs NEXT_PUBLIC_* at build time. */
export function getPublicSupabaseConfig() {
  return {
    url: getSupabaseUrl() ?? '',
    publishableKey: getSupabasePublishableKey() ?? '',
  };
}
