"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PLANS, type PlanId } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PricingClient({
  isLoggedIn,
  currentPlan,
}: {
  isLoggedIn: boolean;
  currentPlan: PlanId | null;
}) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  async function selectPlan(plan: PlanId) {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/billing/mock-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        toast.error("Couldn't change your plan");
        return;
      }
      toast.success(
        plan === "free" ? "Downgraded to Free" : `You're now on ${PLANS[plan].name}!`
      );
      router.refresh();
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {(Object.values(PLANS) as (typeof PLANS)[PlanId][]).map((plan) => {
        const isCurrent = currentPlan === plan.id;
        const isPopular = plan.id === "premium";

        return (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col",
              isPopular && "border-primary shadow-md"
            )}
          >
            {isPopular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.tagline}</CardDescription>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  {plan.price === 0 ? "Free" : `$${plan.price.toFixed(2)}`}
                </span>
                {plan.price > 0 && <span className="text-sm text-muted-foreground">/mo</span>}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {!isLoggedIn ? (
                <Link
                  href="/sign-up"
                  className={buttonVariants({ variant: isPopular ? "default" : "outline" })}
                >
                  Get started
                </Link>
              ) : isCurrent ? (
                <Button variant="outline" disabled>
                  Current plan
                </Button>
              ) : (
                <Button
                  variant={isPopular ? "default" : "outline"}
                  onClick={() => selectPlan(plan.id)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : plan.id === "free" ? (
                    "Downgrade"
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
