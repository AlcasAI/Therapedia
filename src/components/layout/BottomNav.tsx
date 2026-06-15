"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Phone, User, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminEnabled } from "@/lib/config";

const baseItems = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/protocols", label: "Protocolli", icon: FileText, exact: false },
  { href: "/contacts", label: "Contatti", icon: Phone, exact: false },
  { href: "/profile", label: "Profilo", icon: User, exact: false },
];

export function BottomNav() {
  const pathname = usePathname();
  const items = isAdminEnabled()
    ? [
        ...baseItems,
        { href: "/admin", label: "Admin", icon: ShieldCheck, exact: false },
      ]
    : baseItems;

  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-app items-stretch justify-around">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-brand-600"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "stroke-[2.25]")}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
