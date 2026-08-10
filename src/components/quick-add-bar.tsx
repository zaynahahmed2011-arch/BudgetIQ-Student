"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EXAMPLES = [
  "Spent Rs. 850 on coffee and lunch",
  "Bought a textbook for 1500",
  "Paid 3200 for phone bill",
];

export function QuickAddBar() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Couldn't log that expense");
        return;
      }

      toast.success(
        `Logged ${data.transaction.category}: ${data.transaction.description}`
      );
      setText("");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-4 md:p-5">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </div>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Try "spent 850 on coffee and lunch"'
          className="border-none bg-card shadow-none focus-visible:ring-1"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !text.trim()}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Add"}
        </Button>
      </form>
      <div className="mt-2.5 flex flex-wrap gap-1.5 pl-11">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setText(ex)}
            className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
