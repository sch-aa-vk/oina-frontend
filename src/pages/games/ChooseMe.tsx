import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GameTopBar,
  RecipientStep,
  AiBanner,
  AddItemButton,
  SummaryCard,
  ToggleSetting,
  PublishStep,
  CHOOSE_ME_THEME,
} from "@/components/game";
import type { Recipient } from "@/components/game";
import {
  QuestionBlock,
  PreviewModal,
  STEP_LABELS,
  createDefaultQuestion,
} from "@/components/game/choose-me";
import type { GameOption, QuestionField } from "@/components/game/choose-me";

export default function ChooseMe() {
  const [step, setStep] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<Recipient>({
    name: "",
    occasion: "",
  });
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [questions, setQuestions] = useState(() => [createDefaultQuestion()]);
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

      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
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
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Build your questions 🎯
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Create multiple-choice questions. Mark the correct answer so
                  your recipient gets feedback.
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 mt-1 text-[10px] sm:text-xs"
              >
                {questions.length}/10
              </Badge>
            </div>

            {recipient.name && (
              <AiBanner
                recipientName={recipient.name}
                theme={CHOOSE_ME_THEME}
                title={(name: string) =>
                  `AI can craft personalized questions for ${name}`
                }
                subtitle="Tell us about them and we'll generate fun, meaningful options"
              />
            )}

            <div className="space-y-3 sm:space-y-4">
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

            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-10 sm:h-11 px-5 rounded-xl order-2 sm:order-1"
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="h-10 sm:h-11 px-6 rounded-xl order-1 sm:order-2"
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
