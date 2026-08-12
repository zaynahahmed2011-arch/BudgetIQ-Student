"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Lightbulb, TrendingUp, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface MonthlyReportItem {
  id: string;
  monthStart: string;
  monthEnd: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  totalSpent: number;
}

export function MonthlyReportsClient({
  initialReports,
  currency,
  aiConfigured,
  isPro,
}: {
  initialReports: MonthlyReportItem[];
  currency: string;
  aiConfigured: boolean;
  isPro: boolean;
}) {
  const [reports, setReports] = useState(initialReports);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/monthly", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't generate a report");
        return;
      }
      setReports((r) => [data.report, ...r]);
      toast.success("Monthly deep dive generated");
    } finally {
      setLoading(false);
    }
  }

  if (!isPro) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-primary" /> Monthly deep dive
          </CardTitle>
          <CardDescription>
            A richer, more analytical version of the weekly report — 5-7 detailed insights plus a
            month-over-month comparison. Pro only.
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Monthly deep dive</h3>
          <p className="text-sm text-muted-foreground">A more detailed, Pro-only monthly report.</p>
        </div>
        <Button onClick={generate} disabled={loading || !aiConfigured}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Generate this month&apos;s deep dive
        </Button>
      </div>

      {!aiConfigured && (
        <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          AI reports aren&apos;t configured — add ANTHROPIC_API_KEY to .env to enable them.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                {formatDate(report.monthStart)} – {formatDate(report.monthEnd)}
              </CardTitle>
              <Badge variant="secondary">{formatCurrency(report.totalSpent, currency)} spent</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm">{report.summary}</p>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                  <TrendingUp className="size-3.5" /> Insights
                </p>
                <ul className="flex flex-col gap-1.5">
                  {report.insights.map((insight, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-primary">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                  <Lightbulb className="size-3.5" /> Recommendations
                </p>
                <ul className="flex flex-col gap-1.5">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-success">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No monthly deep dives yet. Generate your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
