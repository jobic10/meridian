"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  CalendarClock,
  Pill,
  FlaskConical,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/rbac";
import { UserMenu } from "@/components/dashboard/user-menu";
import type { AuthorisedUser } from "@/lib/session";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutGrid,
  "/patients": Users,
  "/appointments": CalendarClock,
  "/pharmacy": Pill,
  "/lab": FlaskConical,
  "/admin/reports": BarChart3,
  "/admin/staff": ShieldCheck,
};

export function Sidebar({ user }: { user: AuthorisedUser }) {
  const activePath = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary font-display text-[16px] text-white">
          M
        </div>
        <div>
          <p className="font-display text-[15px] leading-none text-ink">
            Meridian
          </p>
          <p className="mt-0.5 text-[11px] leading-none text-ink-faint">
            Ilera General Hospital
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const Icon = ICONS[item.href] ?? LayoutGrid;
            const isActive =
              activePath === item.href ||
              (item.href !== "/dashboard" && activePath.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium transition-colors ${
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                  }`}
                >
                  <Icon className="size-[17px]" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <UserMenu name={user.name} role={user.role} />
      </div>
    </aside>
  );
}
