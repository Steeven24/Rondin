import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { VisitForm } from "./visit-form";

export default async function VisitPage({ params }: { params: Promise<{ premiseId: string }> }) {
  const { premiseId } = await params;
  await requireRole("member");
  const supabase = await createClient();

  // RLS only returns the premise if it is assigned to this member.
  const { data: premise } = await supabase
    .from("premises")
    .select("id, ruc, trade_name, owner_name, activity, address, visits(id, status, registration_number, notes, review_status, photos(count))")
    .eq("id", premiseId)
    .maybeSingle();
  if (!premise) notFound();

  const visit = premise.visits;
  const photoCount = visit?.photos?.[0]?.count ?? 0;
  const locked = visit?.review_status === "approved";

  return (
    <>
      <Link href="/member" className="text-sm text-brand">← Mis locales</Link>
      <div className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-4">
        <h1 className="text-xl font-semibold">{premise.trade_name ?? "Sin nombre comercial"}</h1>
        <span className="text-sm text-muted">{premise.owner_name}</span>
        <span className="text-sm text-muted">{premise.activity} · {premise.address}</span>
        <span className="font-mono text-xs text-muted">RUC {premise.ruc}</span>
      </div>
      {locked ? (
        <p className="rounded-xl bg-ok-soft px-4 py-3 text-sm text-ok">Esta visita ya fue aprobada por tu líder.</p>
      ) : (
        <VisitForm premiseId={premise.id} existingPhotos={photoCount} initial={visit ?? undefined} />
      )}
    </>
  );
}
