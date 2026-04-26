import { cn } from "@/lib/utils";
import { DIFFICULTY_CONFIG } from "./types";
import type { DifficultyLevel } from "./types";

interface DifficultySelectorProps {
  value: DifficultyLevel;
  onChange: (v: DifficultyLevel) => void;
}

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2">
      {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((level) => {
        const cfg = DIFFICULTY_CONFIG[level];
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              "flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-medium transition-all duration-200",
              value === level
                ? cn(cfg.color, cfg.bg, "border")
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <span className="block font-semibold">{cfg.label}</span>
            <span className="font-normal opacity-70 mt-0.5 hidden sm:block">
              {cfg.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
