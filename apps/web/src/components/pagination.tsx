"use client";

import { useEffect, useState } from "react";

/** Splits a list into pages. Goes back to page 1 when the list changes (filter, sheet). */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => setPage(1), [items.length, pageSize]);

  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;
  return {
    page: current,
    pageCount,
    setPage,
    pageItems: items.slice(start, start + pageSize),
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, items.length),
    total: items.length,
  };
}

interface PaginationProps {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  onChange: (page: number) => void;
}

/** "1–10 de 154" with previous/next buttons and page numbers. */
export function Pagination({ page, pageCount, from, to, total, onChange }: PaginationProps) {
  if (total === 0) return null;

  // Show the first, last and the pages around the current one.
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  const button = "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm disabled:opacity-40";
  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 px-1 text-[13px] text-muted">
      <span>
        {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" className={`${button} border border-line-strong`} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Página anterior">
          ‹
        </button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            {i > 0 && p - (pages[i - 1] ?? p) > 1 && <span aria-hidden="true">…</span>}
            <button
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onChange(p)}
              className={`${button} ${p === page ? "bg-brand font-semibold text-white" : "hover:bg-soft"}`}
            >
              {p}
            </button>
          </span>
        ))}
        <button type="button" className={`${button} border border-line-strong`} disabled={page === pageCount} onClick={() => onChange(page + 1)} aria-label="Página siguiente">
          ›
        </button>
      </div>
    </nav>
  );
}
