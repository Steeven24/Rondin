"use client";

import { REVIEW_STATUS_LABELS, type ReviewStatus, type VisitStatus } from "@rondin/core";
import { Pagination, usePagination } from "@/components/pagination";
import { StatusChip } from "@/components/status-chip";
import { AssignSelect } from "./assign-select";

export interface PremiseRow {
  id: string;
  trade_name: string | null;
  owner_name: string | null;
  activity: string | null;
  address: string | null;
  assigned_to: string | null;
  visit: { status: VisitStatus; registration_number: string | null; review_status: ReviewStatus } | null;
}

interface PremisesTableProps {
  rows: PremiseRow[];
  members: { id: string; full_name: string }[];
}

/** Premises of the group, 15 per page, with the member each one is assigned to. */
export function PremisesTable({ rows, members }: PremisesTableProps) {
  const pagination = usePagination(rows, 15);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white pt-1.5 pb-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-5 py-3 font-normal">Local</th>
              <th className="px-3 py-3 font-normal">Tipo</th>
              <th className="px-3 py-3 font-normal">Dirección</th>
              <th className="px-3 py-3 font-normal">Asignado a</th>
              <th className="px-3 py-3 font-normal">Estado</th>
              <th className="px-3 py-3 font-normal">N.º funcionamiento</th>
              <th className="px-5 py-3 font-normal">Revisión</th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageItems.map((p) => (
              <tr key={p.id} className="border-t border-soft">
                <td className="px-5 py-2.5">
                  <span className="flex flex-col">
                    <span className="font-semibold">{p.trade_name ?? "Sin nombre comercial"}</span>
                    <span className="text-xs text-muted">{p.owner_name}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted">{p.activity ?? "—"}</td>
                <td className="max-w-56 px-3 py-2.5 text-muted">{p.address ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <AssignSelect premiseId={p.id} assignedTo={p.assigned_to} members={members} disabled={!!p.visit} />
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
      </div>
      <div className="px-4">
        <Pagination {...pagination} onChange={pagination.setPage} />
      </div>
    </section>
  );
}
