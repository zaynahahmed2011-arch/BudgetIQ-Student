import { z } from "zod";
import { categorySchema } from "./categories";

export const parseExpenseInputSchema = z.object({
  text: z.string().min(1, "Tell me what you spent on").max(500),
});

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  category: categorySchema,
  description: z.string().min(1).max(200),
  rawInput: z.string().max(500).optional(),
  date: z.string().datetime().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const updateBudgetSchema = z.object({
  monthlyBudget: z.number().nonnegative(),
  currency: z.string().min(1).max(10).optional(),
  categoryLimits: z
    .array(
      z.object({
        category: categorySchema,
        monthlyCap: z.number().nonnegative(),
      })
    )
    .optional(),
});

export const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  emoji: z.string().max(8).optional(),
  targetAmount: z.number().positive(),
  currentAmount: z.number().nonnegative().optional(),
  targetDate: z.string().datetime().optional().nullable(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const contributeGoalSchema = z.object({
  amount: z.number().positive(),
});

export const chatMessageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .min(1),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  monthlyBudget: z.number().nonnegative().optional(),
});
