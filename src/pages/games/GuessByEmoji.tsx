import { useState, useEffect, useRef, useCallback } from "react";
import { Lightbulb, ImageIcon, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mapGuessByEmojiContent, buildCreateGamePayload, buildPublishPayload, validateCreatePayload } from "@/lib/gameMappers";
import { appCache, CACHE_TTL } from "@/lib/cache";
import { gamesService } from "@/services/games";
import { aiService } from "@/services/ai";
import type { GameResponse, GameVisibility } from "@/types/games";
import type { SupportedLanguage } from "@/types/ai";
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
  STEP_LABELS,
  DIFFICULTY_CONFIG,
  createDefaultPuzzle,
} from "@/components/game/guess-by-emoji";
import type { DifficultyLevel, EmojiPuzzle } from "@/components/game/guess-by-emoji";

const DRAFT_KEY = "ge:draft";

export default function GuessByEmoji() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editGameId = searchParams.get("gameId");
  const isEditMode = editGameId !== null;

  const step = Number(searchParams.get("step") ?? "1");
  const setStep = (s: number): void =>
    setSearchParams(
      (prev) => { prev.set("step", String(s)); return prev; },
      { replace: true }
    );

  const [recipient, setRecipient] = useState<Recipient>({ name: "", occasion: "" });
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [puzzles, setPuzzles] = useState<EmojiPuzzle[]>([createDefaultPuzzle()]);
  const [gameTitle, setGameTitle] = useState<string>("");
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<Extract<GameVisibility, "private-link" | "public">>("private-link");
  const [originalVisibility, setOriginalVisibility] = useState<Extract<GameVisibility, "private-link" | "public">>("private-link");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [draftGameId, setDraftGameId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoadingPuzzleId, setAiLoadingPuzzleId] = useState<string | null>(null);
  const [aiLoadingHintId, setAiLoadingHintId] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState<boolean>(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wasPublished, setWasPublished] = useState<boolean>(false);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);

  const detectedLanguage: SupportedLanguage = /[А-ЯҚӨҮІҒҢҺа-яқөүіғңһ]/i.test(
    topic || recipient.name || recipient.occasion
  )
    ? /[ҚӨҮІҒҢҺ]/i.test(topic || recipient.name || recipient.occasion)
      ? "kz"
      : "ru"
    : "en";

  const languageRef = useRef<SupportedLanguage>(detectedLanguage);
  languageRef.current = detectedLanguage;

  useEffect(() => {
    if (!editGameId) return;
    let cancelled = false;

    const hydrateGame = (game: GameResponse) => {
      const c = game.content;
      if (c.recipient) setRecipient(c.recipient as Recipient);
      if (typeof c.personalMessage === "string") setPersonalMessage(c.personalMessage);
      if (typeof c.topic === "string") setTopic(c.topic);
      if (Array.isArray(c.puzzles)) {
        setPuzzles((c.puzzles as EmojiPuzzle[]).map((p) => ({
          ...p,
          id: p.id ?? Math.random().toString(36).slice(2),
        })));
      }
      const settings = c.settings as Record<string, unknown> | undefined;
      if (typeof settings?.showAnswers === "boolean") setShowAnswers(settings.showAnswers);
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

  
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.recipient) setRecipient(d.recipient);
      if (typeof d.personalMessage === "string") setPersonalMessage(d.personalMessage);
      if (typeof d.topic === "string") setTopic(d.topic);
      if (Array.isArray(d.puzzles)) setPuzzles(d.puzzles);
      if (typeof d.showAnswers === "boolean") setShowAnswers(d.showAnswers);
      if (typeof d.gameTitle === "string") setGameTitle(d.gameTitle);
      if (typeof d.draftGameId === "string") setDraftGameId(d.draftGameId);
      if (d.visibility === "private-link" || d.visibility === "public") setVisibility(d.visibility);
    } catch { /* corrupted — ignore */ }
  }, []);

  useEffect(() => () => {
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
  }, [coverPreviewUrl]);

  const updatePuzzle = useCallback((id: string, changes: Partial<EmojiPuzzle>): void => {
    setPuzzles((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }, []);

  const addPuzzle = (): void => {
    if (puzzles.length < 10) setPuzzles((p) => [...p, createDefaultPuzzle()]);
  };

  const removePuzzle = (id: string): void => {
    setPuzzles((p) => p.filter((p) => p.id !== id));
  };

  const handleAiGenerate = async (): Promise<void> => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await aiService.generateEmoji({
        topic: topic.trim() || `${recipient.name}, ${recipient.occasion}`,
        count: 5,
        language: languageRef.current,
      });
      const generated: EmojiPuzzle[] = response.puzzles.map((p) => ({
        id: Math.random().toString(36).slice(2),
        emojis: p.emojis,
        answer: p.answer,
        hint: p.hint ?? '',
        difficulty: 'medium' as DifficultyLevel,
      }));
      setPuzzles(generated);
    } catch {
      setAiError('AI сервис не отвечает, попробуйте позже');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiEmojis = useCallback(async (puzzleId: string, answer: string): Promise<void> => {
    if (!answer.trim()) return;
    setAiLoadingPuzzleId(puzzleId);
    try {
      const result = await aiService.generateEmojiHint({
        mode: 'emojis-from-answer',
        input: answer.trim(),
        language: languageRef.current,
      });
      const segments = [...new Intl.Segmenter().segment(result.result)].map((s) => s.segment);
      updatePuzzle(puzzleId, { emojis: segments });
    } catch {
      // silent — user can try again
    } finally {
      setAiLoadingPuzzleId(null);
    }
  }, [updatePuzzle]);

  const handleAiHint = useCallback(async (puzzleId: string, answer: string): Promise<void> => {
    if (!answer.trim()) return;
    setAiLoadingHintId(puzzleId);
    try {
      const result = await aiService.generateEmojiHint({
        mode: 'hint-from-answer',
        input: answer.trim(),
        language: languageRef.current,
      });
      updatePuzzle(puzzleId, { hint: result.result });
    } catch {
      // silent
    } finally {
      setAiLoadingHintId(null);
    }
  }, [updatePuzzle]);

  const completeness = {
    recipient: recipient.name.trim().length > 0,
    puzzles:
      puzzles.length > 0 &&
      puzzles.every((p) => p.emojis.length > 0 && p.answer.trim().length > 0),
    title: gameTitle.trim().length > 0,
  };
  const canPublish = Object.values(completeness).every(Boolean);

  const handlePreview = (): void => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      recipient, personalMessage, topic, puzzles, showAnswers, gameTitle, draftGameId, visibility,
    }));
    navigate("/create/guess-by-emoji/preview", {
      state: { puzzles, recipient, personalMessage },
    });
  };

  const handleSaveDraft = async (): Promise<void> => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const title =
      gameTitle.trim() ||
      (recipient.name ? `Угадай по эмодзи для ${recipient.name}` : "Моя игра");
    const content = mapGuessByEmojiContent({ recipient, personalMessage, puzzles, showAnswers });

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
          "guess-by-emoji",
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
      if (isEditMode && editGameId) {
        const updateResult = await gamesService.updateGame(editGameId, {
          title: gameTitle,
          content: mapGuessByEmojiContent({ recipient, personalMessage, puzzles, showAnswers }),
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
          "guess-by-emoji",
          { title: gameTitle, recipient, personalMessage },
          mapGuessByEmojiContent({ recipient, personalMessage, puzzles, showAnswers })
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

  const completedPuzzles = puzzles.filter(
    (p) => p.emojis.length > 0 && p.answer.trim()
  ).length;

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
        theme={GUESS_BY_EMOJI_THEME}
      />

      <div className="mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
        {step === 1 && (
          <RecipientStep
            recipient={recipient}
            onRecipientChange={setRecipient}
            personalMessage={personalMessage}
            onPersonalMessageChange={setPersonalMessage}
            onContinue={() => setStep(2)}
            heading="Who's playing? 😄"
            namePlaceholder="e.g. Alex, Dad, My Person…"
            messagePlaceholder="Write a fun intro your recipient sees before they start guessing…"
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

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium">
                Topic <span className="text-muted-foreground font-normal">(helps AI generate better puzzles)</span>
              </label>
              <Input
                placeholder={`e.g. "Our favourite movies with ${recipient.name || "them"}"`}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="md:text-sm"
              />
            </div>

            {recipient.name && (
              <AiBanner
                recipientName={recipient.name}
                theme={GUESS_BY_EMOJI_THEME}
                title={(name: string) =>
                  `AI can suggest emoji combos for ${name}`
                }
                subtitle="Generates 5 puzzles based on your topic — replaces current puzzles"
                onGenerate={handleAiGenerate}
                isLoading={isAiLoading}
                disabled={!recipient.name.trim() || !recipient.occasion.trim()}
                error={aiError}
                showCloseButton={false}
              />
            )}

            <div className="space-y-3 sm:space-y-4">
              {puzzles.map((puzzle, i) => (
                <PuzzleCard
                  key={puzzle.id}
                  puzzle={puzzle}
                  index={i}
                  onChange={updatePuzzle}
                  onRemove={removePuzzle}
                  totalPuzzles={puzzles.length}
                  onAiEmojis={handleAiEmojis}
                  isAiLoadingEmojis={aiLoadingPuzzleId === puzzle.id}
                  onAiHint={handleAiHint}
                  isAiLoadingHint={aiLoadingHintId === puzzle.id}
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
                { icon: "👤", label: "Recipient", value: recipient.name || "—" },
                { icon: "🎉", label: "Occasion", value: recipient.occasion || "—" },
                { icon: "😄", label: "Puzzles", value: `${puzzles.length} puzzles` },
              ]}
            >
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  Difficulty mix
                </p>
                <div className="flex gap-1.5 sm:gap-2">
                  {(["easy", "medium", "hard"] as DifficultyLevel[]).map((level) => {
                    const count = puzzles.filter((p) => p.difficulty === level).length;
                    const cfg = DIFFICULTY_CONFIG[level];
                    return (
                      <div
                        key={level}
                        className={cn(
                          "flex-1 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border text-center",
                          count > 0 ? cfg.bg : "bg-muted/30 border-border"
                        )}
                      >
                        <p className={cn(
                          "text-base sm:text-lg font-bold",
                          count > 0 ? cfg.color : "text-muted-foreground/40"
                        )}>
                          {count}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {cfg.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SummaryCard>

            <PublishStep
              recipient={recipient}
              gameTitle={gameTitle}
              onGameTitleChange={setGameTitle}
              visibility={visibility}
              onVisibilityChange={setVisibility}
              isPublishing={isPublishing}
              gameId={editGameId ?? undefined}
              titlePlaceholder={`e.g. "Can you decode us?" for ${recipient.name || "them"}`}
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
                icon={Lightbulb}
                label="Allow answer reveal after a miss"
                description="Adds an optional reveal button after a wrong guess instead of showing the answer immediately"
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
