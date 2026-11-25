import type { Metadata } from "next";
import Link from "next/link";
import { getActiveSurvey } from "@/lib/surveys";
import { createClient } from "@/lib/supabase/server";
import { LeaderForm } from "./leader-form";

export const metadata: Metadata = { title: "Grupos" };

export default async function GroupsPage() {
  const supabase = await createClient();
  const survey = await getActiveSurvey(supabase);

  if (!survey) {
    return (
      <p className="text-muted">
        No hay un relevamiento activo. <Link href="/coordinator/import" className="text-brand">Sube un Excel</Link> para empezar uno.
      </p>
    );
  }

  const [{ data: groups }, { data: teams }, { data: people }] = await Promise.all([
    supabase
      .from("group_progress")
      .select("group_id, group_name, team_id, team_code, leader_name, total_premises, visited")
      .eq("survey_id", survey.id)
      .order("position"),
    supabase.from("teams").select("id, invite_code"),
    supabase.from("profiles").select("team_id").eq("role", "member"),
  ]);
  const codeByTeam = new Map((teams ?? []).map((t) => [t.id, t.invite_code]));
  const membersByTeam = (people ?? []).reduce<Map<string, number>>((acc, p) => {
    if (p.team_id) acc.set(p.team_id, (acc.get(p.team_id) ?? 0) + 1);
    return acc;
  }, new Map());

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] text-muted">{survey.name}</span>
        <h1 className="text-[28px] font-semibold tracking-tight">Grupos</h1>
        <p className="text-sm text-muted">
          Los equipos se reconocen por su código (G1, G2…): su líder y sus miembros se mantienen en los siguientes relevamientos.
        </p>
      </div>
      <section className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {(groups ?? []).map((g) => (
          <article key={g.group_id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{g.group_name}</h2>
              <span className="font-mono text-[13px] text-muted">{g.visited}/{g.total_premises} locales</span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted">Equipo</dt>
              <dd>{g.team_code ?? <span className="text-warn">Sin código (G#)</span>}</dd>
              <dt className="text-muted">Líder</dt>
              <dd>{g.leader_name ?? "Sin asignar"}</dd>
              <dt className="text-muted">Miembros</dt>
              <dd>{g.team_id ? (membersByTeam.get(g.team_id) ?? 0) : 0}</dd>
              <dt className="text-muted">Código</dt>
              <dd className="font-mono tracking-widest">{g.team_id ? codeByTeam.get(g.team_id) : ""}</dd>
            </dl>
            {!g.leader_name && g.team_id && <LeaderForm teamId={g.team_id} />}
          </article>
        ))}
      </section>
    </>
  );
}
