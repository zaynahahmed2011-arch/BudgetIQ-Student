import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { createGoalSchema } from "@/lib/validations";
import { canCreateGoal } from "@/lib/entitlements";

export async function GET() {
  const { userId, error } = await requireUserId();
  if (error) return error;

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: userId! },
    orderBy: { createdAt: "asc" },
    include: { contributions: { orderBy: { date: "desc" }, take: 5 } },
  });

  return NextResponse.json({ goals });
}

export async function POST(req: Request) {
  const { userId, error } = await requireUserId();
  if (error) return error;

  if (!(await canCreateGoal(userId!))) {
    return errorResponse(
      "Free plan is limited to 2 savings goals. Upgrade to Premium for unlimited goals.",
      402
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const goal = await prisma.savingsGoal.create({
    data: {
      userId: userId!,
      name: parsed.data.name,
      emoji: parsed.data.emoji || "🎯",
      targetAmount: parsed.data.targetAmount,
      currentAmount: parsed.data.currentAmount ?? 0,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
    },
  });

  return NextResponse.json({ goal });
}
