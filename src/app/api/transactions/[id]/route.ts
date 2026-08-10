import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { updateTransactionSchema } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireUserId();
  if (error) return error;
  const { id } = await params;

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return errorResponse("Transaction not found", 404);
  }

  const body = await req.json().catch(() => null);
  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    },
  });

  return NextResponse.json({ transaction });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireUserId();
  if (error) return error;
  const { id } = await params;

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return errorResponse("Transaction not found", 404);
  }

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
