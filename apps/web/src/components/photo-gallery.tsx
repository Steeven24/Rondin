import type { EvidencePhoto } from "@/lib/evidence";
import { mapsUrl } from "@/lib/evidence";

const dateTime = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Guayaquil",
});

/** Evidence photos with date, time and GPS. Tapping a photo opens it full size. */
export function PhotoGallery({ photos }: { photos: EvidencePhoto[] }) {
  if (photos.length === 0) {
    return <p className="text-sm text-muted">Esta visita no tiene fotos de respaldo.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo, i) => (
        <li key={photo.id} className="flex flex-col gap-1.5">
          <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-line bg-soft">
            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL from private storage */}
            <img src={photo.url} alt={`Foto ${i + 1} de la visita`} loading="lazy" className="aspect-square w-full object-cover" />
          </a>
          <span className="text-xs text-muted">{dateTime.format(new Date(photo.takenAt))}</span>
          {photo.latitude !== null && photo.longitude !== null && (
            <a href={mapsUrl(photo.latitude, photo.longitude)} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-brand">
              {photo.latitude.toFixed(5)}, {photo.longitude.toFixed(5)}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
