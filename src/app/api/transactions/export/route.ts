import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { requirePlan } from "@/lib/entitlements";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const { userId, error } = await requireUserId();
  if (error) return error;

  if (!(await requirePlan(userId!, "premium"))) {
    return errorResponse("CSV export requires Premium or Pro. Upgrade to unlock it.", 402);
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: userId! },
    orderBy: { date: "desc" },
  });

  const header = "Date,Category,Description,Amount\n";
  const rows = transactions
    .map((t) =>
      [
        t.date.toISOString().slice(0, 10),
        csvEscape(t.category),
        csvEscape(t.description),
        t.amount.toFixed(2),
      ].join(",")
    )
    .join("\n");

  return new Response(header + rows + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="budgetiq-transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
