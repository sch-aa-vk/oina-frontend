import { useState, useEffect } from "react";
import { Shuffle, ImageIcon, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mapChooseMeContent, buildCreateGamePayload, buildPublishPayload, validateCreatePayload } from "@/lib/gameMappers";
import { gamesService } from "@/services/games";
import { aiService } from "@/services/ai";
import type { GameVisibility } from "@/types/games";
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

const DEFAULT_OPTION_EMOJIS = ['❤️', '🌟', '🔥', '💫'];

export default function ChooseMe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editGameId = searchParams.get("gameId");
  const isEditMode = editGameId !== null;

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
  const [visibility, setVisibility] = useState<Extract<GameVisibility, "private-link" | "public">>("private-link");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [draftGameId, setDraftGameId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState<boolean>(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wasPublished, setWasPublished] = useState<boolean>(false);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);

  useEffect(() => {
    if (!editGameId) return;
    let cancelled = false;
    setIsLoadingGame(true);
    gamesService.getGame(editGameId)
      .then((game) => {
        if (cancelled) return;
        const c = game.content;
        if (c.recipient) setRecipient(c.recipient as Recipient);
        if (typeof c.personalMessage === "string") setPersonalMessage(c.personalMessage);
        if (Array.isArray(c.questions)) setQuestions(c.questions as ReturnType<typeof createDefaultQuestion>[]);
        const settings = c.settings as Record<string, unknown> | undefined;
        if (typeof settings?.shuffle === "boolean") setShuffle(settings.shuffle);
        setGameTitle(game.title);
        if (game.visibility === "private-link" || game.visibility === "public") {
          setVisibility(game.visibility);
          setWasPublished(true);
        }
        if (game.thumbnail) setExistingThumbnail(game.thumbnail);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Failed to load game. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingGame(false);
      });
    return () => { cancelled = true; };
  }, [editGameId]);

  useEffect(() => () => {
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
  }, [coverPreviewUrl]);

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

  const handleAiGenerate = async (): Promise<void> => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await aiService.generateQuestions({
        topic: `${recipient.name}, ${recipient.occasion}`,
        count: 5,
        language: 'ru',
      });
      const generated = response.questions.map((q) => ({
        question: q.question,
        options: q.options.map((text, i): GameOption => ({
          text,
          emoji: DEFAULT_OPTION_EMOJIS[i % DEFAULT_OPTION_EMOJIS.length],
          isCorrect: i === q.correctIndex,
        })),
      }));
      setQuestions(generated);
    } catch {
      setAiError('AI сервис не отвечает, попробуйте позже');
    } finally {
      setIsAiLoading(false);
    }
  };

  const completeness = {
    recipient: recipient.name.trim().length > 0,
    questions: questions.every(
      (q) => q.question.trim() && q.options.some((o) => o.text.trim())
    ),
    title: gameTitle.trim().length > 0,
  };
  const canPublish = Object.values(completeness).every(Boolean);

  const handlePublish = async (): Promise<void> => {
    if (isPublishing || !canPublish) {
      return;
    }

    setIsPublishing(true);

    try {
      if (isEditMode && editGameId) {
        const updateResult = await gamesService.updateGame(editGameId, {
          title: gameTitle,
          content: mapChooseMeContent({ recipient, personalMessage, questions, shuffle }),
          coverImageContentType: coverFile ? coverFile.type : undefined,
        });
        if (coverFile && updateResult.coverUploadUrl) {
          await gamesService.uploadGameCover(updateResult.coverUploadUrl, coverFile);
        }
        const published = await gamesService.publishGame(editGameId, buildPublishPayload(visibility));
        navigate(`/games/${published.gameId}`);
        return;
      }

      let gameIdForPublish = draftGameId;

      if (!gameIdForPublish) {
        const payload = buildCreateGamePayload(
          "choose-me",
          { title: gameTitle, recipient, personalMessage },
          mapChooseMeContent({ recipient, personalMessage, questions, shuffle })
        );

        const validationErrors = validateCreatePayload(payload);
        if (validationErrors.length > 0) return;

        const draft = await gamesService.createGame({
          ...payload,
          coverImageContentType: coverFile ? coverFile.type : undefined,
        });
        gameIdForPublish = draft.gameId;
        setDraftGameId(gameIdForPublish);

        if (coverFile && draft.coverUploadUrl) {
          await gamesService.uploadGameCover(draft.coverUploadUrl, coverFile);
        }
      } else if (coverFile) {
        const updated = await gamesService.updateGame(gameIdForPublish, {
          coverImageContentType: coverFile.type,
        });
        if (updated.coverUploadUrl) {
          await gamesService.uploadGameCover(updated.coverUploadUrl, coverFile);
        }
      }

      const published = await gamesService.publishGame(
        gameIdForPublish,
        buildPublishPayload(visibility)
      );
      navigate(`/games/${published.gameId}`);
    } catch {
      // silent — user can retry
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoadingGame) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading game…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-destructive text-sm">{loadError}</p>
      </div>
    );
  }

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
        onPublish={handlePublish}
        isPublishing={isPublishing}
        isPublished={wasPublished}
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
                onGenerate={handleAiGenerate}
                isLoading={isAiLoading}
                disabled={!recipient.name.trim() || !recipient.occasion.trim()}
                error={aiError}
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
              visibility={visibility}
              onVisibilityChange={setVisibility}
              isPublishing={isPublishing}
              titlePlaceholder={`e.g. "How well do you know me?" for ${
                recipient.name || "them"
              }`}
            >
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Cover image <span className="text-muted-foreground font-normal">(optional)</span></label>
                {coverPreviewUrl ? (
                  <div className="relative rounded-xl overflow-hidden h-32">
                    <img src={coverPreviewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setCoverFile(null); setCoverPreviewUrl(null); }}
                      className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : existingThumbnail ? (
                  <div className="relative rounded-xl overflow-hidden h-32">
                    <img src={existingThumbnail} alt="Cover" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs font-medium">Change cover</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setCoverFile(file);
                          setCoverPreviewUrl(URL.createObjectURL(file));
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
                    <ImageIcon className="size-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Click to upload</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setCoverFile(file);
                        setCoverPreviewUrl(URL.createObjectURL(file));
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
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
