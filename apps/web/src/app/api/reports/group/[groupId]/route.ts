import { getProfile } from "@/lib/auth";
import { excelResponse, loadReportGroups } from "@/lib/reports";
import { createClient } from "@/lib/supabase/server";

/** Group report in Excel. Leaders get only their own group; coordinators any group. */
export async function GET(_: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const profile = await getProfile();
  const allowed =
    profile?.role === "coordinator" || (profile?.role === "leader" && profile.group_id === groupId);
  if (!allowed) return new Response("Forbidden", { status: 403 });

  const supabase = await createClient();
  const groups = await loadReportGroups(supabase, [groupId]);
  if (groups.length === 0) return new Response("Not found", { status: 404 });

  const name = groups[0]?.name ?? "Grupo";
  return excelResponse(`Informe de relevamiento de locales · ${name}`, groups, `informe-${name}`);
}
