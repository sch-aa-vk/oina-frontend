interface SummaryItem {
  icon: string;
  label: string;
  value: string;
}

interface SummaryCardProps {
  items: SummaryItem[];
  children?: React.ReactNode;
}

export function SummaryCard({ items, children }: SummaryCardProps) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border bg-background p-4 sm:p-6 shadow-sm space-y-3.5 sm:space-y-5">
      <h2 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
        Game summary
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl sm:rounded-2xl bg-muted/50 px-3 sm:px-4 py-2.5 sm:py-3"
          >
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
              {item.icon} {item.label}
            </p>
            <p className="text-xs sm:text-sm font-semibold truncate">
              {item.value}
            </p>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
