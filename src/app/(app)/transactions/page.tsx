import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuickAddBar } from "@/components/quick-add-bar";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, transactions] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 200,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Transactions</h2>
        <p className="text-sm text-muted-foreground">
          Everything you&apos;ve logged, filterable by category.
        </p>
      </div>

      <QuickAddBar />

      <TransactionsClient
        initialTransactions={transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: t.date.toISOString(),
        }))}
        currency={user.currency}
      />
    </div>
  );
}
