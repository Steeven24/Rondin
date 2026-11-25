import "server-only";
import { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

/** Signed photo links last one hour: enough to look at them, useless if shared later. */
const SIGNED_URL_SECONDS = 60 * 60;

export interface EvidencePhoto {
  id: string;
  url: string;
  takenAt: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * A premise with its visit and photos, as the signed-in user may see it.
 * RLS decides access (member: own visit, leader: own group, coordinator: everything),
 * and the storage policies decide which photos can be signed.
 */
export async function loadEvidence(supabase: Client, premiseId: string) {
  const { data: premise } = await supabase
    .from("premises")
    // One string literal (not concatenated) so the Supabase client can infer the result type.
    .select(
      `id, ruc, trade_name, owner_name, activity, address, phone, value, group_id, groups(name), visits(id, status, registration_number, notes, latitude, longitude, visited_at, review_status, review_comment, author:profiles!visits_user_id_fkey(full_name), photos(id, storage_path, taken_at, latitude, longitude))`,
    )
    .eq("id", premiseId)
    .maybeSingle();
  if (!premise) return null;

  const visit = premise.visits;
  const stored = [...(visit?.photos ?? [])].sort((a, b) => a.taken_at.localeCompare(b.taken_at));
  let photos: EvidencePhoto[] = [];
  if (stored.length > 0) {
    const { data: signed } = await supabase.storage
      .from("visit-photos")
      .createSignedUrls(stored.map((p) => p.storage_path), SIGNED_URL_SECONDS);
    photos = stored
      .map((p, i) => ({ id: p.id, url: signed?.[i]?.signedUrl ?? "", takenAt: p.taken_at, latitude: p.latitude, longitude: p.longitude }))
      .filter((p) => p.url);
  }

  return { premise, visit, photos };
}

export function mapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
