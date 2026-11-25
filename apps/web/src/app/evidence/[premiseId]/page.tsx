import { REVIEW_STATUS_LABELS } from "@rondin/core";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoGallery } from "@/components/photo-gallery";
import { StatusChip } from "@/components/status-chip";
import { HOME_BY_ROLE, requireRole } from "@/lib/auth";
import { loadEvidence, mapsUrl } from "@/lib/evidence";
import { createClient } from "@/lib/supabase/server";
import { ReviewPanel } from "../review-panel";

export const metadata: Metadata = { title: "Evidencia de la visita" };

const dateTime = new Intl.DateTimeFormat("es-EC", { dateStyle: "long", timeStyle: "short", timeZone: "America/Guayaquil" });

/** One premise with its visit result and photos. Linked from the leader's table and the Excel report. */
export default async function EvidencePage({ params }: { params: Promise<{ premiseId: string }> }) {
  const { premiseId } = await params;
  const profile = await requireRole("coordinator", "leader", "member");
  const supabase = await createClient();
  const evidence = await loadEvidence(supabase, premiseId);
  if (!evidence) notFound();
  const { premise, visit, photos } = evidence;

  return (
    <>
      <Link href={HOME_BY_ROLE[profile.role]} className="text-sm text-brand">← Volver</Link>

      <section className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-5">
        <span className="text-xs text-muted">{premise.groups?.name}</span>
        <h1 className="text-xl font-semibold sm:text-2xl">{premise.trade_name ?? "Sin nombre comercial"}</h1>
        <span className="text-sm text-muted">{premise.owner_name}</span>
        <span className="text-sm text-muted">{[premise.activity, premise.address].filter(Boolean).join(" · ")}</span>
        <span className="font-mono text-xs text-muted">RUC {premise.ruc}{premise.phone ? ` · Tel. ${premise.phone}` : ""}</span>
      </section>

      {!visit ? (
        <p className="rounded-2xl border border-line bg-white p-5 text-muted">Este local todavía no tiene una visita registrada.</p>
      ) : (
        <>
          <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Resultado de la visita</h2>
              <StatusChip status={visit.status} />
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted">N.º funcionamiento</dt>
              <dd className="font-mono">{visit.registration_number ?? "—"}</dd>
              <dt className="text-muted">Observación</dt>
              <dd>{visit.notes ?? "—"}</dd>
              <dt className="text-muted">Visitado por</dt>
              <dd>{visit.author?.full_name ?? "—"}</dd>
              <dt className="text-muted">Fecha</dt>
              <dd>{dateTime.format(new Date(visit.visited_at))}</dd>
              <dt className="text-muted">Ubicación</dt>
              <dd>
                {visit.latitude !== null && visit.longitude !== null ? (
                  <a href={mapsUrl(visit.latitude, visit.longitude)} target="_blank" rel="noopener noreferrer" className="text-brand">
                    Ver en el mapa
                  </a>
                ) : (
                  "Sin GPS"
                )}
              </dd>
              <dt className="text-muted">Revisión</dt>
              <dd>
                {REVIEW_STATUS_LABELS[visit.review_status]}
                {visit.review_comment ? ` · ${visit.review_comment}` : ""}
              </dd>
            </dl>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-semibold">Fotos de respaldo ({photos.length})</h2>
            <PhotoGallery photos={photos} />
          </section>

          {/* Only leaders review; RLS limits them to their group's active survey. */}
          {profile.role === "leader" && <ReviewPanel visitId={visit.id} status={visit.review_status} />}
        </>
      )}
    </>
  );
}
