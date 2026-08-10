"use client";

import { useState } from "react";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface GoalItem {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
}

const EMOJI_OPTIONS = ["🎯", "💻", "📱", "🎓", "✈️", "🛟", "🏠", "🚗", "🎸", "📷"];

export function GoalsClient({
  initialGoals,
  currency,
}: {
  initialGoals: GoalItem[];
  currency: string;
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [createOpen, setCreateOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<GoalItem | null>(null);

  async function handleCreate(data: {
    name: string;
    emoji: string;
    targetAmount: number;
    targetDate: string;
  }) {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        emoji: data.emoji,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
      }),
    });
    if (!res.ok) {
      toast.error("Couldn't create that goal");
      return;
    }
    const { goal } = await res.json();
    setGoals((g) => [...g, goal]);
    setCreateOpen(false);
    toast.success("Goal created!");
  }

  async function handleDelete(id: string) {
    const prev = goals;
    setGoals((g) => g.filter((x) => x.id !== id));
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setGoals(prev);
      toast.error("Couldn't delete that goal");
    }
  }

  async function handleContribute(id: string, amount: number) {
    const res = await fetch(`/api/goals/${id}/contribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      toast.error("Couldn't add that contribution");
      return;
    }
    const { goal } = await res.json();
    setGoals((g) => g.map((x) => (x.id === id ? { ...x, currentAmount: goal.currentAmount } : x)));
    setContributeGoal(null);
    toast.success(`Added ${formatCurrency(amount, currency)} 🎉`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> New goal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const pct = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
          const done = pct >= 100;
          return (
            <Card key={goal.id}>
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-xl">
                      {goal.emoji}
                    </div>
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      {goal.targetDate && (
                        <p className="text-xs text-muted-foreground">by {formatDate(goal.targetDate)}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <Progress value={pct} className="h-2" />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">{formatCurrency(goal.currentAmount, currency)}</span>
                  <span className="text-muted-foreground">of {formatCurrency(goal.targetAmount, currency)}</span>
                </div>

                {done ? (
                  <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-center text-xs font-medium text-success">
                    🎉 Goal reached!
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    className="mt-3 w-full"
                    size="sm"
                    onClick={() => setContributeGoal(goal)}
                  >
                    <TrendingUp className="size-3.5" /> Add contribution
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {goals.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No savings goals yet. Create your first one — a laptop, a trip, tuition, anything.
          </p>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <CreateGoalForm onCancel={() => setCreateOpen(false)} onCreate={handleCreate} />
      </Dialog>

      <Dialog open={!!contributeGoal} onOpenChange={(o) => !o && setContributeGoal(null)}>
        {contributeGoal && (
          <ContributeForm
            goal={contributeGoal}
            currency={currency}
            onCancel={() => setContributeGoal(null)}
            onSubmit={(amount) => handleContribute(contributeGoal.id, amount)}
          />
        )}
      </Dialog>
    </div>
  );
}

function CreateGoalForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (data: { name: string; emoji: string; targetAmount: number; targetDate: string }) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  return (
    <DialogContent onClose={onCancel}>
      <DialogHeader>
        <DialogTitle>New savings goal</DialogTitle>
        <DialogDescription>What are you saving up for?</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCreate({ name, emoji, targetAmount: Number(targetAmount), targetDate });
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_OPTIONS.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className={`flex size-9 items-center justify-center rounded-lg text-lg ${
                  emoji === e ? "bg-primary/15 ring-2 ring-primary" : "bg-muted"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Goal name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New Laptop" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Target amount</Label>
          <Input
            type="number"
            min={1}
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Target date (optional)</Label>
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create goal</Button>
        </div>
      </form>
    </DialogContent>
  );
}

function ContributeForm({
  goal,
  currency,
  onCancel,
  onSubmit,
}: {
  goal: GoalItem;
  currency: string;
  onCancel: () => void;
  onSubmit: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");

  return (
    <DialogContent onClose={onCancel}>
      <DialogHeader>
        <DialogTitle>
          Contribute to {goal.emoji} {goal.name}
        </DialogTitle>
        <DialogDescription>
          {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)} so far.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(Number(amount));
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <Label>Amount</Label>
          <Input
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add contribution</Button>
        </div>
      </form>
    </DialogContent>
  );
}
