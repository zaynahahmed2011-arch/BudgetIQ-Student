import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive";
}) {
  const toneClasses = {
    default: "bg-primary/20 text-primary",
    success: "bg-success/25 text-success",
    warning: "bg-warning/25 text-warning",
    destructive: "bg-destructive/20 text-destructive",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-black tracking-tight">{value}</p>
          {subtext && <p className="mt-1 text-xs font-medium text-muted-foreground">{subtext}</p>}
        </div>
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", toneClasses)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
