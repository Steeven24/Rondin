import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { type NavItem, NavLinks } from "@/components/nav-links";

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
      {/* Phone: logo and sign-out on one row, sections in a scrollable row below. Desktop: one row. */}
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-7 sm:py-3">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Inicio">
            <Logo size={32} />
          </Link>
          <span className="rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-semibold">{badge}</span>
        </div>
        {nav.length > 0 && (
          <div className="order-last -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 md:order-none md:mx-0 md:w-auto md:px-0">
            <NavLinks items={nav} />
          </div>
        )}
        <div className="flex items-center gap-2 text-sm sm:gap-3">
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
