import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES, type Category } from "./categories";

const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env to enable AI features."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export interface ParsedExpense {
  amount: number;
  category: Category;
  description: string;
}

const recordExpenseTool: Anthropic.Tool = {
  name: "record_expense",
  description:
    "Extract a structured expense record from a student's natural-language description of spending.",
  input_schema: {
    type: "object",
    properties: {
      amount: {
        type: "number",
        description: "The numeric amount spent, with no currency symbol.",
      },
      category: {
        type: "string",
        enum: [...CATEGORIES],
        description: "The single best-fit spending category.",
      },
      description: {
        type: "string",
        description:
          "A short, clean human-readable description of the expense (e.g. 'Coffee and lunch').",
      },
    },
    required: ["amount", "category", "description"],
  },
};

export async function parseExpenseFromText(
  text: string
): Promise<ParsedExpense> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    system:
      "You extract structured expense data from what a student typed about their spending. Always call the record_expense tool exactly once. Infer a sensible amount and category even from casual, abbreviated, or multi-item text.",
    tools: [recordExpenseTool],
    tool_choice: { type: "tool", name: "record_expense" },
    messages: [{ role: "user", content: text }],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("The AI couldn't understand that expense. Try rephrasing it.");
  }

  const input = toolUse.input as ParsedExpense;
  return {
    amount: Number(input.amount),
    category: input.category,
    description: input.description,
  };
}

export interface FinancialContext {
  studentName: string;
  currency: string;
  monthlyBudget: number;
  totalSpentThisMonth: number;
  remainingBudget: number;
  daysLeftInMonth: number;
  spendingByCategory: { category: string; amount: number }[];
  recentTransactions: { description: string; category: string; amount: number; date: string }[];
  savingsGoals: { name: string; currentAmount: number; targetAmount: number }[];
  financialHealthScore: number;
}

function buildContextPrompt(ctx: FinancialContext) {
  const categoryLines = ctx.spendingByCategory
    .map((c) => `  - ${c.category}: ${ctx.currency} ${c.amount.toFixed(2)}`)
    .join("\n");
  const goalLines =
    ctx.savingsGoals
      .map(
        (g) =>
          `  - ${g.name}: ${ctx.currency} ${g.currentAmount.toFixed(2)} / ${ctx.currency} ${g.targetAmount.toFixed(2)}`
      )
      .join("\n") || "  (none yet)";
  const txLines =
    ctx.recentTransactions
      .slice(0, 10)
      .map(
        (t) =>
          `  - ${t.date}: ${t.description} (${t.category}) — ${ctx.currency} ${t.amount.toFixed(2)}`
      )
      .join("\n") || "  (no transactions yet)";

  return `Student: ${ctx.studentName}
Monthly budget: ${ctx.currency} ${ctx.monthlyBudget.toFixed(2)}
Spent this month: ${ctx.currency} ${ctx.totalSpentThisMonth.toFixed(2)}
Remaining: ${ctx.currency} ${ctx.remainingBudget.toFixed(2)}
Days left in month: ${ctx.daysLeftInMonth}
Financial Health Score: ${ctx.financialHealthScore}/100

Spending by category this month:
${categoryLines || "  (no spending yet)"}

Recent transactions:
${txLines}

Savings goals:
${goalLines}`;
}

const CHAT_SYSTEM_PROMPT = `You are the BudgetIQ AI Assistant, a friendly, encouraging financial coach built for university students. You give short, concrete, actionable answers grounded ONLY in the financial data provided in the context block — never invent numbers.

Guidelines:
- Be warm but concise: 2-5 sentences unless the student asks for detail.
- When asked "can I afford X", do the arithmetic against their actual remaining budget and say yes/no plainly, then explain the tradeoff.
- When asked about overspending, point to the specific category and amount.
- Give practical, student-relevant savings tips (meal prep, student discounts, subscription audits, etc.), not generic finance-guru platitudes.
- Never give real investment, tax, or legal advice — this is budgeting help only.
- Use the student's currency symbol from the context, not $ unless that is their currency.`;

export async function chatWithAssistant(
  messages: { role: "user" | "assistant"; content: string }[],
  context: FinancialContext
) {
  const anthropic = getClient();

  return anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: `${CHAT_SYSTEM_PROMPT}\n\n--- Current financial context ---\n${buildContextPrompt(context)}`,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
}

export interface WeeklySummaryResult {
  summary: string;
  insights: string[];
  recommendations: string[];
}

const weeklySummaryTool: Anthropic.Tool = {
  name: "weekly_summary",
  description: "Produce a structured weekly financial summary for a student.",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "A 2-3 sentence narrative overview of the student's week.",
      },
      insights: {
        type: "array",
        items: { type: "string" },
        description: "3-5 short, specific observations about spending patterns this week.",
      },
      recommendations: {
        type: "array",
        items: { type: "string" },
        description: "2-4 short, actionable recommendations for next week.",
      },
    },
    required: ["summary", "insights", "recommendations"],
  },
};

export async function generateWeeklySummary(
  context: FinancialContext & {
    weekSpent: number;
    weekTransactionCount: number;
  }
): Promise<WeeklySummaryResult> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    system:
      "You are a financial coach writing a weekly recap for a university student. Always call the weekly_summary tool exactly once, using only the data given.",
    tools: [weeklySummaryTool],
    tool_choice: { type: "tool", name: "weekly_summary" },
    messages: [
      {
        role: "user",
        content: `Generate this week's summary from this data:\n\n${buildContextPrompt(
          context
        )}\n\nThis week specifically: spent ${context.currency} ${context.weekSpent.toFixed(
          2
        )} across ${context.weekTransactionCount} transactions.`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Failed to generate weekly summary.");
  }

  return toolUse.input as WeeklySummaryResult;
}
