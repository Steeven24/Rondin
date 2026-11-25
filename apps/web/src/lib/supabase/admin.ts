import "server-only";
import type { Database } from "@rondin/core";
import { createClient } from "@supabase/supabase-js";
import { env, requireSecretKey } from "@/lib/env";

/**
 * Privileged client that bypasses RLS. Use ONLY on the server, for operations that
 * can't be done as the user (creating accounts). Always check permissions before calling it.
 */
export function createAdminClient() {
  return createClient<Database>(env.supabaseUrl, requireSecretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
