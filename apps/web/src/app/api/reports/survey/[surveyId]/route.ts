import { getProfile } from "@/lib/auth";
import { excelResponse, loadReportGroups } from "@/lib/reports";
import { createClient } from "@/lib/supabase/server";

/** Consolidated report of every group in a survey. Coordinators only. */
export async function GET(_: Request, { params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await params;
  const profile = await getProfile();
  if (profile?.role !== "coordinator") return new Response("Forbidden", { status: 403 });

  const supabase = await createClient();
  const { data: survey } = await supabase.from("surveys").select("name").eq("id", surveyId).maybeSingle();
  if (!survey) return new Response("Not found", { status: 404 });

  const { data: groups } = await supabase.from("groups").select("id").eq("survey_id", surveyId);
  const reportGroups = await loadReportGroups(supabase, (groups ?? []).map((g) => g.id));
  return excelResponse(`Informe consolidado · ${survey.name}`, reportGroups, `consolidado-${survey.name}`);
}
