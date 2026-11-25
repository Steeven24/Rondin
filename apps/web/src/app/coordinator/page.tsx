import Link from "next/link";
import { ProgressBar } from "@/components/progress-bar";
import { percent, PROGRESS_STATE, type ProgressState, progressState, sumProgress } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";

const FILTERS: [string, string][] = [
  ["all", "Todos"],
  ["behind", "Atrasados"],
  ["done", "Listos"],
];

export default async function CoordinatorDashboard({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = "all" } = await searchParams;
  const supabase = await createClient();

  const { data: survey } = await supabase
    .from("surveys")
    .select("id, name, institution")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!survey) {
    return (
      <section className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-white p-8">
        <h1 className="text-2xl font-semibold">Aún no hay un relevamiento</h1>
        <p className="text-muted">Sube el Excel con los locales para crear los grupos.</p>
        <Link href="/coordinator/import" className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">
          Subir Excel
        </Link>
      </section>
    );
  }

  const { data: rows = [] } = await supabase
    .from("group_progress")
    .select("*")
    .eq("survey_id", survey.id)
    .order("position");
  const groups = (rows ?? []).map((g) => ({
    ...g,
    state: progressState(Number(g.visited), Number(g.total_premises)),
  }));
  const totals = sumProgress(rows ?? []);
  const shown = filter === "all" ? groups : groups.filter((g) => g.state === (filter as ProgressState));

  const kpis = [
    { label: "Locales asignados", value: totals.total, note: `${groups.length} grupos` },
    { label: "Visitados", value: totals.visited, note: `${percent(totals.visited, totals.total)}% del total` },
    { label: "Con registro de funcionamiento", value: totals.withPermit, note: "número anual registrado" },
    { label: "No existen o cerrados", value: totals.notFound + totals.closed, note: "con foto de respaldo" },
  ];
  const results = [
    { label: "Funciona, con permiso", n: totals.withPermit, color: "#2f9e5d" },
    { label: "Funciona, sin permiso", n: totals.withoutPermit, color: "#30329b" },
    { label: "Cerrado temporalmente", n: totals.closed, color: "#e0b02b" },
    { label: "No existe en la dirección", n: totals.notFound, color: "#d9603b" },
    { label: "No se pudo visitar", n: totals.notVisited, color: "#8b8da8" },
    { label: "Pendiente de visita", n: totals.total - totals.visited, color: "#cbcce0" },
  ];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted">{survey.name}</span>
          <h1 className="text-[28px] font-semibold tracking-tight">Panel general</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/coordinator/import" className="flex h-11 items-center rounded-xl border border-line-strong bg-white px-4 text-sm font-semibold">
            Subir Excel
          </Link>
          <a href={`/api/reports/survey/${survey.id}`} className="flex h-11 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
            Informe consolidado (Excel)
          </a>
        </div>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-white px-5 py-4">
            <span className="text-[13px] text-muted">{k.label}</span>
            <span className="text-[32px] leading-tight font-semibold tracking-tight">{k.value}</span>
            <span className="text-[13px] text-muted">{k.note}</span>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-start gap-5">
        <section className="flex min-w-0 flex-[999_1_600px] flex-col gap-3.5 rounded-2xl border border-line bg-white px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Avance por grupo</h2>
            <nav aria-label="Filtro" className="flex rounded-[10px] bg-soft p-[3px]">
              {FILTERS.map(([id, label]) => (
                <Link
                  key={id}
                  href={`/coordinator?filter=${id}`}
                  aria-current={filter === id ? "true" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-[13px] ${filter === id ? "bg-white font-semibold shadow-sm" : ""}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="py-2 font-normal">Grupo</th>
                  <th className="py-2 font-normal">Líder</th>
                  <th className="py-2 font-normal">Locales</th>
                  <th className="py-2 font-normal">Avance</th>
                  <th className="py-2 font-normal">Estado</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((g) => {
                  const pct = percent(Number(g.visited), Number(g.total_premises));
                  const state = PROGRESS_STATE[g.state];
                  return (
                    <tr key={g.group_id} className="border-b border-soft">
                      <td className="py-3 font-semibold">{g.group_name}</td>
                      <td className="py-3">{g.leader_name ?? <span className="text-muted">Sin líder</span>}</td>
                      <td className="py-3 font-mono text-[13px]">{g.visited}/{g.total_premises}</td>
                      <td className="py-3">
                        <span className="flex items-center gap-2.5">
                          <ProgressBar value={pct} color={state.bar} label={`Avance de ${g.group_name}`} />
                          <span className="w-10 text-right text-[13px] text-muted">{pct}%</span>
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${state.chip}`}>{state.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-2xl border border-line bg-white px-5 py-5">
          <h2 className="text-lg font-semibold">Resultado de las visitas</h2>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            {results.map((r) => (
              <span key={r.label} style={{ flex: r.n, background: r.color }} />
            ))}
          </div>
          <ul className="flex flex-col gap-2">
            {results.map((r) => (
              <li key={r.label} className="flex items-center gap-2.5 text-sm">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: r.color }} aria-hidden="true" />
                <span className="flex-1">{r.label}</span>
                <span className="font-mono text-[13px]">{r.n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
