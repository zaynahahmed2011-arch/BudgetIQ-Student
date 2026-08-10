import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { updateBudgetSchema } from "@/lib/validations";

export async function GET() {
  const { userId, error } = await requireUserId();
  if (error) return error;

  const [user, categoryLimits] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId! } }),
    prisma.categoryBudget.findMany({ where: { userId: userId! } }),
  ]);

  return NextResponse.json({
    monthlyBudget: user.monthlyBudget,
    currency: user.currency,
    categoryLimits,
  });
}

export async function PATCH(req: Request) {
  const { userId, error } = await requireUserId();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = updateBudgetSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { monthlyBudget, currency, categoryLimits } = parsed.data;

  await prisma.user.update({
    where: { id: userId! },
    data: { monthlyBudget, ...(currency ? { currency } : {}) },
  });

  if (categoryLimits) {
    await Promise.all(
      categoryLimits.map((c) =>
        prisma.categoryBudget.upsert({
          where: { userId_category: { userId: userId!, category: c.category } },
          create: { userId: userId!, category: c.category, monthlyCap: c.monthlyCap },
          update: { monthlyCap: c.monthlyCap },
        })
      )
    );
  }

  return NextResponse.json({ success: true });
}
