import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeaderForm } from "./leader-form";

export const metadata: Metadata = { title: "Grupos" };

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: survey } = await supabase
    .from("surveys")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!survey) {
    return <p className="text-muted">Primero <Link href="/coordinator/import" className="text-brand">sube el Excel</Link>.</p>;
  }

  const { data: groups } = await supabase
    .from("group_progress")
    .select("group_id, group_name, leader_name, total_premises, visited")
    .eq("survey_id", survey.id)
    .order("group_name");
  const { data: codes } = await supabase.from("groups").select("id, invite_code").eq("survey_id", survey.id);
  const codeById = new Map((codes ?? []).map((g) => [g.id, g.invite_code]));

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] text-muted">{survey.name}</span>
        <h1 className="text-[28px] font-semibold tracking-tight">Grupos</h1>
      </div>
      <section className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {(groups ?? []).map((g) => (
          <article key={g.group_id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{g.group_name}</h2>
              <span className="font-mono text-[13px] text-muted">{g.visited}/{g.total_premises} locales</span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted">Líder</dt>
              <dd>{g.leader_name ?? "Sin asignar"}</dd>
              <dt className="text-muted">Código</dt>
              <dd className="font-mono tracking-widest">{g.group_id ? codeById.get(g.group_id) : ""}</dd>
            </dl>
            {!g.leader_name && g.group_id && <LeaderForm groupId={g.group_id} />}
          </article>
        ))}
      </section>
    </>
  );
}
