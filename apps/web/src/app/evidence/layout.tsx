import { ROLE_LABELS } from "@rondin/core";
import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

/** Evidence pages are shared by every role (each sees only what RLS allows). */
export default async function EvidenceLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("coordinator", "leader", "member");
  return (
    <>
      <AppHeader badge={ROLE_LABELS[profile.role]} userName={profile.full_name} />
      <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 pt-5 pb-16 sm:px-7">{children}</main>
    </>
  );
}
