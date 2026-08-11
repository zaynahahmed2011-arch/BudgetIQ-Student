# BudgetIQ Student

An AI-powered budgeting platform built for students. Log expenses in plain English,
chat with an AI financial coach grounded in your real numbers, track savings goals,
and watch a 0-100 Financial Health Score update as your habits change.

**Stack**: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma ·
Postgres (Neon) · NextAuth (Auth.js v5) · Anthropic Claude · Recharts

**Live deployment**: https://budget-iq-student.vercel.app

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

- `DATABASE_URL` — a Postgres connection string (e.g. from [Neon](https://neon.tech),
  free tier). If using Neon, use the **pooled** connection string (host has a
  `-pooler` suffix) — the unpooled one exhausts its connection limit quickly
  under dev-server hot reload or serverless traffic.
- `AUTH_SECRET` — generate one with `openssl rand -base64 32`.
- `ANTHROPIC_API_KEY` — get a key at [console.anthropic.com](https://console.anthropic.com/).
  Without it, the app still runs: expense logging falls back to a simple keyword
  parser, and the AI Assistant / weekly reports show a "not configured" message
  instead of erroring.

## 3. Set up the database

```bash
npx prisma migrate dev
npm run db:seed
```

This applies migrations to your Postgres database and seeds a demo account:

- **Email**: `demo@budgetiq.app`
- **Password**: `password123`

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
prisma/schema.prisma       Database schema (User, Transaction, SavingsGoal, WeeklyReport, FinancialScore, ...)
prisma/seed.ts              Demo data seed script
src/app/page.tsx            Marketing landing page
src/app/(auth)/             Sign in / sign up
src/app/(app)/              Dashboard, Transactions, AI Assistant, Goals, Reports, Settings
src/app/api/                Route handlers (transactions, budget, goals, chat, reports, auth)
src/components/ui/          Hand-built shadcn-style UI primitives (no Radix dependency)
src/lib/ai.ts               Anthropic Claude integration (expense parsing, chat, weekly summaries)
src/lib/financial-score.ts  Financial Health Score formula
src/lib/finance-data.ts     Server-side data aggregation shared by pages, chat, and reports
```

## Deploying

The live deployment runs on Vercel, connected to this repo's `main` branch — every
push auto-deploys. Production environment variables (`DATABASE_URL`, `AUTH_SECRET`,
`ANTHROPIC_API_KEY`) are set in the Vercel project settings, not committed anywhere.

`category` is stored as a validated string rather than a native Prisma enum — kept
that way for provider portability, not because Postgres requires it.

## Notes on the Financial Health Score

Documented in `src/lib/financial-score.ts`. It's a weighted blend of four signals,
each normalized to 0-1:

- **Budget adherence (30%)** — pace-adjusted spend vs. budget so far this month.
- **Savings habit (30%)** — this month's goal contributions relative to budget.
- **Avoiding overspending (25%)** — inverse of how often daily spend exceeded a safe pace.
- **Goal progress (15%)** — average completion across active savings goals.

## Optional: Google OAuth

Leave `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` blank to use email/password only.
Set both to enable "Sign in with Google" alongside credentials auth.
