"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/assistant": "AI Assistant",
  "/goals": "Savings Goals",
  "/reports": "Reports",
  "/pricing": "Plans & Upgrade",
  "/settings": "Settings",
};

export function Topbar({
  userName,
  userImage,
}: {
  userName: string;
  userImage?: string | null;
}) {
  const pathname = usePathname();
  const title =
    Object.entries(TITLES).find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    "BudgetIQ";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-4 backdrop-blur md:px-8">
      <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar name={userName} src={userImage} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="px-2.5 py-1.5 text-sm font-medium">{userName}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => (window.location.href = "/settings")}>
              <UserIcon className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
