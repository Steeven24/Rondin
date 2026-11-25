import type { Database } from "@rondin/core";

export type GroupProgress = Database["public"]["Views"]["group_progress"]["Row"];

/**
 * Progress of a group. There is no deadline in a survey, so we can't tell "behind";
 * the state only says whether the group has started and whether it is finished.
 */
export type ProgressState = "not_started" | "in_progress" | "done";

export const PROGRESS_STATE: Record<ProgressState, { label: string; chip: string; bar: string }> = {
  not_started: { label: "Sin iniciar", chip: "bg-soft text-muted", bar: "bg-[#cbcce0]" },
  in_progress: { label: "En curso", chip: "bg-brand-soft text-brand-dark", bar: "bg-brand" },
  done: { label: "Listo", chip: "bg-ok-soft text-ok", bar: "bg-[#2f9e5d]" },
};

export function percent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function progressState(done: number, total: number): ProgressState {
  if (total > 0 && done >= total) return "done";
  return done > 0 ? "in_progress" : "not_started";
}

/** Totals across all groups for the dashboard indicators. */
export function sumProgress(rows: GroupProgress[]) {
  const sum = (key: keyof GroupProgress) => rows.reduce((acc, row) => acc + Number(row[key] ?? 0), 0);
  return {
    total: sum("total_premises"),
    visited: sum("visited"),
    withPermit: sum("with_permit"),
    withoutPermit: sum("without_permit"),
    closed: sum("closed"),
    notFound: sum("not_found"),
    notVisited: sum("not_visited"),
  };
}
