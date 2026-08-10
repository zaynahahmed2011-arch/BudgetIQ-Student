"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_META, type Category } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";

export function CategoryChart({
  data,
  currency,
}: {
  data: { category: string; amount: number }[];
  currency: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        No spending logged yet this month.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-56 w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_META[entry.category as Category]?.color ?? "var(--chart-9)"}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), currency)}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-1/2">
        {data.map((entry) => {
          const meta = CATEGORY_META[entry.category as Category];
          return (
            <div key={entry.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: meta?.color ?? "var(--chart-9)" }}
                />
                <span>
                  {meta?.emoji} {entry.category}
                </span>
              </div>
              <span className="font-medium">{formatCurrency(entry.amount, currency)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
