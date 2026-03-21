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
import { EmojiSequenceBuilder } from "./EmojiSequenceBuilder";
import { DifficultySelector } from "./DifficultySelector";
import { DIFFICULTY_CONFIG } from "./types";
import type { EmojiPuzzle } from "./types";

interface PuzzleCardProps {
  puzzle: EmojiPuzzle;
  index: number;
  onChange: (id: string, changes: Partial<EmojiPuzzle>) => void;
  onRemove: (id: string) => void;
  totalPuzzles: number;
}

export function PuzzleCard({
  puzzle,
  index,
  onChange,
  onRemove,
  totalPuzzles,
}: PuzzleCardProps) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const cfg = DIFFICULTY_CONFIG[puzzle.difficulty];
  const isComplete =
    puzzle.emojis.length > 0 && puzzle.answer.trim().length > 0;

  return (
    <div
      className={cn(
        "rounded-2xl sm:rounded-3xl border bg-background shadow-sm transition-all duration-200",
        isComplete ? "border-border" : "border-border/60"
      )}
    >
      <div
        className="flex items-center gap-2 sm:gap-3 p-3.5 sm:p-5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex items-center justify-center">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          {puzzle.emojis.length > 0 ? (
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
              {puzzle.emojis.map((e, i) => (
                <span key={i} className="text-base sm:text-lg">
                  {e}
                </span>
              ))}
              {puzzle.answer && (
                <>
                  <span className="text-muted-foreground/40 mx-0.5 sm:mx-1">→</span>
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground truncate">
                    {puzzle.answer}
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground/50">
              Puzzle {index + 1} — add emojis
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isComplete && (
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            </div>
          )}
          <Badge
            variant="outline"
            className={cn("text-[10px] sm:text-xs border", cfg.color, cfg.bg)}
          >
            {cfg.label}
          </Badge>
          {totalPuzzles > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(puzzle.id);
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
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
        <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 space-y-4 sm:space-y-5 border-t border-border/50 pt-4 sm:pt-5">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium">Emoji sequence</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 sm:h-7 gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground hover:text-primary px-1.5 sm:px-2"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">AI suggest</span>
                <span className="sm:hidden">AI</span>
              </Button>
            </div>
            <EmojiSequenceBuilder
              emojis={puzzle.emojis}
              onChange={(emojis) => onChange(puzzle.id, { emojis })}
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Answer</label>
            <Input
              placeholder="What should they guess?"
              value={puzzle.answer}
              onChange={(e) => onChange(puzzle.id, { answer: e.target.value })}
              className="h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
              <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
              Hint
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal">
                Optional
              </Badge>
            </label>
            <Input
              placeholder="Give a subtle nudge…"
              value={puzzle.hint}
              onChange={(e) => onChange(puzzle.id, { hint: e.target.value })}
              className="h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Difficulty</label>
            <DifficultySelector
              value={puzzle.difficulty}
              onChange={(difficulty) => onChange(puzzle.id, { difficulty })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
