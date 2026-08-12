export const PLAN_IDS = ["free", "premium", "pro"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number; // USD/mo, 0 for free
  tagline: string;
  maxGoals: number; // Infinity for unlimited
  aiMessagesPerMonth: number; // Infinity for unlimited
  weeklyReports: boolean;
  monthlyDeepDive: boolean;
  csvExport: boolean;
  subscriptionDetector: boolean;
  categoryBudgetAlerts: boolean;
  features: string[]; // display copy for pricing page
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "Everything you need to start tracking.",
    maxGoals: 2,
    aiMessagesPerMonth: 10,
    weeklyReports: false,
    monthlyDeepDive: false,
    csvExport: false,
    subscriptionDetector: false,
    categoryBudgetAlerts: false,
    features: [
      "AI natural-language expense logging",
      "Dashboard, spending charts & Financial Health Score",
      "Up to 2 savings goals",
      "10 AI Assistant messages / month",
      "Category budgets (view only)",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 4.99,
    tagline: "For students who actually want to stay on budget.",
    maxGoals: Infinity,
    aiMessagesPerMonth: Infinity,
    weeklyReports: true,
    monthlyDeepDive: false,
    csvExport: true,
    subscriptionDetector: false,
    categoryBudgetAlerts: true,
    features: [
      "Everything in Free",
      "Unlimited AI Assistant messages",
      "Unlimited savings goals",
      "Weekly AI-generated reports",
      "Category budget alerts",
      "CSV export of transactions",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 9.99,
    tagline: "For students who want to know exactly where every rupee goes.",
    maxGoals: Infinity,
    aiMessagesPerMonth: Infinity,
    weeklyReports: true,
    monthlyDeepDive: true,
    csvExport: true,
    subscriptionDetector: true,
    categoryBudgetAlerts: true,
    features: [
      "Everything in Premium",
      "Recurring subscription detector",
      "Monthly AI deep-dive report",
      "Priority AI response quality",
    ],
  },
};

export function planConfig(plan: string): PlanConfig {
  return PLANS[plan as PlanId] ?? PLANS.free;
}

export function planRank(plan: string): number {
  return PLAN_IDS.indexOf(plan as PlanId);
}

export function isAtLeast(plan: string, minimum: PlanId): boolean {
  return planRank(plan) >= planRank(minimum);
}
