import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { requirePlan } from "@/lib/entitlements";
import { detectRecurringSubscriptions } from "@/lib/subscription-detector";

export async function GET() {
  const { userId, error } = await requireUserId();
  if (error) return error;

  if (!(await requirePlan(userId!, "pro"))) {
    return errorResponse("The subscription detector requires Pro. Upgrade to unlock it.", 402);
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: userId! },
    orderBy: { date: "desc" },
    take: 500,
  });

  const subscriptions = detectRecurringSubscriptions(transactions);

  return NextResponse.json({ subscriptions });
}
