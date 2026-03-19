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
    <div className="flex items-center justify-between py-3 border-t border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "w-11 h-6 rounded-full transition-colors relative shrink-0",
          value ? "bg-primary" : "bg-muted"
        )}
        role="switch"
        aria-checked={value}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
            value ? "translate-x-5 left-0.5" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
