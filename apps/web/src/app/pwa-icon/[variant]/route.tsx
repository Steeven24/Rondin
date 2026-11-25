import { brandIcon } from "@/lib/brand-icon";

const VARIANTS: Record<string, { size: number; maskable?: boolean }> = {
  "192": { size: 192 },
  "512": { size: 512 },
  "maskable-512": { size: 512, maskable: true },
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((variant) => ({ variant }));
}

/** App icons referenced by the web manifest. */
export async function GET(_: Request, { params }: { params: Promise<{ variant: string }> }) {
  const variant = VARIANTS[(await params).variant];
  if (!variant) return new Response("Not found", { status: 404 });
  return brandIcon(variant.size, { maskable: variant.maskable });
}
