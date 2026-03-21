import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToggleSettingProps {
  icon: LucideIcon;
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleSetting({
  icon: Icon,
  label,
  description,
  value,
  onChange,
}: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 sm:py-3 border-t border-border">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium truncate">{label}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "w-10 sm:w-11 h-5.5 sm:h-6 rounded-full transition-colors relative shrink-0",
          value ? "bg-primary" : "bg-muted"
        )}
        role="switch"
        aria-checked={value}
      >
        <span
          className={cn(
            "absolute top-0.5 w-4.5 h-4.5 sm:w-5 sm:h-5 bg-white rounded-full shadow transition-transform",
            value ? "translate-x-4.5 sm:translate-x-5 left-0.5" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
