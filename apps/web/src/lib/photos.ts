"use client";

import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export interface Position {
  latitude: number;
  longitude: number;
}

/** Current GPS position, or null if the user denies it or it takes too long. */
export function getPosition(timeoutMs = 10000): Promise<Position | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 },
    );
  });
}

/** Compresses a camera photo to ~500 KB to save mobile data and storage. */
export function compressPhoto(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    fileType: "image/jpeg",
    useWebWorker: true,
  });
}

/** Uploads a photo to the private bucket. Path: <group>/<visit>/<random>.jpg (checked by storage RLS). */
export async function uploadPhoto(groupId: string, visitId: string, photo: File): Promise<string> {
  const path = `${groupId}/${visitId}/${crypto.randomUUID()}.jpg`;
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("visit-photos")
    .upload(path, photo, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return path;
}
