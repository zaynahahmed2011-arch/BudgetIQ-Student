import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { updateGoalSchema } from "@/lib/validations";

export async function PATCH(
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
  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      ...parsed.data,
      targetDate:
        parsed.data.targetDate === undefined
          ? undefined
          : parsed.data.targetDate
          ? new Date(parsed.data.targetDate)
          : null,
    },
  });

  return NextResponse.json({ goal });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireUserId();
  if (error) return error;
  const { id } = await params;

  const existing = await prisma.savingsGoal.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return errorResponse("Goal not found", 404);
  }

  await prisma.savingsGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
