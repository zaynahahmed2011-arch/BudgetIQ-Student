import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, categoryLimits] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.categoryBudget.findMany({ where: { userId } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your budget, categories, and account.</p>
      </div>

      <SettingsClient
        name={user.name ?? ""}
        email={user.email}
        initialMonthlyBudget={user.monthlyBudget}
        initialCurrency={user.currency}
        initialCategoryLimits={categoryLimits}
      />
    </div>
  );
}
