export function HeroMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-transparent blur-2xl" />
      <div className="rounded-3xl border border-border bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Remaining budget</p>
            <p className="text-2xl font-bold">Rs. 8,450</p>
          </div>
          <div className="flex size-14 items-center justify-center rounded-full border-4 border-primary text-sm font-bold text-primary">
            78
          </div>
        </div>
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[66%] rounded-full bg-primary" />
        </div>
        <div className="mb-4 flex gap-2">
          {[
            { label: "Food", pct: 40, color: "bg-[color:var(--chart-1)]" },
            { label: "Transport", pct: 20, color: "bg-[color:var(--chart-2)]" },
            { label: "Shopping", pct: 25, color: "bg-[color:var(--chart-3)]" },
            { label: "Other", pct: 15, color: "bg-[color:var(--chart-4)]" },
          ].map((c) => (
            <div key={c.label} className="flex-1">
              <div className="h-16 w-full overflow-hidden rounded-lg bg-muted">
                <div className={`w-full ${c.color}`} style={{ height: `${c.pct * 2}%`, marginTop: `${100 - c.pct * 2}%` }} />
              </div>
              <p className="mt-1 text-center text-[10px] text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2 rounded-xl bg-muted p-3">
          <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs shadow-sm">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10">🍔</span>
            <span className="flex-1">Coffee and lunch</span>
            <span className="font-semibold">Rs. 850</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs shadow-sm opacity-70">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10">💻</span>
            <span className="flex-1">Laptop fund contribution</span>
            <span className="font-semibold text-success">+Rs. 14,000</span>
          </div>
        </div>
      </div>
      <div className="absolute -right-6 -top-6 hidden rotate-3 rounded-2xl border border-border bg-card p-3 shadow-xl sm:block">
        <p className="text-[10px] text-muted-foreground">AI Assistant</p>
        <p className="mt-1 max-w-[180px] text-xs">
          &quot;You can afford it — you&apos;re Rs. 2,100 under budget this week.&quot;
        </p>
      </div>
    </div>
  );
}
