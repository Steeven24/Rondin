"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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
