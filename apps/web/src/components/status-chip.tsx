import { VISIT_STATUS_LABELS, type VisitStatus } from "@rondin/core";

const STYLES: Record<VisitStatus | "pending", string> = {
  operating_with_permit: "bg-ok-soft text-ok",
  operating_without_permit: "bg-brand-soft text-brand-dark",
  temporarily_closed: "bg-warn-soft text-warn",
  not_found: "bg-bad-soft text-bad",
  not_visited: "bg-soft text-muted",
  pending: "bg-soft text-muted",
};

/** Colored chip with the visit result, or "Pendiente" when there is no visit yet. */
export function StatusChip({ status }: { status: VisitStatus | null | undefined }) {
  const key = status ?? "pending";
  const label = status ? VISIT_STATUS_LABELS[status] : "Pendiente";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[key]}`}>{label}</span>;
}
