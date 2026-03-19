import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepBadgeProps {
  step: number;
  label: string;
  current: number;
}

export function StepBadge({ step, label, current }: StepBadgeProps) {
  const done = step < current;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
          done && "bg-primary text-primary-foreground",
          step === current &&
            "bg-primary/10 text-primary ring-1 ring-primary/30",
          step > current && "bg-muted text-muted-foreground/50"
        )}
      >
        {done ? <Check className="w-3 h-3" /> : step}
      </div>
      <span
        className={cn(
          "text-sm transition-colors hidden sm:block",
          step === current
            ? "text-foreground font-medium"
            : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}
