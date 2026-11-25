import type { Database } from "@rondin/core";

export type GroupProgress = Database["public"]["Views"]["group_progress"]["Row"];

export type ProgressState = "done" | "on_track" | "behind";

export const PROGRESS_STATE: Record<ProgressState, { label: string; chip: string; bar: string }> = {
  done: { label: "Listo", chip: "bg-ok-soft text-ok", bar: "bg-[#2f9e5d]" },
  on_track: { label: "En curso", chip: "bg-brand-soft text-brand-dark", bar: "bg-brand" },
  behind: { label: "Atrasado", chip: "bg-warn-soft text-warn", bar: "bg-[#e08a2b]" },
};

export function percent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function progressState(done: number, total: number): ProgressState {
  const value = percent(done, total);
  if (total > 0 && value === 100) return "done";
  return value >= 50 ? "on_track" : "behind";
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
