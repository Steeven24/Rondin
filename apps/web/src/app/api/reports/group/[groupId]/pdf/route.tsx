import { renderToBuffer } from "@react-pdf/renderer";
import { getProfile } from "@/lib/auth";
import { GroupReport } from "@/lib/pdf/group-report";
import { loadPdfReportData } from "@/lib/pdf/report-data";
import { createClient } from "@/lib/supabase/server";

// Photos are downloaded and embedded, which can take a while for large groups.
export const maxDuration = 60;

/** Institutional PDF of a group. Leaders get only their active group; coordinators any group. */
export async function GET(_: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const profile = await getProfile();
  const allowed = profile?.role === "coordinator" || (profile?.role === "leader" && profile.group_id === groupId);
  if (!allowed) return new Response("Forbidden", { status: 403 });

  const supabase = await createClient();
  const data = await loadPdfReportData(supabase, groupId);
  if (!data) return new Response("Not found", { status: 404 });

  const pdf = await renderToBuffer(<GroupReport data={data} />);
  const fileName = `informe-${data.group.name}`.replace(/[^\w.-]+/g, "_");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
