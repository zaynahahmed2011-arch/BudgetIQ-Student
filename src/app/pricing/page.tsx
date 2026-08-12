import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LandingNav } from "@/components/landing/landing-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PricingClient } from "@/components/pricing/pricing-client";
import type { PlanId } from "@/lib/plans";

async function PricingBody({ currentPlan }: { currentPlan: PlanId | null }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Simple pricing, built for students
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Start free. Upgrade only if the AI features are actually saving you money.
        </p>
      </div>

      <PricingClient isLoggedIn={!!currentPlan} currentPlan={currentPlan} />

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Demo mode: plan changes here are instant and don&apos;t involve real payment — this is a
        placeholder for Stripe billing, which will replace this flow before launch.
      </p>
    </div>
  );
}

export default async function PricingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex min-h-screen flex-col">
        <LandingNav />
        <main className="flex-1 px-4 py-16 md:px-8 md:py-24">
          <PricingBody currentPlan={null} />
        </main>
      </div>
    );
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { plan: true, name: true, image: true },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={user.name ?? "Student"} userImage={user.image} />
        <main className="flex-1 px-4 pb-24 pt-10 md:px-8 md:pb-10">
          <PricingBody currentPlan={(user.plan as PlanId) ?? "free"} />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
