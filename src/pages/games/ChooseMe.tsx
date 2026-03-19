import { useState } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  GripVertical,
  Check,
  Shuffle,
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
  CHOOSE_ME_THEME,
} from "@/components/game";
import type { Recipient } from "@/components/game";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GameOption {
  text: string;
  emoji: string;
  isCorrect: boolean;
}

type OptionField = keyof GameOption;

interface Question {
  question: string;
  options: GameOption[];
}

type QuestionField = keyof Question;

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJI_SET: string[] = [
  "❤️",
  "🎉",
  "🌟",
  "🔥",
  "🎯",
  "💫",
  "🥰",
  "😄",
  "👑",
  "🌈",
  "🎊",
  "💝",
  "🦋",
  "🌸",
  "✨",
  "🎁",
  "🏆",
  "💎",
  "🌙",
  "⚡",
];

const STEP_LABELS: [string, string, string] = [
  "Recipient",
  "Questions",
  "Publish",
];

const createDefaultQuestion = (): Question => ({
  question: "",
  options: [
    { text: "", emoji: "❤️", isCorrect: true },
    { text: "", emoji: "🌟", isCorrect: false },
    { text: "", emoji: "🔥", isCorrect: false },
  ],
});

// ─── EmojiPicker ─────────────────────────────────────────────────────────────

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 text-xl rounded-xl border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center"
      >
        {selected || "😊"}
      </button>
      {open && (
        <div className="absolute z-50 top-12 left-0 bg-popover border border-border rounded-2xl p-2 shadow-xl grid grid-cols-5 gap-1 w-48">
          {EMOJI_SET.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onSelect(e);
                setOpen(false);
              }}
              className={cn(
                "w-8 h-8 text-lg rounded-lg hover:bg-muted flex items-center justify-center transition-colors",
                selected === e && "bg-muted ring-1 ring-primary"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OptionCard ───────────────────────────────────────────────────────────────

interface OptionCardProps {
  option: GameOption;
  index: number;
  onChange: (
    index: number,
    field: OptionField,
    value: string | boolean
  ) => void;
  onRemove: (index: number) => void;
  isOnly: boolean;
}

function OptionCard({
  option,
  index,
  onChange,
  onRemove,
  isOnly,
}: OptionCardProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 rounded-2xl border bg-card transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        option.isCorrect &&
          "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
      )}
    >
      <div className="mt-2.5 text-muted-foreground/40 cursor-grab group-hover:text-muted-foreground/70 transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>
      <EmojiPicker
        selected={option.emoji}
        onSelect={(emoji) => onChange(index, "emoji", emoji)}
      />
      <div className="flex-1 space-y-2">
        <Input
          placeholder={`Option ${index + 1}…`}
          value={option.text}
          onChange={(e) => onChange(index, "text", e.target.value)}
          className="border-0 bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 h-auto py-1"
        />
        {option.isCorrect && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Marked as the right answer
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 mt-1.5">
        <button
          type="button"
          title="Mark as correct answer"
          onClick={() => onChange(index, "isCorrect", !option.isCorrect)}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
            option.isCorrect
              ? "bg-emerald-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-950"
          )}
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        {!isOnly && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── QuestionBlock ────────────────────────────────────────────────────────────

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

function QuestionBlock({
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
    <div className="rounded-3xl border border-border bg-background p-6 space-y-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
            {qIndex + 1}
          </span>
          <Input
            placeholder="Type your question here…"
            value={question.question}
            onChange={(e) => onChange(qIndex, "question", e.target.value)}
            className="border-0 bg-transparent px-0 text-base font-semibold placeholder:text-muted-foreground/40 focus-visible:ring-0 h-auto py-0"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI help
          </Button>
          {totalQuestions > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/50 hover:text-destructive"
              onClick={() => onRemove(qIndex)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2.5 pl-11">
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
            className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-border text-muted-foreground text-sm hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add option
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PreviewModal ─────────────────────────────────────────────────────────────

interface PreviewModalProps {
  questions: Question[];
  recipient: Recipient;
  personalMessage: string;
  onClose: () => void;
}

function PreviewModal({
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
      onClose={onClose}
    >
      <div className="px-6 py-5">
        <p className="text-base font-semibold mb-4">
          {q?.question || "Your question here"}
        </p>
        <div className="space-y-2.5">
          {q?.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200",
                selected === null &&
                  "hover:border-primary/50 hover:bg-primary/5",
                selected === i &&
                  opt.isCorrect &&
                  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                selected === i &&
                  !opt.isCorrect &&
                  "border-red-400 bg-red-50 dark:bg-red-950/40",
                selected !== null && selected !== i && "opacity-50"
              )}
            >
              <span className="text-xl">{opt.emoji || "✨"}</span>
              <span className="text-sm font-medium">
                {opt.text || `Option ${i + 1}`}
              </span>
              {selected === i && (
                <span className="ml-auto text-xs">
                  {opt.isCorrect ? "✅" : "❌"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </PreviewModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChooseMe() {
  const [step, setStep] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<Recipient>({
    name: "",
    occasion: "",
  });
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([
    createDefaultQuestion(),
  ]);
  const [gameTitle, setGameTitle] = useState<string>("");
  const [shuffle, setShuffle] = useState<boolean>(false);

  const updateQuestion = (
    qIndex: number,
    field: QuestionField,
    value: string | GameOption[]
  ): void => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, [field]: value } : q))
    );
  };
  const addQuestion = (): void => {
    if (questions.length < 10)
      setQuestions((p) => [...p, createDefaultQuestion()]);
  };
  const removeQuestion = (i: number): void => {
    setQuestions((p) => p.filter((_, idx) => idx !== i));
  };

  const completeness = {
    recipient: recipient.name.trim().length > 0,
    questions: questions.every(
      (q) => q.question.trim() && q.options.some((o) => o.text.trim())
    ),
    title: gameTitle.trim().length > 0,
  };
  const canPublish = Object.values(completeness).every(Boolean);
  const missingFields = [
    !completeness.recipient && "recipient name",
    !completeness.questions && "question text",
    !completeness.title && "game title",
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-muted/30">
      {showPreview && (
        <PreviewModal
          questions={questions}
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
        theme={CHOOSE_ME_THEME}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {step === 1 && (
          <RecipientStep
            recipient={recipient}
            onRecipientChange={setRecipient}
            personalMessage={personalMessage}
            onPersonalMessageChange={setPersonalMessage}
            onContinue={() => setStep(2)}
            theme={CHOOSE_ME_THEME}
            heading="Who is this game for? 🎁"
            namePlaceholder="e.g. Sarah, Mom, Best Friend…"
            messagePlaceholder="Write a sweet intro message that your recipient will see before playing…"
            aiTeaserTitle="AI-powered personalization — coming next step"
            aiTeaserBody="Once you fill in the recipient details, our AI will suggest tailored questions, emojis, and messages that feel genuinely personal."
            continueLabel="Continue to questions →"
          />
        )}

        {step === 2 && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  Build your questions 🎯
                </h1>
                <p className="text-muted-foreground text-sm">
                  Create multiple-choice questions. Mark the correct answer so
                  your recipient gets feedback.
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 mt-1">
                {questions.length}/10
              </Badge>
            </div>

            {recipient.name && (
              <AiBanner
                recipientName={recipient.name}
                theme={CHOOSE_ME_THEME}
                title={(name) =>
                  `AI can craft personalized questions for ${name}`
                }
                subtitle="Tell us about them and we'll generate fun, meaningful options"
              />
            )}

            <div className="space-y-4">
              {questions.map((q, i) => (
                <QuestionBlock
                  key={i}
                  question={q}
                  qIndex={i}
                  onChange={updateQuestion}
                  onRemove={removeQuestion}
                  totalQuestions={questions.length}
                />
              ))}
            </div>

            {questions.length < 10 && (
              <AddItemButton
                label="Add another question"
                onClick={addQuestion}
              />
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
                  icon: "❓",
                  label: "Questions",
                  value: `${questions.length} questions`,
                },
              ]}
            />
            <PublishStep
              recipient={recipient}
              gameTitle={gameTitle}
              onGameTitleChange={setGameTitle}
              canPublish={canPublish}
              missingFields={missingFields}
              onPublish={() => {}}
              onPreview={() => setShowPreview(true)}
              onBack={() => setStep(2)}
              backLabel="← Back to questions"
              theme={CHOOSE_ME_THEME}
              titlePlaceholder={`e.g. "How well do you know me?" for ${
                recipient.name || "them"
              }`}
            >
              <ToggleSetting
                icon={Shuffle}
                label="Shuffle options"
                description="Randomize option order each time"
                value={shuffle}
                onChange={setShuffle}
              />
            </PublishStep>
          </>
        )}
      </div>
    </div>
  );
}
