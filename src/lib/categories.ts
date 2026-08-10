import { z } from "zod";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Education",
  "Bills",
  "Healthcare",
  "Savings",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const categorySchema = z.enum(CATEGORIES);

export const CATEGORY_META: Record<
  Category,
  { emoji: string; color: string }
> = {
  Food: { emoji: "🍔", color: "var(--chart-1)" },
  Transport: { emoji: "🚌", color: "var(--chart-2)" },
  Shopping: { emoji: "🛍️", color: "var(--chart-3)" },
  Entertainment: { emoji: "🎬", color: "var(--chart-4)" },
  Education: { emoji: "📚", color: "var(--chart-5)" },
  Bills: { emoji: "🧾", color: "var(--chart-6)" },
  Healthcare: { emoji: "💊", color: "var(--chart-7)" },
  Savings: { emoji: "💰", color: "var(--chart-8)" },
  Other: { emoji: "✨", color: "var(--chart-9)" },
};
