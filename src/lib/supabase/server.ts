import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPublicSupabaseConfig } from './env';
import type { User } from '@/types/database.types';

/** Cookie-based Supabase client for Server Components and legacy call sites. */
export async function createClient() {
  const { url, publishableKey } = getPublicSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
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
          // Server Components cannot write cookies.
        }
      },
    },
  });
}

/** @deprecated Prefer `getCurrentUserProfile()` from `@/lib/supabase/context`. */
export async function getCurrentUser(): Promise<User | null> {
  const { getCurrentUserProfile } = await import('./context');
  return getCurrentUserProfile();
}
