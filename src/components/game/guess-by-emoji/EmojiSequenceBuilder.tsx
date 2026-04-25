import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";

interface EmojiSequenceBuilderProps {
  emojis: string[];
  onChange: (e: string[]) => void;
}

export function EmojiSequenceBuilder({
  emojis,
  onChange,
}: EmojiSequenceBuilderProps) {
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  const addEmoji = useCallback(
    (emoji: string) => {
      if (emojis.length >= 10) return;
      onChange([...emojis, emoji]);
    },
    [emojis, onChange]
  );

  const removeEmoji = useCallback(
    (index: number) => {
      onChange(emojis.filter((_, i) => i !== index));
    },
    [emojis, onChange]
  );

  const moveEmoji = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= emojis.length) return;
      const next = [...emojis];
      [next[from], next[to]] = [next[to], next[from]];
      onChange(next);
    },
    [emojis, onChange]
  );

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="min-h-14 sm:min-h-16 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-dashed border-border bg-muted/30 flex flex-wrap gap-1.5 sm:gap-2 items-center">
        {emojis.length === 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground/60 mx-auto">
            Add emojis to build your puzzle ↓
          </p>
        )}
        {emojis.map((e, i) => (
          <div
            key={i}
            className="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl rounded-lg sm:rounded-xl bg-background border border-border shadow-sm hover:border-primary/40 transition-all"
          >
            <span className="select-none">{e}</span>
            <div className="absolute -top-1 -right-1 hidden group-hover:flex flex-col gap-px">
              <button
                type="button"
                onClick={() => moveEmoji(i, i - 1)}
                disabled={i === 0}
                className="w-4 h-4 rounded bg-background border border-border flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
              >
                <ChevronUp className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={() => moveEmoji(i, i + 1)}
                disabled={i === emojis.length - 1}
                className="w-4 h-4 rounded bg-background border border-border flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
              >
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeEmoji(i)}
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground items-center justify-center flex sm:hidden group-hover:flex"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        {emojis.length < 10 && (
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setPickerOpen(!pickerOpen)}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 border-dashed flex items-center justify-center transition-all",
                pickerOpen
                  ? "border-primary bg-primary/5"
                  : "border-border text-muted-foreground/40 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
              )}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {pickerOpen && (
              <div className="absolute z-50 top-full mt-2 left-0 sm:left-auto sm:right-auto">
                <EmojiPicker
                  onEmojiClick={(data: EmojiClickData) => {
                    addEmoji(data.emoji);
                  }}
                  height={340}
                  width={280}
                  searchPlaceholder="Search emojis..."
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {emojis.length}/10 emojis
          <span className="hidden sm:inline"> · hover to reorder or remove</span>
        </p>
        {emojis.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] sm:text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
