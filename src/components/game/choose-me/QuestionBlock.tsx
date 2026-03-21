import { Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionCard } from "./OptionCard";
import type { Question, QuestionField, GameOption, OptionField } from "./types";

interface QuestionBlockProps {
  question: Question;
  qIndex: number;
  onChange: (
    qIndex: number,
    field: QuestionField,
    value: string | GameOption[]
  ) => void;
  onRemove: (qIndex: number) => void;
  totalQuestions: number;
}

export function QuestionBlock({
  question,
  qIndex,
  onChange,
  onRemove,
  totalQuestions,
}: QuestionBlockProps) {
  const addOption = (): void => {
    if (question.options.length >= 6) return;
    onChange(qIndex, "options", [
      ...question.options,
      { text: "", emoji: "", isCorrect: false },
    ]);
  };
  const updateOption = (
    optIndex: number,
    field: OptionField,
    value: string | boolean
  ): void => {
    onChange(
      qIndex,
      "options",
      question.options.map((o, i) =>
        i === optIndex ? { ...o, [field]: value } : o
      )
    );
  };
  const removeOption = (optIndex: number): void => {
    onChange(
      qIndex,
      "options",
      question.options.filter((_, i) => i !== optIndex)
    );
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border bg-background p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm">
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex items-center justify-center">
            {qIndex + 1}
          </span>
          <Input
            placeholder="Type your question here…"
            value={question.question}
            onChange={(e) => onChange(qIndex, "question", e.target.value)}
            className="border-0 bg-transparent px-0 text-sm sm:text-base font-semibold placeholder:text-muted-foreground/40 focus-visible:ring-0 h-auto py-0"
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 sm:h-8 gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground hover:text-primary px-1.5 sm:px-2"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">AI help</span>
          </Button>
          {totalQuestions > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/50 hover:text-destructive"
              onClick={() => onRemove(qIndex)}
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 sm:space-y-2.5 pl-0 sm:pl-11">
        {question.options.map((opt, i) => (
          <OptionCard
            key={i}
            option={opt}
            index={i}
            onChange={updateOption}
            onRemove={removeOption}
            isOnly={question.options.length === 1}
          />
        ))}
        {question.options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-dashed border-border text-muted-foreground text-xs sm:text-sm hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Add option
          </button>
        )}
      </div>
    </div>
  );
}
