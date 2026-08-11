"use client";

import { useMemo, useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface TransactionItem {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export function TransactionsClient({
  initialTransactions,
  currency,
}: {
  initialTransactions: TransactionItem[];
  currency: string;
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => (filter === "all" ? transactions : transactions.filter((t) => t.category === filter)),
    [transactions, filter]
  );

  const total = filtered.reduce((s, t) => s + t.amount, 0);

  async function handleDelete(id: string) {
    const prev = transactions;
    setTransactions((t) => t.filter((x) => x.id !== id));
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setTransactions(prev);
      toast.error("Couldn't delete that transaction");
    } else {
      toast.success("Transaction deleted");
    }
  }

  async function handleEditSave(updated: TransactionItem) {
    const res = await fetch(`/api/transactions/${updated.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: updated.amount,
        category: updated.category,
        description: updated.description,
      }),
    });
    if (!res.ok) {
      toast.error("Couldn't update that transaction");
      return;
    }
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditing(null);
    toast.success("Transaction updated");
    startTransition(() => {});
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {CATEGORY_META[c].emoji} {c}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {filtered.length} transaction{filtered.length === 1 ? "" : "s"}
            </span>
            <span className="font-semibold">{formatCurrency(total, currency)}</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((t) => {
              const meta = CATEGORY_META[t.category as Category];
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-2xl text-base"
                      style={{
                        background: `color-mix(in oklab, ${meta?.color ?? "var(--chart-9)"} 30%, transparent)`,
                      }}
                    >
                      {meta?.emoji ?? "✨"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category} · {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-sm font-semibold">{formatCurrency(t.amount, currency)}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <div className="flex size-8 items-center justify-center rounded-lg hover:bg-muted">
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditing(t)}>
                          <Pencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(t.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No transactions in this category yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <EditTransactionForm
            transaction={editing}
            onCancel={() => setEditing(null)}
            onSave={handleEditSave}
            loading={isPending}
          />
        )}
      </Dialog>
    </div>
  );
}

function EditTransactionForm({
  transaction,
  onCancel,
  onSave,
  loading,
}: {
  transaction: TransactionItem;
  onCancel: () => void;
  onSave: (t: TransactionItem) => void;
  loading: boolean;
}) {
  const [amount, setAmount] = useState(String(transaction.amount));
  const [category, setCategory] = useState(transaction.category);
  const [description, setDescription] = useState(transaction.description);

  return (
    <DialogContent onClose={onCancel}>
      <DialogHeader>
        <DialogTitle>Edit transaction</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...transaction, amount: Number(amount), category, description });
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Amount</Label>
          <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].emoji} {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            Save changes
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
