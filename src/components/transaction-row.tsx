import { CATEGORY_META, type Category } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/utils";

export function TransactionRow({
  description,
  category,
  amount,
  date,
  currency,
  right,
}: {
  description: string;
  category: string;
  amount: number;
  date: Date | string;
  currency: string;
  right?: React.ReactNode;
}) {
  const meta = CATEGORY_META[category as Category];

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-base"
          style={{ background: `color-mix(in oklab, ${meta?.color ?? "var(--chart-9)"} 15%, transparent)` }}
        >
          {meta?.emoji ?? "✨"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{description}</p>
          <p className="text-xs text-muted-foreground">
            {category} · {formatDate(date)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-semibold">{formatCurrency(amount, currency)}</span>
        {right}
      </div>
    </div>
  );
}
