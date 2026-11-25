import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";

interface NavItem {
  href: string;
  label: string;
}

interface AppHeaderProps {
  badge: string;
  userName: string;
  nav?: NavItem[];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Top bar shared by every role: logo, role badge, navigation and sign-out. */
export function AppHeader({ badge, userName, nav = [] }: AppHeaderProps) {
  return (
    <header className="bg-brand text-[#dcdcf3]">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-7">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Inicio">
            <Logo size={32} />
          </Link>
          <span className="rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-semibold">{badge}</span>
        </div>
        {nav.length > 0 && (
          <nav aria-label="Secciones" className="flex flex-wrap gap-1 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-[#dcdcf3] hover:bg-brand-tint hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3 text-sm">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-bold text-brand-deep" aria-hidden="true">
            {initials(userName)}
          </span>
          <span className="hidden sm:inline">{userName}</span>
          <form action={logout}>
            <button type="submit" className="min-h-11 rounded-lg px-3 text-[#dcdcf3] hover:bg-brand-tint hover:text-white">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
