import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { parseExpenseInputSchema, createTransactionSchema } from "@/lib/validations";
import { parseExpenseFromText, isAiConfigured } from "@/lib/ai";
import { categorySchema } from "@/lib/categories";

export async function GET(req: Request) {
  const { userId, error } = await requireUserId();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limit = Number(searchParams.get("limit") ?? 50);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(category && category !== "all" ? { category } : {}),
    },
    orderBy: { date: "desc" },
    take: Math.min(limit, 200),
  });

  return NextResponse.json({ transactions });
}

// Naive fallback parser used only when ANTHROPIC_API_KEY is not configured,
// so the app still works end-to-end without an AI key.
function fallbackParse(text: string) {
  const amountMatch = text.match(/(\d+(?:[.,]\d+)?)/);
  const amount = amountMatch ? Number(amountMatch[1].replace(",", "")) : 0;
  const lower = text.toLowerCase();
  const keywordMap: Record<string, string> = {
    food: "Food",
    coffee: "Food",
    lunch: "Food",
    dinner: "Food",
    breakfast: "Food",
    grocery: "Food",
    groceries: "Food",
    restaurant: "Food",
    bus: "Transport",
    uber: "Transport",
    taxi: "Transport",
    cab: "Transport",
    fuel: "Transport",
    petrol: "Transport",
    metro: "Transport",
    shopping: "Shopping",
    clothes: "Shopping",
    shoes: "Shopping",
    movie: "Entertainment",
    netflix: "Entertainment",
    game: "Entertainment",
    book: "Education",
    textbook: "Education",
    course: "Education",
    tuition: "Education",
    bill: "Bills",
    rent: "Bills",
    electricity: "Bills",
    internet: "Bills",
    phone: "Bills",
    doctor: "Healthcare",
    medicine: "Healthcare",
    pharmacy: "Healthcare",
  };
  let category = "Other";
  for (const [keyword, cat] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      category = cat;
      break;
    }
  }
  return {
    amount,
    category: categorySchema.parse(category),
    description: text.replace(/(\d+(?:[.,]\d+)?)/, "").trim() || "Expense",
  };
}

export async function POST(req: Request) {
  const { userId, error } = await requireUserId();
  if (error) return error;

  const body = await req.json().catch(() => null);

  // Path 1: natural-language quick-add ("I spent 850 on coffee and lunch")
  const nlParsed = parseExpenseInputSchema.safeParse(body);
  if (nlParsed.success) {
    try {
      const parsedExpense = isAiConfigured()
        ? await parseExpenseFromText(nlParsed.data.text)
        : fallbackParse(nlParsed.data.text);

      if (!parsedExpense.amount || parsedExpense.amount <= 0) {
        return errorResponse(
          "I couldn't find an amount in that. Try including a number, e.g. 'Rs. 500 on lunch'."
        );
      }

      const transaction = await prisma.transaction.create({
        data: {
          userId: userId!,
          amount: parsedExpense.amount,
          category: parsedExpense.category,
          description: parsedExpense.description,
          rawInput: nlParsed.data.text,
        },
      });

      return NextResponse.json({ transaction, aiUsed: isAiConfigured() });
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : "Failed to parse expense", 500);
    }
  }

  // Path 2: structured create (used by manual "add transaction" forms)
  const structured = createTransactionSchema.safeParse(body);
  if (!structured.success) {
    return errorResponse(structured.error.issues[0]?.message ?? "Invalid input");
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: userId!,
      amount: structured.data.amount,
      category: structured.data.category,
      description: structured.data.description,
      rawInput: structured.data.rawInput,
      date: structured.data.date ? new Date(structured.data.date) : undefined,
    },
  });

  return NextResponse.json({ transaction });
}
