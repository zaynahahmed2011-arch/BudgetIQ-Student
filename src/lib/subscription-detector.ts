// Pro-tier feature: scans transaction history for recurring charges — same
// description showing up with a similar amount across 2+ different months —
// and surfaces them as likely subscriptions. Deliberately simple (exact
// description match, case-insensitive) rather than fuzzy matching, since
// AI-parsed descriptions from the same merchant tend to come out consistent.

export interface DetectedSubscription {
  description: string;
  category: string;
  averageAmount: number;
  occurrences: number;
  months: string[]; // "YYYY-MM", most recent first
  estimatedMonthlySpend: number;
}

interface TransactionLike {
  description: string;
  category: string;
  amount: number;
  date: Date | string;
}

const AMOUNT_TOLERANCE = 0.15; // 15% variance still counts as "the same" charge

export function detectRecurringSubscriptions(
  transactions: TransactionLike[]
): DetectedSubscription[] {
  const groups = new Map<string, TransactionLike[]>();

  for (const t of transactions) {
    const key = t.description.trim().toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const results: DetectedSubscription[] = [];

  for (const [, txs] of groups) {
    if (txs.length < 2) continue;

    const amounts = txs.map((t) => t.amount);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const withinTolerance = amounts.every((a) => Math.abs(a - avg) / avg <= AMOUNT_TOLERANCE);
    if (!withinTolerance) continue;

    const monthSet = new Set(
      txs.map((t) => {
        const d = typeof t.date === "string" ? new Date(t.date) : t.date;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })
    );
    if (monthSet.size < 2) continue;

    results.push({
      description: txs[0].description,
      category: txs[0].category,
      averageAmount: avg,
      occurrences: txs.length,
      months: Array.from(monthSet).sort().reverse(),
      estimatedMonthlySpend: avg,
    });
  }

  return results.sort((a, b) => b.estimatedMonthlySpend - a.estimatedMonthlySpend);
}
