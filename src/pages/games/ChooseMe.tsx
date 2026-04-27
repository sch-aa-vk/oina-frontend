import { useState, useEffect, useRef } from "react";
import { Shuffle, ImageIcon, X, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mapChooseMeContent, buildCreateGamePayload, buildPublishPayload, validateCreatePayload } from "@/lib/gameMappers";
import { appCache, CACHE_TTL } from "@/lib/cache";
import { gamesService } from "@/services/games";
import { aiService } from "@/services/ai";
import type { GameResponse, GameVisibility } from "@/types/games";
import { compressImage } from "@/utils/imageUtils";
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
  STEP_LABELS,
  createDefaultQuestion,
  createDefaultOutcome,
} from "@/components/game/choose-me";
import type { GameOption, QuestionField, GameOutcome } from "@/components/game/choose-me";

const DEFAULT_OPTION_EMOJIS = ['❤️', '🌟', '🔥', '💫'];
export default function ChooseMe() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editGameId, setEditGameId] = useState<string | null>(searchParams.get("gameId"));
  const isEditMode = editGameId !== null;

  const step = Number(searchParams.get("step") ?? "1");
  const setStep = (s: number): void =>
    setSearchParams(
      (prev) => { prev.set("step", String(s)); return prev; },
      { replace: true }
    );
  const [recipient, setRecipient] = useState<Recipient>({
    name: "",
    occasion: "",
  });
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [outcomes, setOutcomes] = useState<GameOutcome[]>(() => [
    createDefaultOutcome(0),
    createDefaultOutcome(1),
  ]);
  const [questions, setQuestions] = useState(() => [createDefaultQuestion()]);
  const [gameTitle, setGameTitle] = useState<string>("");
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<Extract<GameVisibility, "private-link" | "public">>("private-link");
  const [originalVisibility, setOriginalVisibility] = useState<Extract<GameVisibility, "private-link" | "public">>("private-link");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [draftGameId, setDraftGameId] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiOutcomesLoading, setIsAiOutcomesLoading] = useState<boolean>(false);
  const [aiOutcomesError, setAiOutcomesError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState<boolean>(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wasPublished, setWasPublished] = useState<boolean>(false);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);
  const navigatingToPreview = useRef(false);

  useEffect(() => {
    if (!editGameId) return;
    let cancelled = false;

    const hydrateGame = (game: GameResponse) => {
      const c = game.content;
      if (c.recipient) setRecipient(c.recipient as Recipient);
      if (typeof c.personalMessage === "string") setPersonalMessage(c.personalMessage);
      if (typeof c.topic === "string") setTopic(c.topic);
      if (Array.isArray(c.outcomes)) setOutcomes(c.outcomes as GameOutcome[]);
      if (Array.isArray(c.questions)) setQuestions(c.questions as ReturnType<typeof createDefaultQuestion>[]);
      const settings = c.settings as Record<string, unknown> | undefined;
      if (typeof settings?.shuffle === "boolean") setShuffle(settings.shuffle);
      setGameTitle(game.title);
      if (game.visibility === "private-link" || game.visibility === "public") {
        setVisibility(game.visibility);
        setOriginalVisibility(game.visibility);
        setWasPublished(true);
      }
      if (game.thumbnail) setExistingThumbnail(game.thumbnail);
    };

    const cached = appCache.get<GameResponse>(`game-${editGameId}`, CACHE_TTL.PERSONAL);
    if (cached) {
      hydrateGame(cached);
      setIsLoadingGame(false);
      return;
    }

    setIsLoadingGame(true);
    gamesService.getGame(editGameId)
      .then((game) => {
        if (cancelled) return;
        appCache.set(`game-${editGameId}`, game);
        hydrateGame(game);
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cm:draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.recipient) setRecipient(d.recipient);
      if (typeof d.personalMessage === "string") setPersonalMessage(d.personalMessage);
      if (typeof d.topic === "string") setTopic(d.topic);
      if (Array.isArray(d.outcomes)) setOutcomes(d.outcomes);
      if (Array.isArray(d.questions)) setQuestions(d.questions);
      if (typeof d.shuffle === "boolean") setShuffle(d.shuffle);
      if (typeof d.gameTitle === "string") setGameTitle(d.gameTitle);
      if (typeof d.draftGameId === "string") setDraftGameId(d.draftGameId);
      if (d.visibility === "private-link" || d.visibility === "public") setVisibility(d.visibility);
    } catch { /* corrupted — ignore */ }
  }, []);

  useEffect(() => () => {
    if (!navigatingToPreview.current) localStorage.removeItem("cw:draft");
  }, []);

  const handlePreview = (): void => {
    navigatingToPreview.current = true;
    localStorage.setItem("cm:draft", JSON.stringify({
      recipient, personalMessage, topic, outcomes, questions, shuffle, gameTitle, draftGameId, visibility,
    }));
    navigate("/create/choose-me/preview", {
      state: { questions, outcomes, recipient, personalMessage, shuffle },
    });
  };

  const addOutcome = (): void => {
    setOutcomes((prev) => [...prev, createDefaultOutcome(prev.length)]);
  };
  const updateOutcome = (i: number, field: keyof GameOutcome, value: string): void => {
    setOutcomes((prev) => prev.map((o, idx) => idx === i ? { ...o, [field]: value } : o));
  };
  const removeOutcome = (i: number): void => {
    const removed = outcomes[i];
    setOutcomes((prev) => prev.filter((_, idx) => idx !== i));
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        options: q.options.map((opt) =>
          opt.outcomeId === removed.id ? { ...opt, outcomeId: "" } : opt
        ),
      }))
    );
  };

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

  const handleAiGenerateOutcomes = async (): Promise<void> => {
    setIsAiOutcomesLoading(true);
    setAiOutcomesError(null);
    try {
      const response = await aiService.generateOutcomes({
        topic: topic.trim() || `${recipient.name}, ${recipient.occasion}`,
        count: 4,
        language: 'ru',
      });
      setOutcomes(
        response.outcomes.map((o, i) => ({
          id: `outcome_${i}`,
          title: o.title,
          emoji: "",
        }))
      );
    } catch {
      setAiOutcomesError('AI сервис не отвечает, попробуйте позже');
    } finally {
      setIsAiOutcomesLoading(false);
    }
  };

  const handleAiGenerate = async (): Promise<void> => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const filledOutcomes = outcomes.filter((o) => o.title.trim());
      if (filledOutcomes.length < 2) {
        setAiError('Add at least 2 outcomes with titles before generating');
        return;
      }
      const response = await aiService.generateQuestions({
        topic: topic.trim() || `${recipient.name}, ${recipient.occasion}`,
        outcomes: filledOutcomes.map((o) => ({ id: o.id, title: o.title })),
        count: 5,
        language: 'ru',
      });
      const generated = response.questions.map((q) => ({
        question: q.question,
        options: q.options.map((opt, i): GameOption => ({
          text: opt.text,
          emoji: DEFAULT_OPTION_EMOJIS[i % DEFAULT_OPTION_EMOJIS.length],
          outcomeId: opt.outcomeId,
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
    outcomes: outcomes.length >= 2 && outcomes.every((o) => o.title.trim().length > 0),
    questions: questions.every(
      (q) =>
        q.question.trim() &&
        q.options.some((o) => o.text.trim()) &&
        q.options.filter((o) => o.text.trim()).every((o) => o.outcomeId !== "")
    ),
    title: gameTitle.trim().length > 0,
  };
  const canPublish = Object.values(completeness).every(Boolean);

  const handleSaveDraft = async (): Promise<void> => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const title =
      gameTitle.trim() ||
      (recipient.name ? `Choose Me for ${recipient.name}` : "My Choose Me");
    const content = mapChooseMeContent({ recipient, personalMessage, topic, outcomes, questions, shuffle });

    try {
      if (isEditMode && editGameId) {
        const updateResult = await gamesService.updateGame(editGameId, {
          title,
          content,
          coverImageContentType: coverFile ? coverFile.type : undefined,
        });
        if (coverFile && updateResult.coverUploadUrl) {
          await gamesService.uploadGameCover(updateResult.coverUploadUrl, coverFile);
        }
        if (wasPublished && visibility !== originalVisibility) {
          await gamesService.publishGame(editGameId, buildPublishPayload(visibility));
        }
        appCache.set(`game-${editGameId}`, updateResult);
      } else if (draftGameId) {
        const updateResult = await gamesService.updateGame(draftGameId, {
          title,
          content,
          coverImageContentType: coverFile ? coverFile.type : undefined,
        });
        if (coverFile && updateResult.coverUploadUrl) {
          await gamesService.uploadGameCover(updateResult.coverUploadUrl, coverFile);
        }
      } else {
        const payload = buildCreateGamePayload(
          "choose-me",
          { title, recipient, personalMessage },
          content
        );
        const draft = await gamesService.createGame({
          ...payload,
          coverImageContentType: coverFile ? coverFile.type : undefined,
        });
        setDraftGameId(draft.gameId);
        if (coverFile && draft.coverUploadUrl) {
          await gamesService.uploadGameCover(draft.coverUploadUrl, coverFile);
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      // silent — user can retry
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (): Promise<void> => {
    if (isPublishing || !canPublish) return;

    setIsPublishing(true);

    try {
      const content = mapChooseMeContent({ recipient, personalMessage, topic, outcomes, questions, shuffle });

      if (isEditMode && editGameId) {
        const updateResult = await gamesService.updateGame(editGameId, {
          title: gameTitle,
          content,
          coverImageContentType: coverFile ? coverFile.type : undefined,
        });
        if (coverFile && updateResult.coverUploadUrl) {
          await gamesService.uploadGameCover(updateResult.coverUploadUrl, coverFile);
        }
        const response = await gamesService.publishGame(editGameId, buildPublishPayload(visibility));
        setWasPublished(true);
        setEditGameId(response.gameId);
        return;
      }

      let gameIdForPublish = draftGameId;

      if (!gameIdForPublish) {
        const payload = buildCreateGamePayload(
          "choose-me",
          { title: gameTitle, recipient, personalMessage },
          content
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

      const response = await gamesService.publishGame(
        gameIdForPublish,
        buildPublishPayload(visibility)
      );
      setWasPublished(true);
      setEditGameId(response.gameId);
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
      <GameTopBar
        step={step}
        onStepChange={setStep}
        stepLabels={STEP_LABELS}
        onPreview={handlePreview}
        canPublish={canPublish}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        onSave={handleSaveDraft}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        isPublished={wasPublished}
        theme={CHOOSE_ME_THEME}
      />

      <div className="mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
        {step === 1 && (
          <RecipientStep
            recipient={recipient}
            onRecipientChange={setRecipient}
            personalMessage={personalMessage}
            onPersonalMessageChange={setPersonalMessage}
            onContinue={() => setStep(2)}
            heading="Who is this game for? 🎁"
            namePlaceholder="e.g. Sarah, Mom, Best Friend…"
            messagePlaceholder="Write a sweet intro message that your recipient will see before playing…"
            continueLabel="Continue to outcomes →"
          />
        )}

        {step === 2 && (
          <>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Build your game 🎭
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Define outcomes, then create questions that lead to them.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium">
                Topic <span className="text-muted-foreground font-normal">(helps AI generate better content)</span>
              </label>
              <Input
                placeholder={`e.g. "Perfect date night for ${recipient.name || "them"}"`}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="md:text-sm"
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-semibold">Outcomes</h2>
              <p className="text-muted-foreground text-xs sm:text-sm -mt-1">
                Add at least 2 possible results. Each answer option will secretly lead to one.
              </p>

              <AiBanner
                recipientName={recipient.name}
                theme={CHOOSE_ME_THEME}
                title={(name: string) => `AI can suggest outcomes${name ? ` for ${name}` : ""}`}
                subtitle="Based on the topic, we'll generate result options to choose from"
                onGenerate={handleAiGenerateOutcomes}
                isLoading={isAiOutcomesLoading}
                disabled={!topic.trim() && (!recipient.name.trim() || !recipient.occasion.trim())}
                error={aiOutcomesError}
                showCloseButton={false}
              />

              <div className="space-y-2">
                {outcomes.map((outcome, i) => (
                  <div
                    key={outcome.id}
                    className="rounded-2xl border border-border bg-background p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <Input
                        placeholder="Outcome title (e.g. Romantic dinner)"
                        value={outcome.title}
                        onChange={(e) => updateOutcome(i, "title", e.target.value)}
                        className="flex-1 md:text-sm font-medium"
                      />
                      {outcomes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOutcome(i)}
                          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <AddItemButton label="Add another outcome" onClick={addOutcome} />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">Questions</h2>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                    Create questions and link each answer to one of your outcomes.
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] sm:text-xs">
                  {questions.length}/10
                </Badge>
              </div>

              <AiBanner
                key="questions-banner"
                recipientName={recipient.name}
                theme={CHOOSE_ME_THEME}
                title={(name: string) => `AI can craft personalized questions${name ? ` for ${name}` : ""}`}
                subtitle="We'll generate questions and answers based on your outcomes"
                onGenerate={handleAiGenerate}
                isLoading={isAiLoading}
                disabled={outcomes.length < 2 || outcomes.some((o) => !o.title.trim())}
                error={aiError}
                showCloseButton={false}
              />

              <div className="space-y-3 sm:space-y-4">
                {questions.map((q, i) => (
                  <QuestionBlock
                    key={i}
                    question={q}
                    qIndex={i}
                    outcomes={outcomes}
                    onChange={updateQuestion}
                    onRemove={removeQuestion}
                    totalQuestions={questions.length}
                  />
                ))}
              </div>

              {questions.length < 10 && (
                <AddItemButton label="Add another question" onClick={addQuestion} />
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-10 sm:h-11 px-5 rounded-xl order-2 sm:order-1"
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={
                  outcomes.length < 2 ||
                  outcomes.some((o) => !o.title.trim()) ||
                  questions.length === 0
                }
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
                  icon: "🎭",
                  label: "Outcomes",
                  value: `${outcomes.length} outcomes`,
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
              gameId={editGameId ?? undefined}
              titlePlaceholder={`e.g. "Which date spot fits you?" for ${
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
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const compressed = await compressImage(file);
                          setCoverFile(compressed);
                          setCoverPreviewUrl(URL.createObjectURL(compressed));
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
