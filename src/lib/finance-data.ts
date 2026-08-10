import { prisma } from "@/lib/prisma";
import { calculateFinancialScore } from "@/lib/financial-score";
import { startOfMonth, endOfMonth, daysElapsedInMonth, daysInMonth } from "@/lib/utils";
import type { FinancialContext } from "@/lib/ai";

export async function getFinancialSnapshot(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [transactionsThisMonth, allRecentTransactions, goals, contributionsThisMonth] =
    await Promise.all([
      prisma.transaction.findMany({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: "desc" },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 15,
      }),
      prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      prisma.goalContribution.findMany({
        where: { goal: { userId }, date: { gte: monthStart, lte: monthEnd } },
      }),
    ]);

  const totalSpentThisMonth = transactionsThisMonth.reduce((s, t) => s + t.amount, 0);
  const remainingBudget = user.monthlyBudget - totalSpentThisMonth;

  const spendingByCategoryMap = new Map<string, number>();
  for (const t of transactionsThisMonth) {
    spendingByCategoryMap.set(
      t.category,
      (spendingByCategoryMap.get(t.category) ?? 0) + t.amount
    );
  }
  const spendingByCategory = Array.from(spendingByCategoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const dailySpendMap = new Map<string, number>();
  for (const t of transactionsThisMonth) {
    const key = t.date.toISOString().slice(0, 10);
    dailySpendMap.set(key, (dailySpendMap.get(key) ?? 0) + t.amount);
  }
  const dailySpend = Array.from(dailySpendMap.entries()).map(([date, amount]) => ({
    date,
    amount,
  }));

  const totalSavedThisMonth = contributionsThisMonth.reduce((s, c) => s + c.amount, 0);

  const goalProgressRatios = goals.map((g) =>
    g.targetAmount > 0 ? Math.min(1, g.currentAmount / g.targetAmount) : 0
  );

  const scoreBreakdown = calculateFinancialScore({
    monthlyBudget: user.monthlyBudget,
    totalSpentThisMonth,
    dailySpend,
    daysElapsedInMonth: daysElapsedInMonth(now),
    daysInMonth: daysInMonth(now),
    totalSavedThisMonth,
    goalProgressRatios,
  });

  const daysLeftInMonth = daysInMonth(now) - daysElapsedInMonth(now);

  return {
    user,
    monthStart,
    monthEnd,
    transactionsThisMonth,
    recentTransactions: allRecentTransactions,
    goals,
    totalSpentThisMonth,
    remainingBudget,
    spendingByCategory,
    dailySpend,
    totalSavedThisMonth,
    daysLeftInMonth,
    scoreBreakdown,
  };
}

// Persists one FinancialScore row per user per day so the Reports page can
// chart a trend over time. Safe to call on every dashboard load.
export async function recordDailyScoreSnapshot(userId: string) {
  const snapshot = await getFinancialSnapshot(userId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existing = await prisma.financialScore.findFirst({
    where: { userId, date: { gte: todayStart } },
  });

  const data = {
    score: snapshot.scoreBreakdown.score,
    budgetAdherence: snapshot.scoreBreakdown.budgetAdherence,
    savingsHabit: snapshot.scoreBreakdown.savingsHabit,
    overspendingFrequency: snapshot.scoreBreakdown.overspendingFrequency,
    goalProgress: snapshot.scoreBreakdown.goalProgress,
  };

  if (existing) {
    await prisma.financialScore.update({ where: { id: existing.id }, data });
  } else {
    await prisma.financialScore.create({ data: { userId, ...data } });
  }

  return snapshot;
}

export async function buildFinancialContext(userId: string): Promise<FinancialContext> {
  const snapshot = await getFinancialSnapshot(userId);
  return {
    studentName: snapshot.user.name ?? "Student",
    currency: snapshot.user.currency,
    monthlyBudget: snapshot.user.monthlyBudget,
    totalSpentThisMonth: snapshot.totalSpentThisMonth,
    remainingBudget: snapshot.remainingBudget,
    daysLeftInMonth: snapshot.daysLeftInMonth,
    spendingByCategory: snapshot.spendingByCategory,
    recentTransactions: snapshot.recentTransactions.map((t) => ({
      description: t.description,
      category: t.category,
      amount: t.amount,
      date: t.date.toISOString().slice(0, 10),
    })),
    savingsGoals: snapshot.goals.map((g) => ({
      name: g.name,
      currentAmount: g.currentAmount,
      targetAmount: g.targetAmount,
    })),
    financialHealthScore: snapshot.scoreBreakdown.score,
  };
}
