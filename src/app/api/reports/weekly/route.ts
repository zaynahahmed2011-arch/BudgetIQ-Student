import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { generateWeeklySummary, isAiConfigured } from "@/lib/ai";
import { buildFinancialContext } from "@/lib/finance-data";

export async function GET() {
  const { userId, error } = await requireUserId();
  if (error) return error;

  const reports = await prisma.weeklyReport.findMany({
    where: { userId: userId! },
    orderBy: { weekStart: "desc" },
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

  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 86400000);

  const [context, weekTransactions] = await Promise.all([
    buildFinancialContext(userId!),
    prisma.transaction.findMany({
      where: { userId: userId!, date: { gte: weekStart, lte: now } },
    }),
  ]);

  const weekSpent = weekTransactions.reduce((s, t) => s + t.amount, 0);

  const result = await generateWeeklySummary({
    ...context,
    weekSpent,
    weekTransactionCount: weekTransactions.length,
  });

  const report = await prisma.weeklyReport.create({
    data: {
      userId: userId!,
      weekStart,
      weekEnd: now,
      totalSpent: weekSpent,
      summary: result.summary,
      insights: JSON.stringify(result.insights),
      recommendations: JSON.stringify(result.recommendations),
    },
  });

  return NextResponse.json({
    report: {
      ...report,
      insights: result.insights,
      recommendations: result.recommendations,
    },
  });
}
