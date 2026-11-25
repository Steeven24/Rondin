import type { Database } from "@rondin/core";
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Supabase client for Client Components (used for photo uploads from the phone). */
export function createClient() {
  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseKey);
}
