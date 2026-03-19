interface SummaryItem {
  icon: string;
  label: string;
  value: string;
}

interface SummaryCardProps {
  items: SummaryItem[];
  /** Optional extra content rendered below the stat tiles */
  children?: React.ReactNode;
}

export function SummaryCard({ items, children }: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm space-y-5">
      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
        Game summary
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">
              {item.icon} {item.label}
            </p>
            <p className="text-sm font-semibold truncate">{item.value}</p>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
