"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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
