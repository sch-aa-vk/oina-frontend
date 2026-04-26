import { useState } from "react";
import { cn } from "@/lib/utils";
import { PreviewModalShell, CHOOSE_ME_THEME } from "@/components/game";
import type { Recipient } from "@/components/game";
import type { Question } from "./types";

interface PreviewModalProps {
  questions: Question[];
  recipient: Recipient;
  personalMessage: string;
  onClose: () => void;
}

export function PreviewModal({
  questions,
  recipient,
  personalMessage,
  onClose,
}: PreviewModalProps) {
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);

  const q = questions[currentQ];

  const handleAnswer = (optIndex: number): void => {
    if (selected !== null) return;
    setSelected(optIndex);
    setTimeout(() => {
      setSelected(null);
      if (currentQ < questions.length - 1) setCurrentQ((p) => p + 1);
    }, 800);
  };

  return (
    <PreviewModalShell
      recipient={recipient}
      personalMessage={personalMessage}
      showMessage={currentQ === 0}
      progress={`${currentQ + 1} / ${questions.length}`}
      progressPercent={((currentQ + 1) / questions.length) * 100}
      theme={CHOOSE_ME_THEME}
      maxWidth="sm:max-w-5xl"
      onClose={onClose}
    >
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="mx-auto w-full max-w-3xl">
        <p className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">
          {q?.question || "Your question here"}
        </p>
        <div className="space-y-2 sm:space-y-2.5">
          {q?.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={cn(
                "w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border text-left transition-all duration-200",
                selected === null &&
                  "hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]",
                selected === i &&
                  "border-violet-500 bg-violet-50 dark:bg-violet-950/40",
                selected !== null && selected !== i && "opacity-50"
              )}
            >
              <span className="text-lg sm:text-xl">{opt.emoji || "✨"}</span>
              <span className="text-xs sm:text-sm font-medium flex-1 min-w-0">
                {opt.text || `Option ${i + 1}`}
              </span>
            </button>
          ))}
        </div>
        </div>
      </div>
    </PreviewModalShell>
  );
}
