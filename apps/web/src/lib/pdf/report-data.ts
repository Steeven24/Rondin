import "server-only";
import type { VisitStatus } from "@rondin/core";
import { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

export interface PdfPhoto {
  data: Buffer;
  takenAt: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PdfPremise {
  ruc: string;
  tradeName: string | null;
  ownerName: string | null;
  activity: string | null;
  address: string | null;
  status: VisitStatus | null;
  registrationNumber: string | null;
  notes: string | null;
  visitedBy: string | null;
  visitedAt: string | null;
  photos: PdfPhoto[];
}

export interface PdfReportData {
  reportNumber: string;
  issuedAt: Date;
  survey: { name: string; institution: string | null; period: string | null; startedAt: string; closedAt: string | null };
  group: { name: string; teamCode: string | null };
  leader: { name: string; nationalId: string | null } | null;
  coordinator: { name: string; nationalId: string | null } | null;
  members: { name: string; nationalId: string | null; assigned: number; visited: number }[];
  premises: PdfPremise[];
}

/** Photos are downloaded a few at a time to keep memory and connections low. */
async function downloadPhotos(supabase: Client, paths: string[]): Promise<Map<string, Buffer>> {
  const result = new Map<string, Buffer>();
  for (let i = 0; i < paths.length; i += 6) {
    const batch = paths.slice(i, i + 6);
    const files = await Promise.all(batch.map((p) => supabase.storage.from("visit-photos").download(p)));
    const buffers = await Promise.all(files.map(({ data }) => (data ? data.arrayBuffer() : Promise.resolve(null))));
    buffers.forEach((buffer, j) => {
      const path = batch[j];
      if (buffer && path) result.set(path, Buffer.from(buffer));
    });
  }
  return result;
}

/** Everything the group PDF needs. Returns null if the group doesn't exist or isn't visible (RLS). */
export async function loadPdfReportData(supabase: Client, groupId: string): Promise<PdfReportData | null> {
  const { data: group } = await supabase
    .from("groups")
    .select("id, name, team_id, surveys(name, institution, period, created_at, closed_at, created_by), teams(code, leader_id)")
    .eq("id", groupId)
    .maybeSingle();
  if (!group || !group.surveys) return null;

  const [{ data: people }, { data: premises }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, national_id, role").or(`team_id.eq.${group.team_id},id.eq.${group.surveys.created_by}`),
    supabase
      .from("premises")
      .select(
        `ruc, trade_name, owner_name, activity, address, assigned_to, visits(status, registration_number, notes, visited_at, user_id, photos(storage_path, taken_at, latitude, longitude))`,
      )
      .eq("group_id", groupId)
      .order("trade_name"),
  ]);

  const byId = new Map((people ?? []).map((p) => [p.id, p]));
  const leaderProfile = group.teams?.leader_id ? byId.get(group.teams.leader_id) : undefined;
  const coordinatorProfile = byId.get(group.surveys.created_by);
  const rows = premises ?? [];

  const photoPaths = rows.flatMap((p) => p.visits?.photos?.map((ph) => ph.storage_path) ?? []);
  const photos = await downloadPhotos(supabase, photoPaths);

  const members = (people ?? [])
    .filter((p) => p.role === "member")
    .map((m) => ({
      name: m.full_name,
      nationalId: m.national_id,
      assigned: rows.filter((r) => r.assigned_to === m.id).length,
      visited: rows.filter((r) => r.visits?.user_id === m.id).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const issuedAt = new Date();
  const stamp = issuedAt.toISOString().slice(0, 10).replace(/-/g, "");
  return {
    reportNumber: `INF-${group.teams?.code ?? "G"}-${stamp}`,
    issuedAt,
    survey: {
      name: group.surveys.name,
      institution: group.surveys.institution || null,
      period: group.surveys.period || null,
      startedAt: group.surveys.created_at,
      closedAt: group.surveys.closed_at,
    },
    group: { name: group.name, teamCode: group.teams?.code ?? null },
    leader: leaderProfile ? { name: leaderProfile.full_name, nationalId: leaderProfile.national_id } : null,
    coordinator: coordinatorProfile ? { name: coordinatorProfile.full_name, nationalId: coordinatorProfile.national_id } : null,
    members,
    premises: rows.map((p) => ({
      ruc: p.ruc,
      tradeName: p.trade_name,
      ownerName: p.owner_name,
      activity: p.activity,
      address: p.address,
      status: p.visits?.status ?? null,
      registrationNumber: p.visits?.registration_number ?? null,
      notes: p.visits?.notes ?? null,
      visitedBy: p.visits?.user_id ? (byId.get(p.visits.user_id)?.full_name ?? null) : null,
      visitedAt: p.visits?.visited_at ?? null,
      photos: (p.visits?.photos ?? [])
        .map((ph) => ({ data: photos.get(ph.storage_path), takenAt: ph.taken_at, latitude: ph.latitude, longitude: ph.longitude }))
        .filter((ph): ph is PdfPhoto => !!ph.data),
    })),
  };
}
