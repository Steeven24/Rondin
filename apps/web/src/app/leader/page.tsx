import type { Metadata } from "next";
import Link from "next/link";
import { ProgressBar } from "@/components/progress-bar";
import { requireRole } from "@/lib/auth";
import { percent } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import { PremisesTable } from "./premises-table";
import { RemoveMemberButton } from "./remove-member-button";

export const metadata: Metadata = { title: "Mi grupo" };

export default async function LeaderPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; review?: string }>;
}) {
  const { member, review } = await searchParams;
  const profile = await requireRole("leader");
  const supabase = await createClient();

  // The team (code and members) is permanent; the group holds this survey's premises.
  const teamId = profile.team_id ?? "";
  const groupId = profile.group_id ?? "";
  const [{ data: team }, { data: activeGroup }, { data: members }, { data: premises }] = await Promise.all([
    supabase.from("teams").select("id, name, invite_code").eq("id", teamId).maybeSingle(),
    supabase.from("groups").select("id, name").eq("id", groupId).maybeSingle(),
    supabase.from("profiles").select("id, full_name").eq("team_id", teamId).eq("role", "member").order("full_name"),
    supabase
      .from("premises")
      .select("id, trade_name, owner_name, activity, address, sector, assigned_to, visits(status, registration_number, review_status)")
      .eq("group_id", groupId)
      .order("sector", { nullsFirst: false })
      .order("trade_name"),
  ]);

  if (!team) return <p className="text-muted">No tienes un equipo asignado.</p>;
  if (!activeGroup) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6">
        <h1 className="text-2xl font-semibold">{team.name}</h1>
        <p className="text-muted">No hay un relevamiento activo para tu equipo. Cuando la coordinación suba el nuevo Excel, aquí verás tus locales.</p>
        <p className="text-sm">
          Código de invitación del equipo: <strong className="font-mono tracking-widest">{team.invite_code}</strong> · {members?.length ?? 0} miembros
        </p>
      </section>
    );
  }
  const group = { id: activeGroup.id, name: activeGroup.name, invite_code: team.invite_code };

  const rows = (premises ?? []).map((p) => ({ ...p, visit: p.visits ?? null }));
  const visited = rows.filter((r) => r.visit).length;
  const toReview = rows.filter((r) => r.visit?.review_status === "pending").length;
  const toReviewOnly = review === "pending";
  const shown = rows
    .filter((r) => !member || r.assigned_to === member)
    .filter((r) => !toReviewOnly || r.visit?.review_status === "pending");
  const selectedMember = (members ?? []).find((m) => m.id === member);
  const memberCards = [{ id: "", full_name: "Todos" }, ...(members ?? [])].map((m) => {
    const mine = rows.filter((r) => !m.id || r.assigned_to === m.id);
    return { ...m, done: mine.filter((r) => r.visit).length, total: mine.length };
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-64 flex-col gap-1.5">
          <h1 className="text-[28px] font-semibold tracking-tight">
            {group.name} · {rows.length} locales
          </h1>
          <div className="flex items-center gap-2.5 text-sm text-muted">
            <span className="w-48">
              <ProgressBar value={percent(visited, rows.length)} label="Avance del grupo" />
            </span>
            {visited} de {rows.length} visitados ·{" "}
            <Link
              href={toReviewOnly ? "/leader" : "/leader?review=pending"}
              aria-current={toReviewOnly ? "true" : undefined}
              className={`rounded-full px-2.5 py-0.5 font-semibold ${toReviewOnly ? "bg-brand text-white" : toReview > 0 ? "bg-warn-soft text-warn" : "text-muted"}`}
            >
              {toReview} por revisar
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-xl border border-dashed border-[#babbd9] px-4 py-2 text-sm">
            Código de invitación: <strong className="font-mono tracking-widest">{group.invite_code}</strong>
          </span>
          <a href={`/api/reports/group/${group.id}`} className="flex h-11 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Generar informe del grupo
          </a>
        </div>
      </div>

      <section aria-label="Miembros" className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
        {memberCards.map((m) => {
          const active = (member ?? "") === m.id;
          return (
            <Link
              key={m.id || "all"}
              href={m.id ? `/leader?member=${m.id}` : "/leader"}
              aria-current={active ? "true" : undefined}
              className={`flex flex-col gap-1 rounded-2xl bg-white px-3.5 py-3 ${active ? "border-2 border-brand" : "border border-line"}`}
            >
              <span className="text-sm font-semibold">{m.full_name}</span>
              <span className="text-xs text-muted">{m.done} de {m.total} visitados</span>
            </Link>
          );
        })}
      </section>

      {(members ?? []).length === 0 && (
        <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-dark">
          Comparte el código <strong className="font-mono">{group.invite_code}</strong> con tus miembros para que se unan al grupo.
        </p>
      )}

      {selectedMember && (
        <div className="flex justify-end">
          <RemoveMemberButton memberId={selectedMember.id} name={selectedMember.full_name} />
        </div>
      )}

      <PremisesTable key={`${member ?? "all"}-${review ?? ""}`} rows={shown} members={members ?? []} />
    </>
  );
}
