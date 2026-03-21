import { Check, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EmojiPickerButton } from "./EmojiPickerButton";
import type { GameOption, OptionField } from "./types";

interface OptionCardProps {
  option: GameOption;
  index: number;
  onChange: (
    index: number,
    field: OptionField,
    value: string | boolean
  ) => void;
  onRemove: (index: number) => void;
  isOnly: boolean;
}

export function OptionCard({
  option,
  index,
  onChange,
  onRemove,
  isOnly,
}: OptionCardProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border bg-card transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        option.isCorrect &&
          "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
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
          className="border-0 bg-transparent px-0 text-xs sm:text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 h-auto py-1"
        />
        {option.isCorrect && (
          <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Correct answer
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5 sm:gap-1 mt-1 sm:mt-1.5">
        <button
          type="button"
          title="Mark as correct answer"
          onClick={() => onChange(index, "isCorrect", !option.isCorrect)}
          className={cn(
            "w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center transition-colors",
            option.isCorrect
              ? "bg-emerald-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-950"
          )}
        >
          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
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
