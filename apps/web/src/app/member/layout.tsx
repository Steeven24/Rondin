import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

/** Members use the app on their phone, so content is a single narrow column. */
export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("member");
  return (
    <>
      <AppHeader badge="Miembro" userName={profile.full_name} />
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-5">{children}</main>
    </>
  );
}
