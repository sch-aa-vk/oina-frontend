import { useMemo, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question, GameOutcome } from "./types";
import type { Recipient } from "@/components/game";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface GamePlayProps {
  questions: Question[];
  outcomes: GameOutcome[];
  recipient: Recipient;
  personalMessage: string;
  shuffle: boolean;
  onComplete?: (outcomeId: string) => void;
  isLiked?: boolean;
  likeCount?: number;
  onToggleLike?: () => void;
  isLiking?: boolean;
  isAuthenticated?: boolean;
}

export function GamePlay({
  questions,
  outcomes,
  recipient,
  personalMessage,
  shuffle,
  onComplete,
  isLiked,
  likeCount,
  onToggleLike,
  isLiking,
  isAuthenticated,
}: GamePlayProps) {
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [winner, setWinner] = useState<GameOutcome | null>(null);
  const [round, setRound] = useState(0);

  const answersRef = useRef<{ outcomeId: string }[]>([]);

  const shuffledQuestions = useMemo(() => {
    if (!shuffle) return questions;
    return shuffleArray(questions).map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffle, questions, round]);

  const handlePlayAgain = (): void => {
    answersRef.current = [];
    setCurrentQ(0);
    setSelected(null);
    setWinner(null);
    setIsComplete(false);
    if (shuffle) setRound((r) => r + 1);
  };

  const q = shuffledQuestions[currentQ];
  const progress =
    ((currentQ + (selected !== null ? 1 : 0)) / shuffledQuestions.length) * 100;

  const handleAnswer = (optIndex: number): void => {
    if (selected !== null) return;
    setSelected(optIndex);

    const chosenOutcomeId = q.options[optIndex]?.outcomeId ?? "";
    const nextAnswers = [...answersRef.current, { outcomeId: chosenOutcomeId }];
    answersRef.current = nextAnswers;

    setTimeout(() => {
      if (currentQ < shuffledQuestions.length - 1) {
        setCurrentQ((p) => p + 1);
        setSelected(null);
      } else {
        const votes: Record<string, number> = {};
        nextAnswers.forEach(({ outcomeId }) => {
          if (outcomeId) votes[outcomeId] = (votes[outcomeId] || 0) + 1;
        });
        const winnerOutcome = outcomes.reduce((best, outcome) =>
          (votes[outcome.id] ?? 0) > (votes[best.id] ?? 0) ? outcome : best
        );
        setWinner(winnerOutcome);
        setIsComplete(true);
        onComplete?.(winnerOutcome.id);
      }
    }, 800);
  };

  if (isComplete && winner) {
    return (
      <div className="max-w-lg mx-auto space-y-5 pb-10 mt-10">
        <div className="text-center space-y-3 pt-4">
          {winner.emoji && (
            <div className="text-7xl">{winner.emoji}</div>
          )}
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            Your result
          </p>
          <p className="text-2xl font-bold bg-linear-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
            {winner.title}
          </p>
          {winner.description && (
            <p className="text-sm text-muted-foreground">{winner.description}</p>
          )}
        </div>

        {personalMessage && (
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border bg-pink-50 dark:bg-pink-950/30 border-pink-200/50 dark:border-pink-800/30">
            <p className="text-[10px] sm:text-xs font-medium text-pink-600 dark:text-pink-400 mb-0.5">
              Message from {recipient.name} 💌
            </p>
            <p className="text-xs sm:text-sm text-pink-800 dark:text-pink-200 leading-snug">
              {personalMessage}
            </p>
          </div>
        )}

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

        <Button onClick={handlePlayAgain} className="w-full" size="lg">
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 sm:space-y-5 pb-10 mt-10">
      {personalMessage && currentQ === 0 && (
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border bg-pink-50 dark:bg-pink-950/30 border-pink-200/50 dark:border-pink-800/30">
          <p className="text-[10px] sm:text-xs font-medium text-pink-600 dark:text-pink-400 mb-0.5">
            A message for you 💌
          </p>
          <p className="text-xs sm:text-sm text-pink-800 dark:text-pink-200 leading-snug">
            {personalMessage}
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">
            {recipient.name ? `A game for ${recipient.name}` : "Your game"}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            Question {currentQ + 1} of {shuffledQuestions.length}
          </p>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-violet-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border p-4 sm:p-5 bg-violet-50 dark:bg-violet-950/20 border-violet-200/50 dark:border-violet-800/30">
        <p className="text-[10px] sm:text-xs font-semibold mb-2 sm:mb-3 uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Choose your answer
        </p>
        <p className="text-base">{q?.question}</p>
      </div>

      <div className="space-y-2.5">
        {q?.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200",
              selected === null &&
                "hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]",
              selected === i &&
                "border-violet-500 bg-violet-50 dark:bg-violet-950/40",
              selected !== null && selected !== i && "opacity-50",
            )}
          >
            <span className="text-xl">{opt.emoji || "✨"}</span>
            <span className="text-sm flex-1 min-w-0">
              {opt.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
