"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Repeat, Lock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { DetectedSubscription } from "@/lib/subscription-detector";

export function SubscriptionsCard({ isPro, currency }: { isPro: boolean; currency: string }) {
  const [subscriptions, setSubscriptions] = useState<DetectedSubscription[] | null>(null);

  useEffect(() => {
    if (!isPro) return;
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => setSubscriptions(data.subscriptions ?? []));
  }, [isPro]);

  if (!isPro) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Repeat className="size-4 text-primary" /> Recurring subscriptions
          </CardTitle>
          <CardDescription>
            Pro scans your transaction history to find charges that repeat monthly — subscriptions
            you might have forgotten about.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/pricing" className={buttonVariants({ size: "sm" })}>
            <Lock className="size-3.5" /> Upgrade to Pro
          </Link>
        </CardContent>
      </Card>
    );
  }

  const total = subscriptions?.reduce((s, sub) => s + sub.estimatedMonthlySpend, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Repeat className="size-4 text-primary" /> Recurring subscriptions
        </CardTitle>
        <CardDescription>Charges that repeat month to month, detected automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptions === null && (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Scanning your transactions...
          </div>
        )}

        {subscriptions !== null && subscriptions.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recurring charges detected yet — they show up once the same charge appears in two
            different months.
          </p>
        )}

        {subscriptions !== null && subscriptions.length > 0 && (
          <>
            <div className="mb-4 rounded-xl bg-secondary px-4 py-3">
              <p className="text-xs text-secondary-foreground/80">Estimated recurring spend</p>
              <p className="text-xl font-semibold text-secondary-foreground">
                {formatCurrency(total, currency)}/mo
              </p>
            </div>
            <div className="divide-y divide-border">
              {subscriptions.map((sub) => (
                <div key={sub.description} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{sub.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.category} · seen {sub.occurrences}x across {sub.months.length} months
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(sub.estimatedMonthlySpend, currency)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
