import "server-only";
import { buildReportWorkbook, type ReportGroup } from "@rondin/core";
import { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

/** Loads the report rows of the given groups. RLS decides what the caller may read. */
export async function loadReportGroups(supabase: Client, groupIds: string[]): Promise<ReportGroup[]> {
  const [{ data: groups }, { data: premises }] = await Promise.all([
    supabase.from("groups").select("id, name").in("id", groupIds).order("position"),
    supabase
      .from("premises")
      .select(
        "group_id, ruc, trade_name, owner_name, activity, address, phone, value, visits(status, registration_number, notes)",
      )
      .in("group_id", groupIds)
      .order("trade_name"),
  ]);

  return (groups ?? []).map((g) => ({
    name: g.name,
    rows: (premises ?? [])
      .filter((p) => p.group_id === g.id)
      .map((p) => ({
        ruc: p.ruc,
        trade_name: p.trade_name,
        owner_name: p.owner_name,
        activity: p.activity,
        address: p.address,
        phone: p.phone,
        value: p.value,
        status: p.visits?.status ?? null,
        registration_number: p.visits?.registration_number ?? null,
        notes: p.visits?.notes ?? null,
      })),
  }));
}

/** Sends a workbook as a download. no-store: reports contain personal data. */
export function excelResponse(title: string, groups: ReportGroup[], fileName: string) {
  const safeName = fileName.replace(/[^\w.-]+/g, "_");
  return new Response(buildReportWorkbook(title, groups), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeName}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
