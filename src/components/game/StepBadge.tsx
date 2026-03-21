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
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div
        className={cn(
          "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors",
          done && "bg-primary text-primary-foreground",
          step === current &&
            "bg-primary/10 text-primary ring-1 ring-primary/30",
          step > current && "bg-muted text-muted-foreground/50"
        )}
      >
        {done ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : step}
      </div>
      <span
        className={cn(
          "text-xs sm:text-sm transition-colors hidden sm:block",
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
