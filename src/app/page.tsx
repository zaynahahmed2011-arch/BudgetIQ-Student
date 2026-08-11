import Link from "next/link";
import {
  Sparkles,
  MessageSquareText,
  PiggyBank,
  BarChart3,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroMock } from "@/components/landing/hero-mock";

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "Natural language expense logging",
    description:
      "Just type \"spent 850 on coffee and lunch\" — AI extracts the amount, category, and description automatically.",
  },
  {
    icon: Sparkles,
    title: "AI financial coach",
    description:
      "Ask \"can I afford new shoes?\" or \"where am I overspending?\" and get answers grounded in your real numbers.",
  },
  {
    icon: BarChart3,
    title: "Financial Health Score",
    description:
      "A single 0–100 score built from budgeting consistency, savings habits, and goal progress — updated daily.",
  },
  {
    icon: PiggyBank,
    title: "Savings goals that stick",
    description:
      "Set a target for a laptop, a trip, or tuition, log contributions, and watch your progress bar fill up.",
  },
  {
    icon: Wallet,
    title: "Category budgets",
    description:
      "Cap spending per category so overspending gets flagged before it happens, not after.",
  },
  {
    icon: ShieldCheck,
    title: "Weekly AI summaries",
    description:
      "Every week, get a personalized recap with insights and concrete recommendations for next week.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Set your monthly budget",
    description: "Tell us your allowance and we split it across sensible category caps.",
  },
  {
    step: "02",
    title: "Log spending in plain English",
    description: "No forms, no dropdowns — just describe what you bought.",
  },
  {
    step: "03",
    title: "Get coached, not judged",
    description: "Your AI assistant explains where your money went and what to do next.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pb-24 pt-16 md:px-8 md:pt-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-accent/40 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-40 size-64 rounded-full bg-secondary/50 blur-2xl"
          />
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-foreground">
                <Sparkles className="size-3.5" /> Built for students, powered by AI
              </div>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                Budgeting that talks back,
                <br />
                <span className="text-primary">not spreadsheets.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                BudgetIQ Student turns money management into a conversation. Log expenses in
                plain English, track savings goals, and get an AI coach that actually knows your
                numbers.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
                  Get started free
                </Link>
                <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  I have an account
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                No credit card. Try the demo account right after signing up.
              </p>
            </div>
            <HeroMock />
          </div>
        </section>

        <section id="features" className="border-t border-border bg-secondary/20 px-4 py-20 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-xl">
              <h2 className="text-3xl font-black tracking-tight">Everything a student budget needs</h2>
              <p className="mt-3 text-muted-foreground">
                No bloated features built for accountants. Just what actually helps you not run
                out of money before the month ends.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-3xl border-2 border-border bg-card p-6">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-20 md:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-3xl font-black tracking-tight">How it works</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.step}>
                  <span className="text-sm font-mono font-semibold text-primary">{s.step}</span>
                  <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="score"
          className="border-t border-border bg-secondary/20 px-4 py-20 md:px-8"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight">
                Your money, distilled into one score.
              </h2>
              <p className="mt-3 text-muted-foreground">
                The Financial Health Score blends budgeting consistency, savings habits,
                overspending frequency, and goal progress into a single 0–100 number — so you
                always know where you stand at a glance.
              </p>
              <Link href="/sign-up" className={`${buttonVariants()} mt-6`}>
                Get your score
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="relative flex size-48 items-center justify-center rounded-full border-8 border-primary/20">
                <div className="absolute inset-0 rounded-full border-8 border-primary border-r-transparent border-b-transparent rotate-[95deg]" />
                <div className="text-center">
                  <p className="text-4xl font-bold">78</p>
                  <p className="text-xs text-muted-foreground">Good</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-10 text-center">
            <h2 className="text-3xl font-black tracking-tight">Stop guessing where your money went.</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Set up your budget in under a minute and let the AI handle the rest.
            </p>
            <Link href="/sign-up" className={`${buttonVariants({ size: "lg" })} mt-6`}>
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground md:px-8">
        BudgetIQ Student — a demo budgeting platform built for students.
      </footer>
    </div>
  );
}
