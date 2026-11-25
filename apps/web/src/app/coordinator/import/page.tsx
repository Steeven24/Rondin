import type { Metadata } from "next";
import Link from "next/link";
import { getActiveSurvey } from "@/lib/surveys";
import { createClient } from "@/lib/supabase/server";
import { ImportWizard, type KnownTeam } from "./import-wizard";

export const metadata: Metadata = { title: "Carga del Excel" };

export default async function ImportPage() {
  const supabase = await createClient();
  const active = await getActiveSurvey(supabase);

  if (active) {
    return (
      <>
        <h1 className="text-[28px] font-semibold tracking-tight">Carga del Excel</h1>
        <section className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold">Hay un relevamiento en curso</h2>
          <p className="text-muted">
            «{active.name}» sigue activo. Ciérralo desde el panel general para pasarlo al historial y luego sube el nuevo Excel.
            Los equipos que tengan su código (G1, G2…) conservarán su líder y sus miembros.
          </p>
          <Link href="/coordinator" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">
            Ir al panel general
          </Link>
        </section>
      </>
    );
  }

  // teams.leader_id points to auth.users, so leader names are looked up in profiles separately.
  const [{ data: teams }, { data: leaders }] = await Promise.all([
    supabase.from("teams").select("code, leader_id"),
    supabase.from("profiles").select("id, full_name").eq("role", "leader"),
  ]);
  const leaderName = new Map((leaders ?? []).map((l) => [l.id, l.full_name]));
  const knownTeams: KnownTeam[] = (teams ?? [])
    .filter((t) => t.code)
    .map((t) => ({ code: t.code as string, leaderName: t.leader_id ? (leaderName.get(t.leader_id) ?? null) : null }));

  return (
    <>
      <h1 className="text-[28px] font-semibold tracking-tight">Carga del Excel</h1>
      <ImportWizard knownTeams={knownTeams} />
    </>
  );
}
