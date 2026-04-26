import { useState } from "react";
import { Heart, ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DIFFICULTY_CONFIG } from "./types";
import type { EmojiPuzzle } from "./types";
import type { Recipient } from "@/components/game";

type GuessState = "idle" | "correct" | "wrong";

interface GamePlayProps {
  puzzles: EmojiPuzzle[];
  recipient: Recipient;
  personalMessage: string;
  showAnswers: boolean;
  onComplete?: (score: number, total: number) => void;
  isLiked?: boolean;
  likeCount?: number;
  onToggleLike?: () => void;
  isLiking?: boolean;
  isAuthenticated?: boolean;
}

export function GamePlay({
  puzzles,
  recipient,
  personalMessage,
  showAnswers,
  onComplete,
  isLiked,
  likeCount,
  onToggleLike,
  isLiking,
  isAuthenticated,
}: GamePlayProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [state, setState] = useState<GuessState>("idle");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [revealedAnswer, setRevealedAnswer] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const puzzle = puzzles[currentIndex];
  const isLast = currentIndex === puzzles.length - 1;
  const diffConfig = DIFFICULTY_CONFIG[puzzle.difficulty];
  const progress =
    ((currentIndex + (state === "correct" ? 1 : 0)) / puzzles.length) * 100;

  const handleGuess = (): void => {
    if (!guess.trim()) return;
    const correct =
      guess.trim().toLowerCase() === puzzle.answer.trim().toLowerCase();
    if (correct) {
      setState("correct");
      setScore((s) => s + 1);
      setRevealedAnswer(false);
      return;
    }
    setState("wrong");
  };

  const handleNext = (): void => {
    if (isLast) {
      onComplete?.(score, puzzles.length);
      setIsComplete(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setGuess("");
    setState("idle");
    setShowHint(false);
    setRevealedAnswer(false);
  };

  const handlePlayAgain = (): void => {
    setCurrentIndex(0);
    setGuess("");
    setState("idle");
    setShowHint(false);
    setRevealedAnswer(false);
    setScore(0);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="max-w-lg mx-auto space-y-5 pb-10 mt-10">
        <div className="text-center space-y-2 pt-4">
          <div className="text-6xl font-bold bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            {score}/{puzzles.length}
          </div>
          <p className="text-lg font-semibold">Game Complete!</p>
          <p className="text-sm text-muted-foreground">
            {score === puzzles.length
              ? "Perfect score! 🎉"
              : score >= puzzles.length * 0.8
                ? "Great job! 🌟"
                : score >= puzzles.length * 0.5
                  ? "Good effort! 💪"
                  : "Keep practicing! 🎮"}
          </p>
        </div>

        {onToggleLike && (
          <button
            onClick={onToggleLike}
            disabled={isLiking || !isAuthenticated}
            title={!isAuthenticated ? "Sign in to like" : undefined}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border transition-colors text-sm font-medium",
              isLiked
                ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-500"
                : "border-border text-muted-foreground hover:text-rose-500 hover:border-rose-300 disabled:opacity-50",
            )}
          >
            <Heart className={cn("size-4", isLiked && "fill-current")} />
            {isLiked ? "Liked!" : "Like this game"}
            {likeCount !== undefined && (
              <span className="text-xs opacity-60">({likeCount})</span>
            )}
          </button>
        )}

        <Button
          onClick={handlePlayAgain}
          className="w-full"
          size="lg"
        >
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 sm:space-y-5 pb-10 mt-10">
      {personalMessage && (
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border bg-orange-50 dark:bg-orange-950/30 border-orange-200/50 dark:border-orange-800/30">
          <p className="text-[10px] sm:text-xs font-medium text-orange-600 dark:text-orange-400 mb-0.5">
            A message for you 💌
          </p>
          <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 leading-snug">
            {personalMessage}
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">
              {recipient.name ? `A game for ${recipient.name}` : "Your game"}
            </p>
            <p className="text-sm sm:text-base font-semibold leading-tight">
              Puzzle {currentIndex + 1}{" "}
              <span className="text-muted-foreground font-normal">
                of {puzzles.length} · {score} correct
              </span>
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs shrink-0 border", diffConfig.color)}
          >
            {diffConfig.label}
          </Badge>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-amber-400 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={cn("rounded-2xl border p-2 sm:p-4", diffConfig.bg)}>
        <p
          className={cn(
            "text-[10px] sm:text-xs font-semibold mb-2 sm:mb-4 uppercase tracking-wider",
            diffConfig.color,
          )}
        >
          {diffConfig.description}
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-2">
          {puzzle.emojis.map((emoji, idx) => (
            <div
              key={idx}
              className="text-2xl sm:text-5xl p-2.5 sm:p-3 bg-background/60 rounded-2xl shadow-sm select-none"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {state !== "correct" ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground">
              What does this represent?
            </label>
            <Input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGuess();
              }}
              placeholder="Type your answer..."
              autoFocus
              className={cn(
                "h-11 sm:h-12 text-sm sm:text-base",
                state === "wrong" &&
                  "border-red-400 dark:border-red-600 focus-visible:ring-red-400",
              )}
            />
          </div>

          {state === "wrong" && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              Not quite — try again!
            </div>
          )}

          <Button
            onClick={handleGuess}
            disabled={!guess.trim()}
            className="w-full h-11 sm:h-12 text-sm sm:text-base"
          >
            Check Answer
          </Button>

          <div className="flex items-start justify-between gap-3">
            {puzzle.hint && (
              <div className="flex-1">
                {showHint ? (
                  <div className="px-3 sm:px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                        <Lightbulb className="size-3" />
                        Hint
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowHint(false)}
                        className="text-[10px] text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-200 underline underline-offset-2 transition-colors"
                      >
                        Hide
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                      {puzzle.hint}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                  >
                    Need a hint?
                  </button>
                )}
              </div>
            )}

            {state === "wrong" && showAnswers && !revealedAnswer && (
              <button
                type="button"
                onClick={() => setRevealedAnswer(true)}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors shrink-0"
              >
                Reveal answer
              </button>
            )}
          </div>

          {revealedAnswer && (
            <div className="px-3 py-2.5 rounded-lg bg-muted text-xs sm:text-sm">
              Answer: <span className="font-semibold">{puzzle.answer}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-center space-y-1">
            <p className="text-base sm:text-lg font-semibold text-emerald-700 dark:text-emerald-300">
              ✅ Correct!
            </p>
          </div>

          <Button
            onClick={handleNext}
            className="w-full h-11 sm:h-12 text-sm sm:text-base gap-1.5"
          >
            {isLast ? "See Results" : "Next Puzzle"}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
