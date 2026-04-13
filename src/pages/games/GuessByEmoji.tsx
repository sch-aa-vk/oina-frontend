import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mapGuessByEmojiContent, buildCreateGamePayload, buildPublishPayload, validateCreatePayload } from "@/lib/gameMappers";
import { gamesService } from "@/services/games";
import type { GameVisibility } from "@/types/games";
import {
  GameTopBar,
  RecipientStep,
  AiBanner,
  AddItemButton,
  SummaryCard,
  ToggleSetting,
  PublishStep,
  GUESS_BY_EMOJI_THEME,
} from "@/components/game";
import type { Recipient } from "@/components/game";
import {
  PuzzleCard,
  PreviewModal,
  STEP_LABELS,
  DIFFICULTY_CONFIG,
  createDefaultPuzzle,
} from "@/components/game/guess-by-emoji";
import type { DifficultyLevel, EmojiPuzzle } from "@/components/game/guess-by-emoji";

export default function GuessByEmoji() {
  const navigate = useNavigate();
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
  const [visibility, setVisibility] = useState<Extract<GameVisibility, "private-link" | "public">>("private-link");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [draftGameId, setDraftGameId] = useState<string | null>(null);

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

  const handlePublish = async (): Promise<void> => {
    if (isPublishing || !canPublish) {
      return;
    }

    setSubmitError("");
    setIsPublishing(true);
    let gameIdForPublish = draftGameId;

    try {
      if (!gameIdForPublish) {
        const payload = buildCreateGamePayload(
          "guess-by-emoji",
          {
            title: gameTitle,
            recipient,
            personalMessage,
          },
          mapGuessByEmojiContent({
            recipient,
            personalMessage,
            puzzles,
            showAnswers,
          })
        );

        const validationErrors = validateCreatePayload(payload);
        if (validationErrors.length > 0) {
          setSubmitError(validationErrors[0]);
          return;
        }

        const draft = await gamesService.createGame(payload);
        gameIdForPublish = draft.gameId;
        setDraftGameId(gameIdForPublish);
      }

      const published = await gamesService.publishGame(
        gameIdForPublish,
        buildPublishPayload(visibility)
      );
      navigate(`/games/${published.gameId}`);
    } catch (error) {
      const apiError = gamesService.mapError(error);
      if (gameIdForPublish) {
        setSubmitError(
          `Draft was created, but publish failed. ${apiError.message} You can retry publishing.`
        );
      } else {
        setSubmitError(apiError.message);
      }
    } finally {
      setIsPublishing(false);
    }
  };

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
        onPublish={handlePublish}
        isPublishing={isPublishing}
        theme={GUESS_BY_EMOJI_THEME}
      />

      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
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
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Build your puzzles 😄
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Create emoji sequences your recipient has to decode. Each
                  puzzle needs emojis and an answer.
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 mt-1 text-[10px] sm:text-xs">
                {completedPuzzles}/{puzzles.length}
              </Badge>
            </div>

            {recipient.name && (
              <AiBanner
                recipientName={recipient.name}
                theme={GUESS_BY_EMOJI_THEME}
                title={(name: string) =>
                  `AI can suggest emoji combos for ${name}`
                }
                subtitle="Describe a memory or word and we'll pick the perfect emojis"
              />
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: "😄🎂🎉", label: "Add emojis" },
                { icon: "💡", label: "Set the answer" },
                { icon: "🎯", label: "Pick difficulty" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl sm:rounded-2xl bg-background border border-border p-2 sm:p-3 text-center space-y-0.5 sm:space-y-1.5"
                >
                  <p className="text-lg sm:text-2xl">{item.icon}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-snug">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 sm:space-y-4">
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
                  icon: "😄",
                  label: "Puzzles",
                  value: `${puzzles.length} puzzles`,
                },
              ]}
            >
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  Difficulty mix
                </p>
                <div className="flex gap-1.5 sm:gap-2">
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
                            "flex-1 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border text-center",
                            count > 0 ? cfg.bg : "bg-muted/30 border-border"
                          )}
                        >
                          <p
                            className={cn(
                              "text-base sm:text-lg font-bold",
                              count > 0 ? cfg.color : "text-muted-foreground/40"
                            )}
                          >
                            {count}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
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
              visibility={visibility}
              onVisibilityChange={setVisibility}
              canPublish={canPublish}
              isPublishing={isPublishing}
              submitError={submitError}
              missingFields={missingFields}
              onPublish={handlePublish}
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
