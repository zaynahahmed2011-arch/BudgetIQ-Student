import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { generateMonthlyDeepDive, isAiConfigured } from "@/lib/ai";
import { buildFinancialContext } from "@/lib/finance-data";
import { requirePlan } from "@/lib/entitlements";
import { startOfMonth, endOfMonth } from "@/lib/utils";

export async function GET() {
  const { userId, error } = await requireUserId();
  if (error) return error;

  const reports = await prisma.monthlyReport.findMany({
    where: { userId: userId! },
    orderBy: { monthStart: "desc" },
    take: 12,
  });

  return NextResponse.json({
    reports: reports.map((r) => ({
      ...r,
      insights: JSON.parse(r.insights) as string[],
      recommendations: JSON.parse(r.recommendations) as string[],
    })),
  });
}

export async function POST() {
  const { userId, error } = await requireUserId();
  if (error) return error;

  if (!isAiConfigured()) {
    return errorResponse(
      "AI reports aren't configured yet. Add ANTHROPIC_API_KEY to .env to enable them.",
      503
    );
  }

  if (!(await requirePlan(userId!, "pro"))) {
    return errorResponse("The monthly deep-dive report requires Pro. Upgrade to unlock it.", 402);
  }

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [context, monthTransactions] = await Promise.all([
    buildFinancialContext(userId!),
    prisma.transaction.findMany({
      where: { userId: userId!, date: { gte: monthStart, lte: monthEnd } },
    }),
  ]);

  const monthSpent = monthTransactions.reduce((s, t) => s + t.amount, 0);

  const result = await generateMonthlyDeepDive({
    ...context,
    monthSpent,
    monthTransactionCount: monthTransactions.length,
  });

  const combinedInsights = [
    ...result.insights,
    `Month-over-month: ${result.monthOverMonthComparison}`,
  ];

  const report = await prisma.monthlyReport.create({
    data: {
      userId: userId!,
      monthStart,
      monthEnd,
      totalSpent: monthSpent,
      summary: result.summary,
      insights: JSON.stringify(combinedInsights),
      recommendations: JSON.stringify(result.recommendations),
    },
  });

  return NextResponse.json({
    report: {
      ...report,
      insights: combinedInsights,
      recommendations: result.recommendations,
    },
  });
}
