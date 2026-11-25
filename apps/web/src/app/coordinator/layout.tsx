import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

const NAV = [
  { href: "/coordinator", label: "Panel general" },
  { href: "/coordinator/import", label: "Carga de Excel" },
  { href: "/coordinator/groups", label: "Grupos" },
];

export default async function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("coordinator");
  return (
    <>
      <AppHeader badge="Coordinador" userName={profile.full_name} nav={NAV} />
      <main className="mx-auto flex max-w-[1360px] flex-col gap-5 px-5 py-7 sm:px-7">{children}</main>
    </>
  );
}
