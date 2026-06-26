import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseContext } from '@supabase/server';

/** Route-handler context with loosely typed clients (until codegen types are applied). */
export type AppSupabaseContext = Omit<SupabaseContext, 'supabase' | 'supabaseAdmin'> & {
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
};

export function asAppContext(ctx: SupabaseContext): AppSupabaseContext {
  return ctx as AppSupabaseContext;
}
