"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const reviewSchema = z.discriminatedUnion("decision", [
  z.object({ visitId: z.uuid(), decision: z.literal("approved") }),
  z.object({
    visitId: z.uuid(),
    decision: z.literal("returned"),
    comment: z.string().trim().min(3, "Explica qué debe corregir").max(500),
  }),
]);

export type ReviewInput = z.input<typeof reviewSchema>;

/**
 * Leader approves a visit or returns it to the member with a comment.
 * RLS only lets leaders update visits of their own group in the active survey.
 * A member editing a returned visit sends it back to "pending" (database trigger).
 */
export async function reviewVisit(input: ReviewInput) {
  const leader = await requireRole("leader");
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .update({
      review_status: parsed.data.decision,
      review_comment: parsed.data.decision === "returned" ? parsed.data.comment : null,
      reviewed_by: leader.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.visitId)
    .select("premise_id")
    .maybeSingle();
  if (error || !data) return { error: "No se pudo guardar la revisión." };

  revalidatePath(`/evidence/${data.premise_id}`);
  revalidatePath("/leader");
  return {};
}
