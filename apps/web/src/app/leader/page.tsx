import { REVIEW_STATUS_LABELS } from "@rondin/core";
import type { Metadata } from "next";
import Link from "next/link";
import { ProgressBar } from "@/components/progress-bar";
import { StatusChip } from "@/components/status-chip";
import { requireRole } from "@/lib/auth";
import { percent } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import { AssignSelect } from "./assign-select";

export const metadata: Metadata = { title: "Mi grupo" };

export default async function LeaderPage({ searchParams }: { searchParams: Promise<{ member?: string }> }) {
  const { member } = await searchParams;
  const profile = await requireRole("leader");
  const supabase = await createClient();

  const groupId = profile.group_id ?? "";
  const [{ data: group }, { data: members }, { data: premises }] = await Promise.all([
    supabase.from("groups").select("id, name, invite_code").eq("id", groupId).single(),
    supabase.from("profiles").select("id, full_name").eq("group_id", groupId).eq("role", "member").order("full_name"),
    supabase
      .from("premises")
      .select("id, trade_name, owner_name, sector, assigned_to, visits(status, registration_number, review_status)")
      .eq("group_id", groupId)
      .order("sector", { nullsFirst: false })
      .order("trade_name"),
  ]);

  if (!group) return <p className="text-muted">No tienes un grupo asignado.</p>;

  const rows = (premises ?? []).map((p) => ({ ...p, visit: p.visits ?? null }));
  const visited = rows.filter((r) => r.visit).length;
  const toReview = rows.filter((r) => r.visit?.review_status === "pending").length;
  const shown = member ? rows.filter((r) => r.assigned_to === member) : rows;
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
            {visited} de {rows.length} visitados · {toReview} por revisar
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

      <section className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-5 py-3 font-normal">Local</th>
              <th className="px-3 py-3 font-normal">Sector</th>
              <th className="px-3 py-3 font-normal">Asignado a</th>
              <th className="px-3 py-3 font-normal">Estado</th>
              <th className="px-3 py-3 font-normal">N.º registro anual</th>
              <th className="px-5 py-3 font-normal">Revisión</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-t border-soft">
                <td className="px-5 py-2.5">
                  <span className="flex flex-col">
                    <span className="font-semibold">{p.trade_name ?? "Sin nombre comercial"}</span>
                    <span className="text-xs text-muted">{p.owner_name}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted">{p.sector ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <AssignSelect premiseId={p.id} assignedTo={p.assigned_to} members={members ?? []} disabled={!!p.visit} />
                </td>
                <td className="px-3 py-2.5"><StatusChip status={p.visit?.status} /></td>
                <td className="px-3 py-2.5 font-mono text-[13px]">{p.visit?.registration_number ?? "·"}</td>
                <td className="px-5 py-2.5 text-[13px] text-muted">
                  {p.visit ? REVIEW_STATUS_LABELS[p.visit.review_status] : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
