import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PreviewModalShell, GUESS_BY_EMOJI_THEME } from "@/components/game";
import type { Recipient } from "@/components/game";
import { DIFFICULTY_CONFIG } from "./types";
import type { EmojiPuzzle } from "./types";

type GuessState = "idle" | "correct" | "wrong";

interface PreviewModalProps {
  puzzles: EmojiPuzzle[];
  recipient: Recipient;
  personalMessage: string;
  onClose: () => void;
}

export function PreviewModal({
  puzzles,
  recipient,
  personalMessage,
  onClose,
}: PreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [state, setState] = useState<GuessState>("idle");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const puzzle = puzzles[currentIndex];
  const isLast = currentIndex === puzzles.length - 1;

  const handleGuess = (): void => {
    if (!guess.trim()) return;
    const correct =
      guess.trim().toLowerCase() === puzzle.answer.trim().toLowerCase();
    if (correct) {
      setState("correct");
      setScore((s) => s + 1);
      return;
    }

    setState("wrong");
  };

  const handleNext = (): void => {
    if (isLast) {
      onClose();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setGuess("");
    setState("idle");
    setShowHint(false);
  };

  return (
    <PreviewModalShell
      recipient={recipient}
      personalMessage={personalMessage}
      showMessage={currentIndex === 0}
      progress={`${currentIndex + 1} / ${puzzles.length}`}
      progressPercent={((currentIndex + 1) / puzzles.length) * 100}
      theme={GUESS_BY_EMOJI_THEME}
      onClose={onClose}
    >
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        <div className="flex justify-between items-center">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] sm:text-xs border",
              DIFFICULTY_CONFIG[puzzle.difficulty].color,
              DIFFICULTY_CONFIG[puzzle.difficulty].bg
            )}
          >
            {DIFFICULTY_CONFIG[puzzle.difficulty].label}
          </Badge>
          <span className="text-[10px] sm:text-xs text-muted-foreground">🏆 {score}</span>
        </div>

        <div
          className={cn(
            "flex flex-wrap justify-center gap-2 sm:gap-3 py-4 sm:py-6 px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-colors",
            state === "correct" && "bg-emerald-50 dark:bg-emerald-950/30",
            state === "wrong" && "bg-red-50 dark:bg-red-950/30",
            state === "idle" && "bg-muted/40"
          )}
        >
          {puzzle.emojis.length > 0 ? (
            puzzle.emojis.map((e, i) => (
              <span key={i} className="text-3xl sm:text-4xl select-none">
                {e}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-xs sm:text-sm">
              No emojis added
            </span>
          )}
        </div>

        {puzzle.hint && state === "idle" && (
          <div className="text-center">
            {showHint ? (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium mb-0.5">
                  💡 Hint
                </p>
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                  {puzzle.hint}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Show hint
              </button>
            )}
          </div>
        )}

        {state === "correct" && (
          <div className="text-center space-y-0.5 sm:space-y-1">
            <p className="text-xl sm:text-2xl">🎉</p>
            <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Correct!
            </p>
          </div>
        )}

        {state !== "correct" && (
          <div className="flex gap-1.5 sm:gap-2">
            <Input
              placeholder="Your guess…"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              className="h-9 sm:h-10 rounded-lg sm:rounded-xl flex-1 text-sm"
              autoComplete="off"
            />
            <Button
              onClick={handleGuess}
              disabled={!guess.trim()}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl text-sm"
            >
              Go
            </Button>
          </div>
        )}

        {state === "wrong" && (
          <div className="text-center space-y-0.5 sm:space-y-1">
            <p className="text-xl sm:text-2xl">😅</p>
            <p className="text-xs sm:text-sm font-semibold text-red-500">Not quite. Try again!</p>
          </div>
        )}

        {state === "correct" && (
          <Button onClick={handleNext} className="w-full rounded-lg sm:rounded-xl h-9 sm:h-10 text-sm">
            {isLast ? "Finish" : "Next puzzle →"}
          </Button>
        )}
      </div>
    </PreviewModalShell>
  );
}
