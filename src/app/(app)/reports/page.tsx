import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAiConfigured } from "@/lib/ai";
import { planConfig } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreTrendChart } from "@/components/reports/score-trend-chart";
import { ReportsClient } from "@/components/reports/reports-client";
import { SubscriptionsCard } from "@/components/reports/subscriptions-card";
import { MonthlyReportsClient } from "@/components/reports/monthly-reports-client";

export default async function ReportsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, reports, monthlyReports, scores] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.weeklyReport.findMany({
      where: { userId },
      orderBy: { weekStart: "desc" },
      take: 12,
    }),
    prisma.monthlyReport.findMany({
      where: { userId },
      orderBy: { monthStart: "desc" },
      take: 12,
    }),
    prisma.financialScore.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 60,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Reports</h2>
        <p className="text-sm text-muted-foreground">
          AI-generated weekly recaps and your financial health trend.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Health Score trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreTrendChart
            data={scores.map((s) => ({ date: s.date.toISOString(), score: s.score }))}
          />
        </CardContent>
      </Card>

      <SubscriptionsCard
        isPro={planConfig(user.plan).subscriptionDetector}
        currency={user.currency}
      />

      <ReportsClient
        initialReports={reports.map((r) => ({
          id: r.id,
          weekStart: r.weekStart.toISOString(),
          weekEnd: r.weekEnd.toISOString(),
          summary: r.summary,
          insights: JSON.parse(r.insights),
          recommendations: JSON.parse(r.recommendations),
          totalSpent: r.totalSpent,
        }))}
        currency={user.currency}
        aiConfigured={isAiConfigured()}
        hasWeeklyReports={planConfig(user.plan).weeklyReports}
      />

      <MonthlyReportsClient
        initialReports={monthlyReports.map((r) => ({
          id: r.id,
          monthStart: r.monthStart.toISOString(),
          monthEnd: r.monthEnd.toISOString(),
          summary: r.summary,
          insights: JSON.parse(r.insights),
          recommendations: JSON.parse(r.recommendations),
          totalSpent: r.totalSpent,
        }))}
        currency={user.currency}
        aiConfigured={isAiConfigured()}
        isPro={planConfig(user.plan).monthlyDeepDive}
      />
    </div>
  );
}
