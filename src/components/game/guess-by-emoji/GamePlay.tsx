import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

export function GamePlay({
  puzzles,
  recipient,
  personalMessage,
  showAnswers,
  onComplete,
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
      onComplete?.(state === "correct" ? score : score, puzzles.length);
      setIsComplete(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setGuess("");
    setState("idle");
    setShowHint(false);
    setRevealedAnswer(false);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 flex items-center justify-center p-4">
        <div className="bg-background rounded-3xl border border-border shadow-2xl p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
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

          {personalMessage && (
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/30">
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                Message from {recipient.name}
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {personalMessage}
              </p>
            </div>
          )}

          <Button
            onClick={() => window.location.reload()}
            className="w-full"
            size="lg"
          >
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl border border-border shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-6 py-4 border-b border-border space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {recipient.name ? `A game for ${recipient.name}` : "Your game"}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">
              Puzzle {currentIndex + 1} of {puzzles.length}
            </p>
          </div>

          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / puzzles.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {personalMessage && currentIndex === 0 && (
          <div className="mx-5 mt-4 px-4 py-3 rounded-2xl border bg-orange-50 dark:bg-orange-950/30 border-orange-200/50 dark:border-orange-800/30">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
              A message for you 💌
            </p>
            <p className="text-sm text-orange-800 dark:text-orange-200 leading-snug">
              {personalMessage}
            </p>
          </div>
        )}

        <div className="px-6 py-5 space-y-4">
          <div className={cn(
            "p-4 rounded-2xl border",
            diffConfig.bg
          )}>
            <p className={cn(
              "text-xs font-semibold mb-3",
              diffConfig.color
            )}>
              {diffConfig.label} · {diffConfig.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {puzzle.emojis.map((emoji, idx) => (
                <div
                  key={idx}
                  className="text-4xl p-2 bg-background/50 rounded-lg"
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          {state !== "correct" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  What is it?
                </label>
                <Input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGuess();
                  }}
                  placeholder="Type your answer..."
                  autoFocus
                  className="text-sm"
                />
              </div>

              {state === "wrong" && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  Not quite. Try again.
                </div>
              )}

              <Button
                onClick={handleGuess}
                disabled={!guess.trim()}
                className="w-full"
                size="sm"
              >
                Submit
              </Button>

              {puzzle.hint && (
                <div className="text-center">
                  {showHint ? (
                    <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-0.5">
                        💡 Hint
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {puzzle.hint}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowHint(false)}
                        className="mt-1.5 text-[10px] text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-200 underline underline-offset-2 transition-colors"
                      >
                        Hide hint
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      Show hint
                    </button>
                  )}
                </div>
              )}

              {state === "wrong" && showAnswers && !revealedAnswer && (
                <Button
                  onClick={() => setRevealedAnswer(true)}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  Reveal answer
                </Button>
              )}

              {revealedAnswer && (
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p>
                    Answer: <span className="font-semibold">{puzzle.answer}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {state === "correct" && (
            <div className="space-y-4">
              <div
                className={cn(
                  "p-4 rounded-2xl border text-center",
                  "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                )}
              >
                <p className="text-sm font-semibold">
                  ✅ Correct!
                </p>
              </div>

              <Button onClick={handleNext} className="w-full" size="sm">
                {isLast ? "See Results" : "Next Puzzle"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
