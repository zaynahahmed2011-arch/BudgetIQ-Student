// Financial Health Score (0-100)
//
// Weighted blend of four signals, each normalized to [0, 1] before weighting:
//   - budgetAdherence (30%): how much of the monthly budget is left unspent,
//     pace-adjusted for how far into the month we are.
//   - savingsHabit (30%): total saved this month (goal contributions) as a
//     share of the monthly budget.
//   - overspendingFrequency (25%, inverted): fraction of days this month
//     where spending on that day exceeded the "safe" daily pace
//     (budget / daysInMonth * 1.5). Fewer bad days -> higher score.
//   - goalProgress (15%): average completion % across active savings goals.

export interface ScoreInput {
  monthlyBudget: number;
  totalSpentThisMonth: number;
  dailySpend: { date: string; amount: number }[]; // this month, one entry per day with a transaction
  daysElapsedInMonth: number;
  daysInMonth: number;
  totalSavedThisMonth: number;
  goalProgressRatios: number[]; // currentAmount / targetAmount per active goal, each already clamped [0,1]
}

export interface ScoreBreakdown {
  score: number;
  budgetAdherence: number;
  savingsHabit: number;
  overspendingFrequency: number;
  goalProgress: number;
}

const WEIGHTS = {
  budgetAdherence: 0.3,
  savingsHabit: 0.3,
  overspendingFrequency: 0.25,
  goalProgress: 0.15,
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function calculateFinancialScore(input: ScoreInput): ScoreBreakdown {
  const {
    monthlyBudget,
    totalSpentThisMonth,
    dailySpend,
    daysElapsedInMonth,
    daysInMonth,
    totalSavedThisMonth,
    goalProgressRatios,
  } = input;

  const safeBudget = monthlyBudget > 0 ? monthlyBudget : 1;

  // Pace-adjusted budget adherence: compare actual spend to the "expected"
  // spend if the budget were evenly spread across the days elapsed so far.
  const expectedSpendSoFar =
    (safeBudget / daysInMonth) * Math.max(daysElapsedInMonth, 1);
  const budgetAdherence = clamp01(
    1 - Math.max(0, totalSpentThisMonth - expectedSpendSoFar) / safeBudget
  );

  const savingsHabit = clamp01(totalSavedThisMonth / (safeBudget * 0.2));

  const safeDailyPace = (safeBudget / daysInMonth) * 1.5;
  const overspendDays = dailySpend.filter(
    (d) => d.amount > safeDailyPace
  ).length;
  const overspendingFrequency = clamp01(
    1 - overspendDays / Math.max(daysElapsedInMonth, 1)
  );

  const goalProgress =
    goalProgressRatios.length > 0
      ? clamp01(
          goalProgressRatios.reduce((a, b) => a + b, 0) /
            goalProgressRatios.length
        )
      : 0.5; // neutral default when the student hasn't set any goals yet

  const score = Math.round(
    (budgetAdherence * WEIGHTS.budgetAdherence +
      savingsHabit * WEIGHTS.savingsHabit +
      overspendingFrequency * WEIGHTS.overspendingFrequency +
      goalProgress * WEIGHTS.goalProgress) *
      100
  );

  return {
    score,
    budgetAdherence,
    savingsHabit,
    overspendingFrequency,
    goalProgress,
  };
}

export function scoreLabel(score: number) {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-500" };
  if (score >= 70) return { label: "Good", color: "text-lime-500" };
  if (score >= 50) return { label: "Fair", color: "text-amber-500" };
  return { label: "Needs Attention", color: "text-rose-500" };
}
