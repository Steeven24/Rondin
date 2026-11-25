import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deployment check: which Supabase project the app points to and whether its keys work.
 * Shows only the host (already public) and yes/no checks, never the keys themselves.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  const secret = process.env.SUPABASE_SECRET_KEY ?? "";

  let host: string | null = null;
  let path: string | null = null;
  try {
    const parsed = new URL(url);
    host = parsed.host;
    path = parsed.pathname;
  } catch {
    // Invalid or missing URL: reported below.
  }

  let authReachable = false;
  let publishableKeyAccepted = false;
  if (host) {
    try {
      const res = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/settings`, {
        headers: { apikey: publishable },
        cache: "no-store",
      });
      authReachable = res.status !== 404;
      publishableKeyAccepted = res.ok;
    } catch {
      authReachable = false;
    }
  }

  return NextResponse.json(
    {
      supabaseHost: host,
      urlHasExtraPath: path !== null && path !== "/" && path !== "",
      publishableKeyFormatOk: publishable.startsWith("sb_publishable_") && publishable.trim() === publishable,
      secretKeyPresent: secret.length > 0,
      secretKeyFormatOk: secret.startsWith("sb_secret_") && secret.trim() === secret,
      authReachable,
      publishableKeyAccepted,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
