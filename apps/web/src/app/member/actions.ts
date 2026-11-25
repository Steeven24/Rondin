"use server";

import { type VisitInput, visitInputSchema } from "@rondin/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Saves (or corrects) the visit of a premise assigned to the member. */
export async function saveVisit(input: VisitInput) {
  const profile = await requireRole("member");
  const parsed = visitInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };

  const supabase = await createClient();
  // user_id and group_id are overwritten by a database trigger; sent only to satisfy the types.
  const { data, error } = await supabase
    .from("visits")
    .upsert(
      { ...parsed.data, user_id: profile.id, group_id: profile.group_id ?? "", visited_at: new Date().toISOString() },
      { onConflict: "premise_id" },
    )
    .select("id, group_id")
    .single();

  if (error || !data) return { error: "No se pudo guardar la visita." };
  return { visitId: data.id, groupId: data.group_id };
}

const photoSchema = z.object({
  visitId: z.uuid(),
  storagePath: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.jpg$/),
  takenAt: z.iso.datetime(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

/** Records the metadata of a photo already uploaded to the private bucket. */
export async function addPhoto(input: z.infer<typeof photoSchema>) {
  const profile = await requireRole("member");
  const parsed = photoSchema.safeParse(input);
  if (!parsed.success) return { error: "Foto no válida." };

  const supabase = await createClient();
  const { error } = await supabase.from("photos").insert({
    visit_id: parsed.data.visitId,
    group_id: profile.group_id ?? "",
    storage_path: parsed.data.storagePath,
    taken_at: parsed.data.takenAt,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
  });
  if (error) return { error: "No se pudo registrar la foto." };

  revalidatePath("/member");
  return {};
}
