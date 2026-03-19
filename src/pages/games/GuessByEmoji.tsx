import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  Check,
  Lightbulb,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GameTopBar,
  RecipientStep,
  AiBanner,
  AddItemButton,
  SummaryCard,
  ToggleSetting,
  PublishStep,
  PreviewModalShell,
  GUESS_BY_EMOJI_THEME,
} from "@/components/game";
import type { Recipient } from "@/components/game";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DifficultyLevel = "easy" | "medium" | "hard";

interface EmojiPuzzle {
  id: string;
  emojis: string[];
  answer: string;
  hint: string;
  difficulty: DifficultyLevel;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS: [string, string, string] = [
  "Recipient",
  "Puzzles",
  "Publish",
];

const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; color: string; bg: string; description: string }
> = {
  easy: {
    label: "Easy",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/30",
    description: "Obvious clues",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/30",
    description: "Some thought needed",
  },
  hard: {
    label: "Hard",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-800/30",
    description: "Real head-scratcher",
  },
};


const createDefaultPuzzle = (): EmojiPuzzle => ({
  id: Math.random().toString(36).slice(2),
  emojis: [],
  answer: "",
  hint: "",
  difficulty: "medium",
});

// ─── EmojiSequenceBuilder ─────────────────────────────────────────────────────

function EmojiSequenceBuilder({
  emojis,
  onChange,
}: {
  emojis: string[];
  onChange: (e: string[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);

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
    <div className="space-y-3">
      <div className="min-h-16 p-3 rounded-2xl border border-dashed border-border bg-muted/30 flex flex-wrap gap-2 items-center">
        {emojis.length === 0 && (
          <p className="text-sm text-muted-foreground/60 mx-auto">
            Add emojis to build your puzzle ↓
          </p>
        )}
        {emojis.map((e, i) => (
          <div
            key={i}
            className="group relative flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-background border border-border shadow-sm hover:border-primary/40 transition-all"
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
              className="absolute -bottom-1 -right-1 hidden group-hover:flex w-4 h-4 rounded-full bg-destructive text-destructive-foreground items-center justify-center"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        {emojis.length < 10 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen(!pickerOpen)}
              className={cn(
                "w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center transition-all",
                pickerOpen
                  ? "border-primary bg-primary/5"
                  : "border-border text-muted-foreground/40 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
            {pickerOpen && (
              <div className="absolute z-50 top-full mt-2 left-0">
                <EmojiPicker
                  onEmojiClick={(data: EmojiClickData) => {
                    addEmoji(data.emoji);
                  }}
                  height={380}
                  width={300}
                  searchPlaceholder="Search emojis..."
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {emojis.length}/10 emojis · hover to reorder or remove
        </p>
        {emojis.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

// ─── DifficultySelector ───────────────────────────────────────────────────────

function DifficultySelector({
  value,
  onChange,
}: {
  value: DifficultyLevel;
  onChange: (v: DifficultyLevel) => void;
}) {
  return (
    <div className="flex gap-2">
      {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((level) => {
        const cfg = DIFFICULTY_CONFIG[level];
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all duration-200",
              value === level
                ? cn(cfg.color, cfg.bg, "border")
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <span className="block font-semibold">{cfg.label}</span>
            <span className="block font-normal opacity-70 mt-0.5">
              {cfg.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── PuzzleCard ───────────────────────────────────────────────────────────────

interface PuzzleCardProps {
  puzzle: EmojiPuzzle;
  index: number;
  onChange: (id: string, changes: Partial<EmojiPuzzle>) => void;
  onRemove: (id: string) => void;
  totalPuzzles: number;
}

function PuzzleCard({
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
        "rounded-3xl border bg-background shadow-sm transition-all duration-200",
        isComplete ? "border-border" : "border-border/60"
      )}
    >
      <div
        className="flex items-center gap-3 p-5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          {puzzle.emojis.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              {puzzle.emojis.map((e, i) => (
                <span key={i} className="text-lg">
                  {e}
                </span>
              ))}
              {puzzle.answer && (
                <>
                  <span className="text-muted-foreground/40 mx-1">→</span>
                  <span className="text-sm font-semibold text-muted-foreground truncate">
                    {puzzle.answer}
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">
              Puzzle {index + 1} — add emojis to get started
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isComplete && (
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
          <Badge
            variant="outline"
            className={cn("text-xs border", cfg.color, cfg.bg)}
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
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-border/50 pt-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Emoji sequence</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
              >
                <Sparkles className="w-3 h-3" />
                AI suggest
              </Button>
            </div>
            <EmojiSequenceBuilder
              emojis={puzzle.emojis}
              onChange={(emojis) => onChange(puzzle.id, { emojis })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Answer</label>
            <Input
              placeholder="What should they guess?"
              value={puzzle.answer}
              onChange={(e) => onChange(puzzle.id, { answer: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
              Hint
              <Badge variant="secondary" className="text-xs font-normal">
                Optional
              </Badge>
            </label>
            <Input
              placeholder="Give a subtle nudge…"
              value={puzzle.hint}
              onChange={(e) => onChange(puzzle.id, { hint: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
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

// ─── PreviewModal ─────────────────────────────────────────────────────────────

type GuessState = "idle" | "correct" | "wrong";

function PreviewModal({
  puzzles,
  recipient,
  personalMessage,
  onClose,
}: {
  puzzles: EmojiPuzzle[];
  recipient: Recipient;
  personalMessage: string;
  onClose: () => void;
}) {
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
    setState(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
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
      <div className="px-6 py-6 space-y-5">
        <div className="flex justify-between items-center">
          <Badge
            variant="outline"
            className={cn(
              "text-xs border",
              DIFFICULTY_CONFIG[puzzle.difficulty].color,
              DIFFICULTY_CONFIG[puzzle.difficulty].bg
            )}
          >
            {DIFFICULTY_CONFIG[puzzle.difficulty].label}
          </Badge>
          <span className="text-xs text-muted-foreground">🏆 {score}</span>
        </div>

        <div
          className={cn(
            "flex flex-wrap justify-center gap-3 py-6 px-4 rounded-2xl transition-colors",
            state === "correct" && "bg-emerald-50 dark:bg-emerald-950/30",
            state === "wrong" && "bg-red-50 dark:bg-red-950/30",
            state === "idle" && "bg-muted/40"
          )}
        >
          {puzzle.emojis.length > 0 ? (
            puzzle.emojis.map((e, i) => (
              <span key={i} className="text-4xl select-none">
                {e}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">
              No emojis added
            </span>
          )}
        </div>

        {puzzle.hint && state === "idle" && (
          <div className="text-center">
            {showHint ? (
              <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-0.5">
                  💡 Hint
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {puzzle.hint}
                </p>
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

        {state === "correct" && (
          <div className="text-center space-y-1">
            <p className="text-2xl">🎉</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Correct!
            </p>
            <p className="text-xs text-muted-foreground">
              The answer was: {puzzle.answer}
            </p>
          </div>
        )}
        {state === "wrong" && (
          <div className="text-center space-y-1">
            <p className="text-2xl">😅</p>
            <p className="text-sm font-semibold text-red-500">Not quite!</p>
            <p className="text-xs text-muted-foreground">
              The answer was: {puzzle.answer}
            </p>
          </div>
        )}

        {state === "idle" && (
          <div className="flex gap-2">
            <Input
              placeholder="Your guess…"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              className="h-10 rounded-xl flex-1"
              autoComplete="off"
            />
            <Button
              onClick={handleGuess}
              disabled={!guess.trim()}
              className="h-10 px-4 rounded-xl"
            >
              Go
            </Button>
          </div>
        )}
        {state !== "idle" && (
          <Button onClick={handleNext} className="w-full rounded-xl h-10">
            {isLast ? "Finish" : "Next puzzle →"}
          </Button>
        )}
      </div>
    </PreviewModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GuessByEmoji() {
  const [step, setStep] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<Recipient>({
    name: "",
    occasion: "",
  });
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [puzzles, setPuzzles] = useState<EmojiPuzzle[]>([
    createDefaultPuzzle(),
  ]);
  const [gameTitle, setGameTitle] = useState<string>("");
  const [showAnswers, setShowAnswers] = useState<boolean>(true);

  const updatePuzzle = (id: string, changes: Partial<EmojiPuzzle>): void => {
    setPuzzles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  };
  const addPuzzle = (): void => {
    if (puzzles.length < 10) setPuzzles((p) => [...p, createDefaultPuzzle()]);
  };
  const removePuzzle = (id: string): void => {
    setPuzzles((p) => p.filter((p) => p.id !== id));
  };

  const completeness = {
    recipient: recipient.name.trim().length > 0,
    puzzles:
      puzzles.length > 0 &&
      puzzles.every((p) => p.emojis.length > 0 && p.answer.trim().length > 0),
    title: gameTitle.trim().length > 0,
  };
  const canPublish = Object.values(completeness).every(Boolean);
  const missingFields = [
    !completeness.recipient && "recipient name",
    !completeness.puzzles && "all puzzles need emojis & an answer",
    !completeness.title && "game title",
  ].filter(Boolean) as string[];

  const completedPuzzles = puzzles.filter(
    (p) => p.emojis.length > 0 && p.answer.trim()
  ).length;

  return (
    <div className="min-h-screen bg-muted/30">
      {showPreview && (
        <PreviewModal
          puzzles={puzzles}
          recipient={recipient}
          personalMessage={personalMessage}
          onClose={() => setShowPreview(false)}
        />
      )}

      <GameTopBar
        step={step}
        onStepChange={setStep}
        stepLabels={STEP_LABELS}
        onPreview={() => setShowPreview(true)}
        canPublish={canPublish}
        theme={GUESS_BY_EMOJI_THEME}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {step === 1 && (
          <RecipientStep
            recipient={recipient}
            onRecipientChange={setRecipient}
            personalMessage={personalMessage}
            onPersonalMessageChange={setPersonalMessage}
            onContinue={() => setStep(2)}
            theme={GUESS_BY_EMOJI_THEME}
            heading="Who's playing? 😄"
            namePlaceholder="e.g. Alex, Dad, My Person…"
            messagePlaceholder="Write a fun intro your recipient sees before they start guessing…"
            aiTeaserTitle="AI-powered emoji suggestions — coming next step"
            aiTeaserBody="Describe a memory, movie, or inside joke and our AI will pick the perfect emoji combo to represent it."
            continueLabel="Continue to puzzles →"
          />
        )}

        {step === 2 && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  Build your puzzles 😄
                </h1>
                <p className="text-muted-foreground text-sm">
                  Create emoji sequences your recipient has to decode. Each
                  puzzle needs emojis and an answer.
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 mt-1">
                {completedPuzzles}/{puzzles.length} ready
              </Badge>
            </div>

            {recipient.name && (
              <AiBanner
                recipientName={recipient.name}
                theme={GUESS_BY_EMOJI_THEME}
                title={(name) => `AI can suggest emoji combos for ${name}`}
                subtitle="Describe a memory or word and we'll pick the perfect emojis"
              />
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "😄🎂🎉", label: "Add emojis" },
                { icon: "💡", label: "Set the answer" },
                { icon: "🎯", label: "Pick difficulty" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-background border border-border p-3 text-center space-y-1.5"
                >
                  <p className="text-2xl">{item.icon}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {puzzles.map((puzzle, i) => (
                <PuzzleCard
                  key={puzzle.id}
                  puzzle={puzzle}
                  index={i}
                  onChange={updatePuzzle}
                  onRemove={removePuzzle}
                  totalPuzzles={puzzles.length}
                />
              ))}
            </div>

            {puzzles.length < 10 && (
              <AddItemButton label="Add another puzzle" onClick={addPuzzle} />
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-11 px-5 rounded-xl"
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="h-11 px-6 rounded-xl"
              >
                Continue to publish →
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <SummaryCard
              items={[
                {
                  icon: "👤",
                  label: "Recipient",
                  value: recipient.name || "—",
                },
                {
                  icon: "🎉",
                  label: "Occasion",
                  value: recipient.occasion || "—",
                },
                {
                  icon: "😄",
                  label: "Puzzles",
                  value: `${puzzles.length} puzzles`,
                },
              ]}
            >
              {/* Difficulty breakdown */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Difficulty mix
                </p>
                <div className="flex gap-2">
                  {(["easy", "medium", "hard"] as DifficultyLevel[]).map(
                    (level) => {
                      const count = puzzles.filter(
                        (p) => p.difficulty === level
                      ).length;
                      const cfg = DIFFICULTY_CONFIG[level];
                      return (
                        <div
                          key={level}
                          className={cn(
                            "flex-1 rounded-xl px-3 py-2 border text-center",
                            count > 0 ? cfg.bg : "bg-muted/30 border-border"
                          )}
                        >
                          <p
                            className={cn(
                              "text-lg font-bold",
                              count > 0 ? cfg.color : "text-muted-foreground/40"
                            )}
                          >
                            {count}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cfg.label}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </SummaryCard>

            <PublishStep
              recipient={recipient}
              gameTitle={gameTitle}
              onGameTitleChange={setGameTitle}
              canPublish={canPublish}
              missingFields={missingFields}
              onPublish={() => {}}
              onPreview={() => setShowPreview(true)}
              onBack={() => setStep(2)}
              backLabel="← Back to puzzles"
              theme={GUESS_BY_EMOJI_THEME}
              titlePlaceholder={`e.g. "Can you decode us?" for ${
                recipient.name || "them"
              }`}
            >
              <ToggleSetting
                icon={Lightbulb}
                label="Reveal answer after each guess"
                description="Show the correct answer whether they get it right or not"
                value={showAnswers}
                onChange={setShowAnswers}
              />
            </PublishStep>
          </>
        )}
      </div>
    </div>
  );
}
