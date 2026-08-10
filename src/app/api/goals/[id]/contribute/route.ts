import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { contributeGoalSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireUserId();
  if (error) return error;
  const { id } = await params;

  const existing = await prisma.savingsGoal.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return errorResponse("Goal not found", 404);
  }

  const body = await req.json().catch(() => null);
  const parsed = contributeGoalSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const [goal] = await prisma.$transaction([
    prisma.savingsGoal.update({
      where: { id },
      data: { currentAmount: { increment: parsed.data.amount } },
    }),
    prisma.goalContribution.create({
      data: { goalId: id, amount: parsed.data.amount },
    }),
  ]);

  return NextResponse.json({ goal });
}
