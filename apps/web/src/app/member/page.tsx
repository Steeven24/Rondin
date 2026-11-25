import type { Metadata } from "next";
import Link from "next/link";
import { InstallApp } from "@/components/install-app";
import { StatusChip } from "@/components/status-chip";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mis locales" };

function directionsUrl(address: string | null, sector: string | null) {
  const query = [address, sector, "Ecuador"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default async function MemberPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "pending" } = await searchParams;
  const profile = await requireRole("member");
  const supabase = await createClient();

  const { data } = await supabase
    .from("premises")
    .select("id, trade_name, owner_name, address, phone, sector, visits(status, review_status, review_comment)")
    .eq("assigned_to", profile.id)
    .order("sector", { nullsFirst: false })
    .order("trade_name");

  const premises = data ?? [];
  const pending = premises.filter((p) => !p.visits || p.visits.review_status === "returned");
  const done = premises.filter((p) => p.visits && p.visits.review_status !== "returned");
  const shown = tab === "done" ? done : pending;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Mis locales</h1>
        <p className="text-sm text-muted">{done.length} de {premises.length} visitados</p>
      </div>

      <nav aria-label="Filtro" className="flex rounded-xl bg-[#e9eaf5] p-[3px]">
        {[
          ["pending", `Pendientes (${pending.length})`],
          ["done", `Visitados (${done.length})`],
        ].map(([id, label]) => (
          <Link
            key={id}
            href={`/member?tab=${id}`}
            aria-current={tab === id ? "true" : undefined}
            className={`flex h-11 flex-1 items-center justify-center rounded-[10px] text-sm ${tab === id ? "bg-white font-semibold shadow-sm" : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Members work from the phone: offer to install the app here too. */}
      <InstallApp />

      {shown.length === 0 && <p className="py-8 text-center text-sm text-muted">No hay locales en esta lista.</p>}

      <ul className="flex flex-col gap-3">
        {shown.map((p) => (
          <li key={p.id} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-semibold">{p.trade_name ?? "Sin nombre comercial"}</span>
                <span className="text-xs text-muted">{p.owner_name}</span>
              </div>
              {p.visits && <StatusChip status={p.visits.status} />}
            </div>
            <p className="text-sm text-muted">{[p.address, p.sector].filter(Boolean).join(" · ") || "Sin dirección"}</p>
            {p.visits?.review_status === "returned" && p.visits.review_comment && (
              <p className="rounded-lg bg-warn-soft px-3 py-2 text-[13px] text-warn">Devuelta: {p.visits.review_comment}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <a href={directionsUrl(p.address, p.sector)} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center rounded-xl border border-line-strong px-3.5 text-sm font-semibold">
                Cómo llegar
              </a>
              {p.phone && (
                <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="flex h-11 items-center rounded-xl border border-line-strong px-3.5 text-sm font-semibold">
                  Llamar
                </a>
              )}
              <Link href={`/member/visit/${p.id}`} className="ml-auto flex h-11 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white">
                {p.visits ? "Ver o corregir" : "Registrar visita"}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
