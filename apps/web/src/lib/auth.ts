import "server-only";
import type { Role } from "@rondin/core";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const HOME_BY_ROLE: Record<Role, string> = {
  coordinator: "/coordinator",
  leader: "/leader",
  member: "/member",
};

/** Profile of the signed-in user, or null. Cached for the duration of one request. */
export const getProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, group_id")
    .eq("id", user.id)
    .single();
  return data;
});

/** Redirects away unless the signed-in user has one of the given roles. */
export async function requireRole(...roles: Role[]) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!roles.includes(profile.role)) redirect(HOME_BY_ROLE[profile.role]);
  return profile;
}
