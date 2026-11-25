import "server-only";
import { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

/** The survey in progress (there is at most one), or null. */
export async function getActiveSurvey(supabase: Client) {
  const { data } = await supabase
    .from("surveys")
    .select("id, name, institution, period, created_at")
    .eq("status", "active")
    .maybeSingle();
  return data;
}
