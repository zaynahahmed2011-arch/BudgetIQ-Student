import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scoreLabel } from "@/lib/financial-score";
import { cn } from "@/lib/utils";

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HealthScoreCard({
  score,
  breakdown,
}: {
  score: number;
  breakdown: {
    budgetAdherence: number;
    savingsHabit: number;
    overspendingFrequency: number;
    goalProgress: number;
  };
}) {
  const { label, color } = scoreLabel(score);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  const rows = [
    { label: "Budget adherence", value: breakdown.budgetAdherence, weight: "30%" },
    { label: "Savings habit", value: breakdown.savingsHabit, weight: "30%" },
    { label: "Avoiding overspending", value: breakdown.overspendingFrequency, weight: "25%" },
    { label: "Goal progress", value: breakdown.goalProgress, weight: "15%" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Health Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative flex size-32 shrink-0 items-center justify-center">
          <svg className="size-32 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className={cn("text-xs font-medium", color)}>{label}</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {row.label} <span className="text-muted-foreground/60">({row.weight})</span>
                </span>
                <span className="font-medium">{Math.round(row.value * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round(row.value * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
