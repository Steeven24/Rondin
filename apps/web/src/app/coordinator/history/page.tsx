import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Historial" };

const dateFormat = new Intl.DateTimeFormat("es-EC", { dateStyle: "long", timeZone: "America/Guayaquil" });

/** Closed surveys, read-only, with their reports. Only coordinators can open it (see layout). */
export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: surveys } = await supabase
    .from("surveys")
    .select("id, name, institution, period, created_at, closed_at, groups(id, name, position)")
    .eq("status", "closed")
    .order("closed_at", { ascending: false });

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold tracking-tight">Historial</h1>
        <p className="text-sm text-muted">Relevamientos cerrados. Sus datos están en solo lectura.</p>
      </div>

      {(surveys ?? []).length === 0 && (
        <p className="rounded-2xl border border-line bg-white p-6 text-muted">Todavía no hay relevamientos cerrados.</p>
      )}

      {(surveys ?? []).map((survey) => {
        const groups = [...(survey.groups ?? [])].sort((a, b) => a.position - b.position);
        const details = [survey.institution, survey.period].filter(Boolean).join(" · ");
        return (
          <article key={survey.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-lg font-semibold">{survey.name}</h2>
                {details && <span className="text-sm text-muted">{details}</span>}
                <span className="text-xs text-muted">
                  {dateFormat.format(new Date(survey.created_at))} – {survey.closed_at ? dateFormat.format(new Date(survey.closed_at)) : ""} · {groups.length} grupos
                </span>
              </div>
              <a href={`/api/reports/survey/${survey.id}`} className="flex h-11 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
                Informe consolidado (Excel)
              </a>
            </div>
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-brand">Informes por grupo</summary>
              <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
                {groups.map((g) => (
                  <li key={g.id} className="flex min-h-11 items-center gap-2 rounded-xl border border-line-strong px-3.5 py-2 text-sm">
                    <span className="flex-1">{g.name}</span>
                    <a href={`/api/reports/group/${g.id}/pdf`} className="rounded-lg bg-brand-soft px-2.5 py-1.5 font-semibold text-brand-dark">PDF</a>
                    <a href={`/api/reports/group/${g.id}`} className="rounded-lg px-2.5 py-1.5 font-semibold text-brand hover:bg-soft">Excel</a>
                  </li>
                ))}
              </ul>
            </details>
          </article>
        );
      })}
    </>
  );
}
