import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getPublicSupabaseConfig } from './env';

let browserClient: SupabaseClient | undefined;

/**
 * Returns a shared browser Supabase client. `createBrowserClient` sets up a
 * GoTrueClient (auth listener + storage subscription) on every call, so
 * calling this per-request (as every service function does) previously
 * created dozens of redundant auth clients per page. Memoize on the module
 * singleton instead.
 */
export function createClient() {
  if (!browserClient) {
    const { url, publishableKey } = getPublicSupabaseConfig();
    browserClient = createBrowserClient(url, publishableKey);
  }
  return browserClient;
}
