import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@budgetiq.app";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Amara Student",
      passwordHash,
      monthlyBudget: 25000,
      currency: "Rs.",
    },
  });

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.savingsGoal.deleteMany({ where: { userId: user.id } });
  await prisma.categoryBudget.deleteMany({ where: { userId: user.id } });
  await prisma.financialScore.deleteMany({ where: { userId: user.id } });
  await prisma.weeklyReport.deleteMany({ where: { userId: user.id } });

  await prisma.categoryBudget.createMany({
    data: [
      { userId: user.id, category: "Food", monthlyCap: 8000 },
      { userId: user.id, category: "Transport", monthlyCap: 3000 },
      { userId: user.id, category: "Shopping", monthlyCap: 3000 },
      { userId: user.id, category: "Entertainment", monthlyCap: 2000 },
      { userId: user.id, category: "Education", monthlyCap: 4000 },
      { userId: user.id, category: "Bills", monthlyCap: 3000 },
      { userId: user.id, category: "Healthcare", monthlyCap: 1500 },
    ],
  });

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

  const transactions: {
    amount: number;
    category: string;
    description: string;
    rawInput: string;
    date: Date;
  }[] = [
    { amount: 850, category: "Food", description: "Coffee and lunch", rawInput: "spent 850 on coffee and lunch", date: daysAgo(0) },
    { amount: 1200, category: "Transport", description: "Monthly bus pass", rawInput: "bought monthly bus pass for 1200", date: daysAgo(1) },
    { amount: 2400, category: "Shopping", description: "New headphones", rawInput: "bought new headphones for 2400", date: daysAgo(2) },
    { amount: 600, category: "Entertainment", description: "Movie night with friends", rawInput: "movie night 600", date: daysAgo(3) },
    { amount: 1500, category: "Education", description: "Textbook", rawInput: "bought a textbook for 1500", date: daysAgo(4) },
    { amount: 3200, category: "Bills", description: "Phone bill", rawInput: "paid phone bill 3200", date: daysAgo(5) },
    { amount: 450, category: "Food", description: "Groceries", rawInput: "groceries 450", date: daysAgo(6) },
    { amount: 900, category: "Food", description: "Dinner with roommates", rawInput: "dinner with roommates 900", date: daysAgo(7) },
    { amount: 350, category: "Transport", description: "Rideshare to campus", rawInput: "uber to campus 350", date: daysAgo(8) },
    { amount: 1800, category: "Shopping", description: "New sneakers", rawInput: "new sneakers 1800", date: daysAgo(9) },
    { amount: 500, category: "Healthcare", description: "Pharmacy", rawInput: "pharmacy 500", date: daysAgo(10) },
    { amount: 700, category: "Food", description: "Weekend brunch", rawInput: "brunch 700", date: daysAgo(11) },
    { amount: 400, category: "Entertainment", description: "Streaming subscription", rawInput: "netflix subscription 400", date: daysAgo(12) },
    { amount: 1100, category: "Food", description: "Groceries", rawInput: "groceries 1100", date: daysAgo(13) },
    { amount: 250, category: "Transport", description: "Metro card top-up", rawInput: "metro top up 250", date: daysAgo(14) },
  ];

  await prisma.transaction.createMany({
    data: transactions.map((t) => ({ ...t, userId: user.id })),
  });

  const laptopGoal = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "New Laptop",
      emoji: "💻",
      targetAmount: 90000,
      currentAmount: 32000,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 4, 1),
    },
  });

  await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "Emergency Fund",
      emoji: "🛟",
      targetAmount: 30000,
      currentAmount: 12000,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 1),
    },
  });

  await prisma.goalContribution.createMany({
    data: [
      { goalId: laptopGoal.id, amount: 8000, date: daysAgo(20) },
      { goalId: laptopGoal.id, amount: 10000, date: daysAgo(10) },
      { goalId: laptopGoal.id, amount: 14000, date: daysAgo(2) },
    ],
  });

  await prisma.financialScore.create({
    data: {
      userId: user.id,
      score: 78,
      budgetAdherence: 0.8,
      savingsHabit: 0.75,
      overspendingFrequency: 0.7,
      goalProgress: 0.5,
    },
  });

  await prisma.weeklyReport.create({
    data: {
      userId: user.id,
      weekStart: daysAgo(7),
      weekEnd: now,
      totalSpent: 6800,
      summary:
        "A steady week — food and transport stayed on track, but a headphone purchase pushed shopping over its usual pace.",
      insights: JSON.stringify([
        "Food spending stayed within your weekly budget pace.",
        "Shopping is 60% over its typical weekly average due to the headphones purchase.",
        "You contributed Rs. 14,000 toward your laptop goal — your biggest single contribution yet.",
      ]),
      recommendations: JSON.stringify([
        "Pause non-essential shopping for the next week to rebalance your category.",
        "Keep the momentum on the laptop goal — one more contribution like this and you're over 50% funded.",
        "Consider a weekly grocery run instead of daily food orders to trim the Food category further.",
      ]),
    },
  });

  console.log("Seeded demo user:");
  console.log(`  email: ${DEMO_EMAIL}`);
  console.log(`  password: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
