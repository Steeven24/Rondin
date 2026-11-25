import { brandIcon } from "@/lib/brand-icon";

// Home screen icon for iPhone/iPad ("Agregar a inicio").
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return brandIcon(180);
}
