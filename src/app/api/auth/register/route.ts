import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { CATEGORIES } from "@/lib/categories";

const DEFAULT_CATEGORY_SPLIT: Record<string, number> = {
  Food: 0.32,
  Transport: 0.12,
  Shopping: 0.12,
  Entertainment: 0.08,
  Education: 0.16,
  Bills: 0.12,
  Healthcare: 0.06,
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password, monthlyBudget } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const budget = monthlyBudget ?? 20000;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      monthlyBudget: budget,
      categoryLimits: {
        create: CATEGORIES.filter((c) => c !== "Savings" && c !== "Other").map(
          (category) => ({
            category,
            monthlyCap: Math.round(budget * (DEFAULT_CATEGORY_SPLIT[category] ?? 0.1)),
          })
        ),
      },
    },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
