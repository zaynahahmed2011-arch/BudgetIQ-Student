"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Sparkles,
  PiggyBank,
  BarChart3,
  Crown,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/goals", label: "Savings Goals", icon: PiggyBank },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/pricing", label: "Plans & Upgrade", icon: Crown },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 px-4 py-6 md:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2 text-lg font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          ₹
        </span>
        BudgetIQ
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-xl bg-secondary p-4 text-xs text-secondary-foreground">
        <p className="font-semibold">Built for students</p>
        <p className="mt-1 text-secondary-foreground/80">
          Ask the AI Assistant anything about your money — it knows your budget.
        </p>
      </div>
    </aside>
  );
}
