"use client";

import type { ParsedRow, ParsedSheet } from "@rondin/core";
import { Pagination, usePagination } from "@/components/pagination";

const ROW_STYLES: Record<ParsedRow["level"], string> = {
  ok: "bg-white",
  warning: "bg-[#fffbea]",
  error: "bg-[#fff6ec]",
};

const COLUMNS = ["Fila", "RUC", "Tipo", "Nombre comercial", "Representante legal", "Dirección", "Teléfono", "Valor", "Observaciones"];

interface SheetPreviewProps {
  sheet: ParsedSheet;
  onFixRuc: (rowNumber: number, value: string) => void;
}

/** Paginated preview of one sheet. Rows with a damaged RUC can be fixed inline. */
export function SheetPreview({ sheet, onFixRuc }: SheetPreviewProps) {
  const pagination = usePagination(sheet.rows, 10);

  if (sheet.isReference) {
    return <p className="text-sm text-muted">Hoja de referencia con el listado general: no se convierte en grupo ni se sube.</p>;
  }
  if (sheet.missingColumns.length > 0) {
    return <p className="text-sm text-bad">Esta hoja no tiene una columna RUC reconocible y se omitirá.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[960px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-canvas text-left text-muted">
              {COLUMNS.map((h) => (
                <th key={h} className="px-3 py-2.5 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagination.pageItems.map((row) => (
              <tr key={row.rowNumber} className={`border-t border-soft ${ROW_STYLES[row.level]}`}>
                <td className="px-3 py-2 text-muted">{row.rowNumber}</td>
                <td className="px-3 py-2 font-mono">
                  {row.premise.ruc ?? (
                    <input
                      aria-label={`Corregir RUC de la fila ${row.rowNumber}`}
                      defaultValue={row.rawRuc}
                      onBlur={(e) => onFixRuc(row.rowNumber, e.target.value)}
                      className="w-36 rounded-md border border-[#e0a060] bg-white px-2 py-1 font-mono text-[#b4530a]"
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-muted">{row.premise.activity ?? "—"}</td>
                <td className="px-3 py-2 font-semibold">{row.premise.trade_name ?? "—"}</td>
                <td className="px-3 py-2">{row.premise.owner_name ?? "—"}</td>
                <td className="px-3 py-2 text-muted">{row.premise.address ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-muted">{row.premise.phone ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-muted">{row.premise.value ?? "—"}</td>
                <td className="px-3 py-2 text-xs text-warn">{row.messages.join(" ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination {...pagination} onChange={pagination.setPage} />
    </div>
  );
}
