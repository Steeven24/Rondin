"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/** A link is active on its own page and on its sub-pages; a section home only on itself. */
function isActive(pathname: string, href: string, items: NavItem[]) {
  if (pathname === href) return true;
  const isSectionHome = items.some((item) => item.href !== href && item.href.startsWith(`${href}/`));
  return !isSectionHome && pathname.startsWith(`${href}/`);
}

/** Header navigation that highlights the current section. */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones" className="flex flex-wrap gap-1 text-sm">
      {items.map((item) => {
        const active = isActive(pathname, item.href, items);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 ${
              active ? "bg-brand-tint font-semibold text-white" : "text-[#dcdcf3] hover:bg-brand-tint/60 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
