import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { PLAN_IDS } from "@/lib/plans";
import { z } from "zod";

const bodySchema = z.object({
  plan: z.enum(PLAN_IDS),
});

// DEMO ONLY: sets the user's plan directly with no payment involved. This
// exists so the plan-gating system can be tested end-to-end before real
// billing (Stripe) is wired up — swapping this for a real checkout flow is
// a self-contained change: real billing would create a Stripe Checkout
// session here instead, and set the plan from a webhook once payment
// succeeds, rather than trusting the client's request directly.
export async function POST(req: Request) {
  const { userId, error } = await requireUserId();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Invalid plan");
  }

  const user = await prisma.user.update({
    where: { id: userId! },
    data: { plan: parsed.data.plan },
  });

  return NextResponse.json({ plan: user.plan });
}
