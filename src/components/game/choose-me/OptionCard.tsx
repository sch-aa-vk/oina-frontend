import { Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EmojiPickerButton } from "./EmojiPickerButton";
import type { GameOption, OptionField, GameOutcome } from "./types";

interface OptionCardProps {
  option: GameOption;
  index: number;
  outcomes: GameOutcome[];
  onChange: (index: number, field: OptionField, value: string) => void;
  onRemove: (index: number) => void;
  isOnly: boolean;
}

export function OptionCard({
  option,
  index,
  outcomes,
  onChange,
  onRemove,
  isOnly,
}: OptionCardProps) {
  const selectedOutcome = outcomes.find((o) => o.id === option.outcomeId);

  return (
    <div
      className={cn(
        "group flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border bg-card transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        option.outcomeId &&
          "border-violet-300/50 bg-violet-50/30 dark:bg-violet-950/10"
      )}
    >
      <div className="mt-2 sm:mt-2.5 text-muted-foreground/40 cursor-grab group-hover:text-muted-foreground/70 transition-colors hidden sm:block">
        <GripVertical className="w-4 h-4" />
      </div>
      <EmojiPickerButton
        selected={option.emoji}
        onSelect={(emoji) => onChange(index, "emoji", emoji)}
      />
      <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
        <Input
          placeholder={`Option ${index + 1}…`}
          value={option.text}
          onChange={(e) => onChange(index, "text", e.target.value)}
          className="border-0 bg-transparent px-0 text-base sm:text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 h-auto py-1"
        />
        <select
          value={option.outcomeId}
          onChange={(e) => onChange(index, "outcomeId", e.target.value)}
          className={cn(
            "w-full sm:w-auto text-base sm:text-xs rounded-lg border px-2 py-1.5 sm:px-1.5 sm:py-0.5 focus:outline-none focus:ring-1 focus:ring-primary transition-colors bg-transparent",
            selectedOutcome
              ? "border-violet-300 text-violet-700 dark:text-violet-300 dark:border-violet-700"
              : "border-dashed border-border text-muted-foreground"
          )}
        >
          <option value="">— pick outcome —</option>
          {outcomes.map((o) => (
            <option key={o.id} value={o.id}>
              {o.emoji ? `${o.emoji} ` : ""}{o.title || o.id}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-0.5 sm:gap-1 mt-1 sm:mt-1.5">
        {!isOnly && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
