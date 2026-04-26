import { useRef, useState } from "react";
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
}

export function GamePlay({
  questions,
  outcomes,
  recipient,
  personalMessage,
  shuffle,
  onComplete,
}: GamePlayProps) {
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [winner, setWinner] = useState<GameOutcome | null>(null);

  const answersRef = useRef<{ outcomeId: string }[]>([]);

  const [shuffledQuestions] = useState<Question[]>(() =>
    shuffle ? shuffleArray(questions) : questions
  );

  const q = shuffledQuestions[currentQ];

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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950 dark:to-pink-950 flex items-center justify-center p-4">
        <div className="bg-background rounded-3xl border border-border shadow-2xl p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-3">
            {winner.emoji && (
              <div className="text-7xl">{winner.emoji}</div>
            )}
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Your result
            </p>
            <p className="text-2xl font-bold">{winner.title}</p>
            {winner.description && (
              <p className="text-sm text-muted-foreground">{winner.description}</p>
            )}
          </div>

          {personalMessage && (
            <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200/50 dark:border-pink-800/30">
              <p className="text-xs font-medium text-pink-600 dark:text-pink-400 mb-1">
                Message from {recipient.name}
              </p>
              <p className="text-sm text-pink-800 dark:text-pink-200">
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950 dark:to-pink-950 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl border border-border shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-6 py-4 border-b border-border space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {recipient.name ? `A game for ${recipient.name}` : "Your game"}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">
              Question {currentQ + 1} of {shuffledQuestions.length}
            </p>
          </div>

          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-300"
              style={{
                width: `${((currentQ + 1) / shuffledQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {personalMessage && currentQ === 0 && (
          <div className="mx-5 mt-4 px-4 py-3 rounded-2xl border bg-pink-50 dark:bg-pink-950/30 border-pink-200/50 dark:border-pink-800/30">
            <p className="text-xs font-medium text-pink-600 dark:text-pink-400 mb-1">
              A message for you 💌
            </p>
            <p className="text-sm text-pink-800 dark:text-pink-200 leading-snug">
              {personalMessage}
            </p>
          </div>
        )}

        <div className="px-6 py-5">
          <p className="text-base font-semibold mb-4">{q?.question}</p>
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
                  selected !== null && selected !== i && "opacity-50"
                )}
              >
                <span className="text-xl">{opt.emoji || "✨"}</span>
                <span className="text-sm font-medium flex-1 min-w-0">
                  {opt.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
