import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

/** Members use the app on their phone, so content is a single narrow column. */
export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("member");
  return (
    <>
      <AppHeader badge="Miembro" userName={profile.full_name} />
      {/* Extra bottom space so the install banner never covers the last premise. */}
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 pt-5 pb-28">{children}</main>
    </>
  );
}
