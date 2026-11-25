"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Removes a member from the leader's team (members carry over between surveys, so the
 * leader can drop who no longer takes part). Pending premises go back to "unassigned";
 * visits already recorded are kept. The account stays, without a team.
 */
export async function removeMember(memberId: string) {
  const leader = await requireRole("leader");
  if (!z.uuid().safeParse(memberId).success || !leader.team_id) return { error: "Datos no válidos." };

  const admin = createAdminClient();
  const { data: member } = await admin.from("profiles").select("team_id, role").eq("id", memberId).maybeSingle();
  if (!member || member.role !== "member" || member.team_id !== leader.team_id) {
    return { error: "Esa persona no es miembro de tu equipo." };
  }

  if (leader.group_id) {
    const { data: visited } = await admin.from("visits").select("premise_id").eq("user_id", memberId);
    const keep = (visited ?? []).map((v) => v.premise_id);
    let unassign = admin.from("premises").update({ assigned_to: null }).eq("assigned_to", memberId).eq("group_id", leader.group_id);
    if (keep.length > 0) unassign = unassign.not("id", "in", `(${keep.join(",")})`);
    await unassign;
  }

  const { error } = await admin.from("profiles").update({ team_id: null }).eq("id", memberId);
  if (error) return { error: "No se pudo quitar al miembro." };
  revalidatePath("/leader");
  return {};
}

const assignSchema = z.object({
  premiseId: z.uuid(),
  memberId: z.uuid().nullable(),
});

/**
 * Assigns a premise to a member of the leader's group (or unassigns it).
 * RLS limits the update to the leader's group and a trigger checks the member belongs to it.
 */
export async function assignPremise(premiseId: string, memberId: string | null) {
  await requireRole("leader");
  const parsed = assignSchema.safeParse({ premiseId, memberId });
  if (!parsed.success) return { error: "Datos no válidos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("premises")
    .update({ assigned_to: parsed.data.memberId })
    .eq("id", parsed.data.premiseId);

  if (error) return { error: "No se pudo asignar el local." };
  revalidatePath("/leader");
  return {};
}
