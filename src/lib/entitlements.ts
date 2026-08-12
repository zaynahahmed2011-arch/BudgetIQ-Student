import { prisma } from "@/lib/prisma";
import { planConfig, isAtLeast, type PlanId } from "@/lib/plans";

const MS_IN_30_DAYS = 30 * 24 * 60 * 60 * 1000;

/**
 * Free-tier AI usage resets on a rolling 30-day window from aiUsageResetAt,
 * rather than a calendar month, so it's simple to compute without a cron job.
 */
export async function getAiMessageUsage(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: true, aiMessagesUsedThisMonth: true, aiUsageResetAt: true },
  });

  const expired = Date.now() - user.aiUsageResetAt.getTime() > MS_IN_30_DAYS;
  const used = expired ? 0 : user.aiMessagesUsedThisMonth;

  if (expired) {
    await prisma.user.update({
      where: { id: userId },
      data: { aiMessagesUsedThisMonth: 0, aiUsageResetAt: new Date() },
    });
  }

  const limit = planConfig(user.plan).aiMessagesPerMonth;
  return { used, limit, remaining: limit === Infinity ? Infinity : Math.max(0, limit - used) };
}

export async function canSendAiMessage(userId: string) {
  const { remaining } = await getAiMessageUsage(userId);
  return remaining > 0;
}

export async function recordAiMessageUsed(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { aiMessagesUsedThisMonth: { increment: 1 } },
  });
}

export async function canCreateGoal(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: true },
  });
  const { maxGoals } = planConfig(user.plan);
  if (maxGoals === Infinity) return true;

  const count = await prisma.savingsGoal.count({ where: { userId } });
  return count < maxGoals;
}

export async function requirePlan(userId: string, minimum: PlanId) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: true },
  });
  return isAtLeast(user.plan, minimum);
}
