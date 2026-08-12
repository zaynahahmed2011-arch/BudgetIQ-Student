import Link from "next/link";
import { Wallet, TrendingDown, PiggyBank, Receipt, ArrowRight, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAiConfigured } from "@/lib/ai";
import { getAiMessageUsage } from "@/lib/entitlements";
import { recordDailyScoreSnapshot } from "@/lib/finance-data";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { QuickAddBar } from "@/components/quick-add-bar";
import { TransactionRow } from "@/components/transaction-row";
import { ChatWindow } from "@/components/assistant/chat-window";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [snapshot, chatHistory, aiUsage] = await Promise.all([
    recordDailyScoreSnapshot(userId),
    prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 40,
    }),
    getAiMessageUsage(userId),
  ]);
  const { user, totalSpentThisMonth, remainingBudget, spendingByCategory, goals, scoreBreakdown, recentTransactions } =
    snapshot;

  const budgetUsedPct =
    user.monthlyBudget > 0 ? Math.min(100, (totalSpentThisMonth / user.monthlyBudget) * 100) : 0;

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalGoalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const savingsPct = totalGoalTarget > 0 ? (totalSaved / totalGoalTarget) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Hey {user.name?.split(" ")[0] ?? "there"} 👋</h2>
        <p className="text-sm text-muted-foreground">Here&apos;s where your money stands this month.</p>
      </div>

      <QuickAddBar />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Monthly Budget"
          value={formatCurrency(user.monthlyBudget, user.currency)}
          subtext={`${budgetUsedPct.toFixed(0)}% used`}
          icon={Wallet}
        />
        <StatCard
          label="Spent This Month"
          value={formatCurrency(totalSpentThisMonth, user.currency)}
          subtext={`${snapshot.transactionsThisMonth.length} transactions`}
          icon={TrendingDown}
          tone={budgetUsedPct > 90 ? "destructive" : budgetUsedPct > 70 ? "warning" : "default"}
        />
        <StatCard
          label="Remaining Budget"
          value={formatCurrency(Math.max(0, remainingBudget), user.currency)}
          subtext={`${snapshot.daysLeftInMonth} days left`}
          icon={Receipt}
          tone={remainingBudget < 0 ? "destructive" : "success"}
        />
        <StatCard
          label="Savings Progress"
          value={`${savingsPct.toFixed(0)}%`}
          subtext={`${formatCurrency(totalSaved, user.currency)} saved`}
          icon={PiggyBank}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly budget</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress
              value={budgetUsedPct}
              indicatorClassName={budgetUsedPct > 90 ? "bg-destructive" : budgetUsedPct > 70 ? "bg-warning" : "bg-primary"}
              className="h-2.5"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(totalSpentThisMonth, user.currency)} spent</span>
              <span>{formatCurrency(user.monthlyBudget, user.currency)} budget</span>
            </div>

            <div className="mt-6 space-y-3">
              {goals.slice(0, 2).map((goal) => {
                const pct = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
                return (
                  <div key={goal.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>
                        {goal.emoji} {goal.name}
                      </span>
                      <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
              {goals.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No savings goals yet.{" "}
                  <Link href="/goals" className="text-primary hover:underline">
                    Create one
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={spendingByCategory} currency={user.currency} />
          </CardContent>
        </Card>
      </div>

      <HealthScoreCard score={scoreBreakdown.score} breakdown={scoreBreakdown} />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-primary" /> AI Assistant
          </CardTitle>
          <Link
            href="/assistant"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Full chat <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <ChatWindow
            initialMessages={chatHistory.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }))}
            aiConfigured={isAiConfigured()}
            usage={aiUsage.limit === Infinity ? null : aiUsage}
            className="h-[420px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent transactions</CardTitle>
          <Link
            href="/transactions"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {recentTransactions.slice(0, 6).map((t) => (
            <TransactionRow
              key={t.id}
              description={t.description}
              category={t.category}
              amount={t.amount}
              date={t.date}
              currency={user.currency}
            />
          ))}
          {recentTransactions.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No transactions yet. Try the quick-add bar above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
