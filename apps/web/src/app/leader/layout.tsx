import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

export default async function LeaderLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("leader");
  return (
    <>
      <AppHeader badge="Líder" userName={profile.full_name} />
      <main className="mx-auto flex max-w-[1360px] flex-col gap-5 px-5 py-7 sm:px-7">{children}</main>
    </>
  );
}
