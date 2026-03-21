import { useState } from "react";
import {
  Trash2,
  Sparkles,
  Check,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CrosswordWord } from "./types";

interface WordRowProps {
  word: CrosswordWord;
  index: number;
  onChange: (id: string, changes: Partial<CrosswordWord>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  isPlaced: boolean;
}

export function WordRow({
  word,
  index,
  onChange,
  onRemove,
  canRemove,
  isPlaced,
}: WordRowProps) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const isComplete =
    word.word.trim().length >= 2 && word.clue.trim().length > 0;

  return (
    <div
      className={cn(
        "rounded-xl sm:rounded-2xl border bg-background transition-all duration-200",
        isComplete && isPlaced
          ? "border-emerald-300/50 dark:border-emerald-700/40"
          : isComplete
          ? "border-amber-300/50 dark:border-amber-700/40"
          : "border-border"
      )}
    >
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          {word.word.trim() ? (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">
                {word.word.trim()}
              </span>
              {word.clue && (
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  — {word.clue}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs sm:text-sm text-muted-foreground/50">
              Word {index + 1} — enter a word and clue
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {isComplete && isPlaced && (
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            </div>
          )}
          {isComplete && !isPlaced && (
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-1.5 sm:px-2"
            >
              Skipped
            </Badge>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(word.id);
              }}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/40" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/40" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-2.5 sm:space-y-3 border-t border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Word
              </label>
              <Input
                placeholder="e.g. PARIS"
                value={word.word}
                onChange={(e) =>
                  onChange(word.id, {
                    word: e.target.value
                      .replace(/[^a-zA-Z]/g, "")
                      .toUpperCase(),
                  })
                }
                className="h-9 sm:h-10 rounded-lg sm:rounded-xl font-bold tracking-widest uppercase text-sm"
                maxLength={15}
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {word.word.trim().length > 0
                  ? `${word.word.trim().length} letters`
                  : "Letters only, min 2"}
              </p>
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                <Lightbulb className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Clue
              </label>
              <div className="relative">
                <Input
                  placeholder="A hint…"
                  value={word.clue}
                  onChange={(e) => onChange(word.id, { clue: e.target.value })}
                  className="h-9 sm:h-10 rounded-lg sm:rounded-xl pr-8 text-sm"
                  maxLength={80}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0.5 sm:right-1 top-0.5 sm:top-1 h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/50 hover:text-primary"
                  title="AI suggest clue"
                >
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
