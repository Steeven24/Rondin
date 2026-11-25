"use server";

import { type SurveyImport, surveyImportSchema } from "@rondin/core";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ImportResult {
  error?: string;
  surveyId?: string;
}

/** Validates the parsed Excel again on the server and creates the survey in one transaction. */
export async function importSurvey(payload: SurveyImport): Promise<ImportResult> {
  await requireRole("coordinator");

  const parsed = surveyImportSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `Datos no válidos (${issue?.path.join(".")}): ${issue?.message}` };
  }

  const { name, institution, period, groups } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("import_survey", {
    p_name: name,
    p_institution: institution ?? "",
    p_period: period ?? "",
    p_groups: groups,
  });

  if (error?.message.includes("Close the active survey")) {
    return { error: "Ya hay un relevamiento activo. Ciérralo desde el panel general antes de subir otro." };
  }
  if (error) return { error: "No se pudo guardar el relevamiento. Inténtalo de nuevo." };

  revalidatePath("/coordinator");
  return { surveyId: data };
}
