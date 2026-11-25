"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const detailsSchema = z.object({
  surveyId: z.uuid(),
  name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(120),
  institution: z.string().trim().max(160),
  period: z.string().trim().max(60),
});

/** Edits the survey details shown in the dashboard and in the reports (e.g. the program name). */
export async function updateSurveyDetails(input: z.input<typeof detailsSchema>) {
  await requireRole("coordinator");
  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };

  const { surveyId, name, institution, period } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("surveys")
    .update({ name, institution: institution || null, period: period || null })
    .eq("id", surveyId);
  if (error) return { error: "No se pudieron guardar los datos." };

  revalidatePath("/coordinator", "layout");
  return {};
}

/**
 * Closes the active survey: it becomes read-only history and a new Excel can be uploaded.
 * Teams keep their leader and members for the next survey.
 */
export async function closeSurvey(surveyId: string) {
  await requireRole("coordinator");
  if (!z.uuid().safeParse(surveyId).success) return { error: "Datos no válidos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("surveys")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", surveyId)
    .eq("status", "active");
  if (error) return { error: "No se pudo cerrar el relevamiento." };

  revalidatePath("/coordinator", "layout");
  return {};
}
