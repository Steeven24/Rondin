"use client";

import {
  STATUSES_REQUIRING_PHOTO,
  STATUSES_REQUIRING_REGISTRATION,
  VISIT_STATUS_LABELS,
  VISIT_STATUSES,
  type VisitStatus,
} from "@rondin/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui";
import { compressPhoto, getPosition, uploadPhoto } from "@/lib/photos";
import { addPhoto, saveVisit } from "../../actions";

interface VisitFormProps {
  premiseId: string;
  existingPhotos: number;
  initial?: { status: VisitStatus; registration_number: string | null; notes: string | null };
}

interface CapturedPhoto {
  file: File;
  preview: string;
  takenAt: string;
}

export function VisitForm({ premiseId, existingPhotos, initial }: VisitFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<VisitStatus | null>(initial?.status ?? null);
  const [registration, setRegistration] = useState(initial?.registration_number ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  const needsRegistration = !!status && STATUSES_REQUIRING_REGISTRATION.includes(status);
  const needsPhoto = !!status && STATUSES_REQUIRING_PHOTO.includes(status);

  async function handleCapture(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("El archivo no es una imagen.");
    const compressed = await compressPhoto(file);
    setPhotos((current) => [
      ...current,
      { file: compressed, preview: URL.createObjectURL(compressed), takenAt: new Date().toISOString() },
    ]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!status) return setError("Elige el estado de la visita.");
    if (needsRegistration && !registration.trim()) return setError("Ingresa el número de registro anual.");
    if (needsPhoto && photos.length + existingPhotos === 0) return setError("Toma al menos una foto de respaldo.");

    setSaving("Obteniendo ubicación…");
    const position = await getPosition();

    setSaving("Guardando visita…");
    const result = await saveVisit({
      premise_id: premiseId,
      status,
      registration_number: needsRegistration ? registration : null,
      notes,
      latitude: position?.latitude ?? null,
      longitude: position?.longitude ?? null,
    });
    if (result.error || !result.visitId || !result.groupId) {
      setSaving("");
      return setError(result.error ?? "No se pudo guardar la visita.");
    }

    try {
      for (const [index, photo] of photos.entries()) {
        setSaving(`Subiendo foto ${index + 1} de ${photos.length}…`);
        const path = await uploadPhoto(result.groupId, result.visitId, photo.file);
        const saved = await addPhoto({
          visitId: result.visitId,
          storagePath: path,
          takenAt: photo.takenAt,
          latitude: position?.latitude ?? null,
          longitude: position?.longitude ?? null,
        });
        if (saved.error) throw new Error(saved.error);
      }
    } catch {
      setSaving("");
      return setError("La visita se guardó, pero alguna foto no se subió. Vuelve a intentarlo.");
    }

    router.push("/member?tab=done");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Estado del local</legend>
        {VISIT_STATUSES.map((value) => (
          <label
            key={value}
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-white px-3.5 text-[15px] ${status === value ? "border-2 border-brand" : "border-line-strong"}`}
          >
            <input type="radio" name="status" value={value} checked={status === value} onChange={() => setStatus(value)} className="h-4 w-4 accent-brand" />
            {VISIT_STATUS_LABELS[value]}
          </label>
        ))}
      </fieldset>

      {needsRegistration && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Número de registro anual
          <input value={registration} onChange={(e) => setRegistration(e.target.value)} maxLength={40} required className="h-12 rounded-xl border border-line-strong bg-white px-3.5 font-mono text-[15px] font-normal" />
        </label>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">
          Fotos de respaldo {needsPhoto ? "(obligatorias)" : "(opcional)"}
        </span>
        {existingPhotos > 0 && <span className="text-xs text-muted">{existingPhotos} foto(s) ya guardada(s).</span>}
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img key={photo.preview} src={photo.preview} alt="Foto capturada" className="aspect-square w-full rounded-xl object-cover" />
          ))}
          {/* capture="environment" opens the rear camera directly, so photos are taken on site. */}
          <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line-strong bg-white text-center text-xs font-semibold text-brand">
            Tomar foto
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => handleCapture(e.target.files?.[0])} />
          </label>
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Observación
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={3} className="rounded-xl border border-line-strong bg-white p-3.5 text-[15px] font-normal" />
      </label>

      {error && <Alert>{error}</Alert>}
      <button type="submit" disabled={!!saving} className="h-12 rounded-2xl bg-brand text-[15px] font-semibold text-white disabled:opacity-60">
        {saving || "Guardar visita"}
      </button>
    </form>
  );
}
