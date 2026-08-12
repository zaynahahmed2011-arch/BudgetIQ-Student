"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { LogOut, Save, Sparkles } from "lucide-react";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/categories";
import { PLANS, type PlanId } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export interface CategoryLimitItem {
  category: string;
  monthlyCap: number;
}

export function SettingsClient({
  name,
  email,
  plan,
  initialMonthlyBudget,
  initialCurrency,
  initialCategoryLimits,
}: {
  name: string;
  email: string;
  plan: string;
  initialMonthlyBudget: number;
  initialCurrency: string;
  initialCategoryLimits: CategoryLimitItem[];
}) {
  const currentPlan = PLANS[plan as PlanId] ?? PLANS.free;
  const [monthlyBudget, setMonthlyBudget] = useState(String(initialMonthlyBudget));
  const [currency, setCurrency] = useState(initialCurrency);
  const [limits, setLimits] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const c of CATEGORIES) map[c] = "0";
    for (const l of initialCategoryLimits) map[l.category] = String(l.monthlyCap);
    return map;
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/budget", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthlyBudget: Number(monthlyBudget) || 0,
        currency,
        categoryLimits: CATEGORIES.filter((c) => c !== "Savings" && c !== "Other").map((c) => ({
          category: c,
          monthlyCap: Number(limits[c]) || 0,
        })),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Couldn't save your settings");
      return;
    }
    toast.success("Settings saved");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Input value={name} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
            <div>
              <p className="text-sm font-medium">Appearance</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" /> Plan
            </CardTitle>
            <CardDescription>{currentPlan.tagline}</CardDescription>
          </div>
          <Badge variant={plan === "free" ? "secondary" : "default"} className="text-sm">
            {currentPlan.name}
          </Badge>
        </CardHeader>
        <CardContent>
          <Link href="/pricing" className={buttonVariants({ variant: "outline" })}>
            {plan === "free" ? "View plans & upgrade" : "Manage plan"}
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly budget</CardTitle>
          <CardDescription>This is your total allowance for the month.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Monthly budget</Label>
              <Input
                type="number"
                min={0}
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Currency symbol</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={5} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category budget caps</CardTitle>
          <CardDescription>
            Optional monthly limits per category — used to keep spending on track.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CATEGORIES.filter((c) => c !== "Savings" && c !== "Other").map((c) => (
            <div key={c} className="flex flex-col gap-1.5">
              <Label>
                {CATEGORY_META[c as Category].emoji} {c}
              </Label>
              <Input
                type="number"
                min={0}
                value={limits[c]}
                onChange={(e) => setLimits((l) => ({ ...l, [c]: e.target.value }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="size-4" /> Sign out
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-4" /> {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
