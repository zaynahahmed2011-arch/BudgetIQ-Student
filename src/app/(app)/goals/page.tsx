import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { planConfig } from "@/lib/plans";
import { GoalsClient } from "@/components/goals/goals-client";

export default async function GoalsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, goals] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  const { maxGoals } = planConfig(user.plan);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Savings Goals</h2>
        <p className="text-sm text-muted-foreground">
          Track what you&apos;re saving for and watch your progress grow.
        </p>
      </div>

      <GoalsClient
        initialGoals={goals.map((g) => ({
          id: g.id,
          name: g.name,
          emoji: g.emoji,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          targetDate: g.targetDate ? g.targetDate.toISOString() : null,
        }))}
        currency={user.currency}
        maxGoals={maxGoals === Infinity ? null : maxGoals}
      />
    </div>
  );
}
