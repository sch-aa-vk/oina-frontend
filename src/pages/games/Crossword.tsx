import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  RefreshCw,
  Grid3X3,
  AlertCircle,
  ImageIcon,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  mapCrosswordContent,
  buildCreateGamePayload,
  buildPublishPayload,
} from "@/lib/gameMappers";
import { appCache, CACHE_TTL } from "@/lib/cache";
import { gamesService } from "@/services/games";
import { aiService } from "@/services/ai";
import type { GameResponse, GameVisibility } from "@/types/games";
import type { SupportedLanguage } from "@/types/ai";
import { compressImage } from "@/utils/imageUtils";
import {
  GameTopBar,
  RecipientStep,
  AiBanner,
  AddItemButton,
  SummaryCard,
  PublishStep,
  CROSSWORD_THEME,
} from "@/components/game";
import type { Recipient } from "@/components/game";
import {
  buildCrosswordGrid,
  GridPreview,
  ClueList,
  WordRow,
  MobileGridPanel,
  STEP_LABELS,
  MAX_WORDS,
  MIN_WORDS,
  createDefaultWord,
} from "@/components/game/crossword";
import type { CrosswordGrid, CrosswordWord } from "@/components/game/crossword";

export default function Crossword() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editGameId, setEditGameId] = useState<string | null>(searchParams.get("gameId"));
  const isEditMode = editGameId !== null;

  const [step, setStep] = useState<number>(() => {
    const s = Number(searchParams.get("step"));
    return s >= 1 && s <= 3 ? s : 1;
  });

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("step", String(step));
        return next;
      },
      { replace: true },
    );
  }, [step, setSearchParams]);
  const [recipient, setRecipient] = useState<Recipient>({
    name: "",
    occasion: "",
  });
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [words, setWords] = useState<CrosswordWord[]>([
    createDefaultWord(),
    createDefaultWord(),
    createDefaultWord(),
  ]);
  const [grid, setGrid] = useState<CrosswordGrid | null>(null);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [gameTitle, setGameTitle] = useState<string>("");
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [visibility, setVisibility] =
    useState<Extract<GameVisibility, "private-link" | "public">>(
      "private-link",
    );
  const [originalVisibility, setOriginalVisibility] =
    useState<Extract<GameVisibility, "private-link" | "public">>(
      "private-link",
    );
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [draftGameId, setDraftGameId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [aiLoadingClueId, setAiLoadingClueId] = useState<string | null>(null);
  const [aiLoadingWordId, setAiLoadingWordId] = useState<string | null>(null);
  const [clueLanguage, setClueLanguage] = useState<SupportedLanguage>("en");
  const [gridBuildError, setGridBuildError] = useState<string | null>(null);
  const clueLanguageRef = useRef<SupportedLanguage>("en");
  clueLanguageRef.current = clueLanguage;
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState<boolean>(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wasPublished, setWasPublished] = useState<boolean>(false);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(
    null,
  );
  const navigatingToPreview = useRef(false);

  useEffect(() => {
    if (!editGameId) return;
    let cancelled = false;

    const hydrateGame = (game: GameResponse) => {
      const c = game.content;
      if (c.recipient) setRecipient(c.recipient as Recipient);
      if (typeof c.personalMessage === "string") setPersonalMessage(c.personalMessage);
      if (Array.isArray(c.words)) {
        setWords(
          (c.words as CrosswordWord[]).map((w) => ({
            ...w,
            id: w.id ?? Math.random().toString(36).slice(2),
          })),
        );
      }
      const settings = c.settings as Record<string, unknown> | undefined;
      if (typeof settings?.showSolution === "boolean") setShowSolution(settings.showSolution);
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
    gamesService
      .getGame(editGameId)
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
    return () => {
      cancelled = true;
    };
  }, [editGameId]);

  useEffect(
    () => () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    },
    [coverPreviewUrl],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cw:draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.recipient) setRecipient(d.recipient);
      if (typeof d.personalMessage === "string") setPersonalMessage(d.personalMessage);
      if (Array.isArray(d.words)) setWords(d.words);
      if (d.grid) setGrid(d.grid);
      if (typeof d.gameTitle === "string") setGameTitle(d.gameTitle);
      if (typeof d.showSolution === "boolean") setShowSolution(d.showSolution);
      if (typeof d.clueLanguage === "string") setClueLanguage(d.clueLanguage);
      if (typeof d.draftGameId === "string") setDraftGameId(d.draftGameId);
      if (d.visibility === "private-link" || d.visibility === "public") setVisibility(d.visibility);
    } catch { /* corrupted — ignore */ }
  }, []);

  useEffect(() => () => {
    if (!navigatingToPreview.current) localStorage.removeItem("cw:draft");
  }, []);

  const handlePreview = (): void => {
    navigatingToPreview.current = true;
    localStorage.setItem("cw:draft", JSON.stringify({
      recipient, personalMessage, words, grid, gameTitle, showSolution, clueLanguage, draftGameId, visibility,
    }));
    navigate("/create/crossword/preview", {
      state: { grid, recipient, personalMessage },
    });
  };

  const wordScript = useMemo<"latin" | "cyrillic" | null>(() => {
    for (const w of words) {
      const word = w.word.trim();
      if (!word) continue;
      if (/[А-ЯҚӨҮІҒҢҺ]/.test(word)) return "cyrillic";
      if (/[A-Z]/.test(word)) return "latin";
    }
    return null;
  }, [words]);

  const hasAnyWord = useMemo(
    () => words.some((w) => w.word.trim().length > 0),
    [words],
  );

  useEffect(() => {
    if (wordScript === "latin") {
      setClueLanguage("en");
    } else if (wordScript === "cyrillic") {
      const hasKazakh = wordsRef.current.some((w) => /[ҚӨҮІҒҢҺ]/.test(w.word));
      setClueLanguage(hasKazakh ? "kz" : "ru");
    }
  }, [wordScript]);

  const validWordCount = words.filter(
    (w) => w.word.trim().length >= 2 && w.clue.trim(),
  ).length;
  const placedWordCount = grid?.placedWords.length ?? 0;
  const placedWordIds = useMemo(
    () => new Set(grid?.placedWords.map((pw) => pw.wordId) ?? []),
    [grid],
  );

  const displayPlacedWords = useMemo(
    () =>
      grid?.placedWords.map((pw) => {
        const w = words.find((x) => x.id === pw.wordId);
        return w ? { ...pw, clue: w.clue } : pw;
      }) ?? [],
    [grid, words],
  );

  const updateWord = useCallback(
    (id: string, changes: Partial<CrosswordWord>): void => {
      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...changes } : w)),
      );
    },
    [],
  );

  const addWord = (): void => {
    if (words.length < MAX_WORDS) setWords((p) => [...p, createDefaultWord()]);
  };

  const removeWord = useCallback((id: string): void => {
    setWords((p) => p.filter((w) => w.id !== id));
  }, []);

  const wordsRef = useRef(words);
  wordsRef.current = words;

  const handleAiClue = useCallback(
    async (wordId: string, wordValue: string): Promise<void> => {
      if (wordValue.trim().length < 2) return;
      setAiLoadingClueId(wordId);
      try {
        const result = await aiService.generateCrossword({
          mode: "definition-from-word",
          input: wordValue.trim(),
          language: clueLanguageRef.current,
        });
        updateWord(wordId, { clue: result.result });
      } catch {
        // Silently fail — user can type the clue manually
      } finally {
        setAiLoadingClueId(null);
      }
    },
    [updateWord],
  );

  const handleAiWord = useCallback(
    async (wordId: string, clue: string): Promise<void> => {
      if (clue.length < 3) return;
      setAiLoadingWordId(wordId);
      try {
        const result = await aiService.generateCrossword({
          mode: "word-from-definition",
          input: clue,
          language: clueLanguageRef.current,
        });
        updateWord(wordId, { word: result.result });
      } catch {
        // Silently fail — user can type the word manually
      } finally {
        setAiLoadingWordId(null);
      }
    },
    [updateWord],
  );

  const buildGrid = useCallback((): void => {
    setIsBuilding(true);
    setGridBuildError(null);
    const baseSeed = Date.now();
    setTimeout(() => {
      let result: CrosswordGrid | null = null;
      for (let attempt = 0; attempt < 3 && !result; attempt++) {
        result = buildCrosswordGrid(
          wordsRef.current,
          baseSeed + attempt * 99991,
        );
      }
      setGrid(result);
      if (!result) {
        setGridBuildError(
          "Couldn't fit all words in the grid. Try adding words with more shared letters, or click Rebuild to try a different arrangement.",
        );
      }
      setIsBuilding(false);
    }, 50);
  }, []);

  const hasAutoGenerated = useRef(false);
  useEffect(() => {
    if (hasAutoGenerated.current || isLoadingGame) return;
    hasAutoGenerated.current = true;
    const completeCount = wordsRef.current.filter(
      (w) => w.word.trim().length >= 2 && w.clue.trim(),
    ).length;
    if (completeCount >= 3) buildGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingGame]);

  const completeness = {
    recipient: recipient.name.trim().length > 0,
    words: validWordCount >= MIN_WORDS,
    title: gameTitle.trim().length > 0,
  };
  const canPublish =
    Object.values(completeness).every(Boolean) && grid !== null;

  const handlePublish = async (): Promise<void> => {
    if (isPublishing || !canPublish) {
      return;
    }

    setIsPublishing(true);

    try {
      if (isEditMode && editGameId) {
        const updateResult = await gamesService.updateGame(editGameId, {
          title: gameTitle,
          content: mapCrosswordContent({
            recipient,
            personalMessage,
            words,
            showSolution,
          }),
          coverImageContentType: coverFile ? coverFile.type : undefined,
        });
        if (coverFile && updateResult.coverUploadUrl) {
          await gamesService.uploadGameCover(updateResult.coverUploadUrl, coverFile);
        }
        const response = await gamesService.publishGame(
          editGameId,
          buildPublishPayload(visibility),
        );
        setWasPublished(true);
        setEditGameId(response.gameId);
        return;
      }

      let gameIdForPublish = draftGameId;

      if (!gameIdForPublish) {
        const payload = buildCreateGamePayload(
          "crossword",
          { title: gameTitle, recipient, personalMessage },
          mapCrosswordContent({
            recipient,
            personalMessage,
            words,
            showSolution,
          }),
        );

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
        buildPublishPayload(visibility),
      );
      setWasPublished(true);
      setEditGameId(response.gameId);
    } catch {
      // silent — user can retry
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async (): Promise<void> => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const title =
      gameTitle.trim() ||
      (recipient.name ? `Crossword for ${recipient.name}` : "My Crossword");
    const content = mapCrosswordContent({
      recipient,
      personalMessage,
      words,
      showSolution,
    });

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
          "crossword",
          { title, recipient, personalMessage },
          content,
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

  if (isLoadingGame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading game…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive text-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GameTopBar
        step={step}
        onStepChange={setStep}
        stepLabels={STEP_LABELS}
        previewDisabled={!grid}
        onPreview={handlePreview}
        canPublish={canPublish}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        onSave={handleSaveDraft}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        isPublished={wasPublished}
        theme={CROSSWORD_THEME}
      />

      <div className="mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
        {step === 1 && (
          <RecipientStep
            recipient={recipient}
            onRecipientChange={setRecipient}
            personalMessage={personalMessage}
            onPersonalMessageChange={setPersonalMessage}
            onContinue={() => setStep(2)}
            heading="Who's solving? 📝"
            namePlaceholder="e.g. Jamie, Grandma, My Love…"
            messagePlaceholder="A warm message your recipient sees before they start solving…"
            continueLabel="Continue to words →"
          />
        )}

        {step === 2 && (
          <>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Add words & definitions 📝
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Each word needs a definition. When ready, generate the crossword
                grid.
              </p>
            </div>

            {recipient.name && (
              <AiBanner
                recipientName={recipient.name}
                theme={CROSSWORD_THEME}
                title={(name: string) =>
                  `AI can suggest words & definitions for ${name}`
                }
                subtitle="Enter a word and tap ✨ next to the definition field to get an AI suggestion"
              />
            )}

            <MobileGridPanel
              grid={grid}
              isBuilding={isBuilding}
              validWordCount={validWordCount}
              placedWordCount={placedWordCount}
              onRebuild={buildGrid}
              displayPlacedWords={displayPlacedWords}
              buildError={gridBuildError}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              <div className="lg:col-span-3 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {validWordCount}/{MAX_WORDS}
                  </Badge>
                  <div className="flex items-center gap-0.5 border rounded-lg p-0.5 bg-muted/30">
                    {(["en", "ru", "kz"] as SupportedLanguage[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => !hasAnyWord && setClueLanguage(lang)}
                        disabled={hasAnyWord}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-medium uppercase transition-colors",
                          clueLanguage === lang
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                          hasAnyWord && "cursor-not-allowed opacity-60",
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                {words.map((w, i) => (
                  <WordRow
                    key={w.id}
                    word={w}
                    index={i}
                    onChange={updateWord}
                    onRemove={removeWord}
                    canRemove={words.length > 1}
                    isPlaced={grid !== null ? placedWordIds.has(w.id) : null}
                    onAiClue={handleAiClue}
                    isAiLoadingClue={aiLoadingClueId === w.id}
                    onAiWord={handleAiWord}
                    isAiLoadingWord={aiLoadingWordId === w.id}
                    allowedScript={wordScript}
                  />
                ))}
                {words.length < MAX_WORDS && (
                  <AddItemButton label="Add word" onClick={addWord} />
                )}
              </div>

              <div className="lg:block lg:col-span-2">
                <div className="sticky top-24 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Grid3X3 className="w-3.5 h-3.5" />
                      Grid preview
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs text-muted-foreground"
                      onClick={buildGrid}
                      disabled={validWordCount < MIN_WORDS || isBuilding}
                    >
                      <RefreshCw
                        className={cn("w-3 h-3", isBuilding && "animate-spin")}
                      />
                      {grid ? "Rebuild" : "Generate"}
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    {isBuilding && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <p className="text-xs">Building grid…</p>
                      </div>
                    )}
                    {!isBuilding && grid && (
                      <div className="space-y-3">
                        <GridPreview grid={grid} size="sm" />
                        <Badge variant="secondary" className="text-xs">
                          {placedWordCount} placed
                        </Badge>
                      </div>
                    )}
                    {!isBuilding && !grid && gridBuildError && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                        <AlertCircle className="w-8 h-8 opacity-50 text-amber-500" />
                        <p className="text-xs">{gridBuildError}</p>
                      </div>
                    )}
                    {!isBuilding &&
                      !grid &&
                      !gridBuildError &&
                      validWordCount < MIN_WORDS && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                          <Grid3X3 className="w-8 h-8 opacity-20" />
                          <p className="text-xs">
                            Add at least {MIN_WORDS} complete words to generate
                            the grid
                          </p>
                        </div>
                      )}
                    {!isBuilding &&
                      !grid &&
                      !gridBuildError &&
                      validWordCount >= MIN_WORDS && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                          <Grid3X3 className="w-8 h-8 opacity-20" />
                          <p className="text-xs">
                            Click Generate to build the crossword grid
                          </p>
                        </div>
                      )}
                  </div>

                  {grid && (
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Definitions
                      </p>
                      <ClueList placedWords={displayPlacedWords} />
                    </div>
                  )}
                </div>
              </div>
            </div>

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
            <PublishStep
              recipient={recipient}
              gameTitle={gameTitle}
              onGameTitleChange={setGameTitle}
              visibility={visibility}
              onVisibilityChange={setVisibility}
              isPublishing={isPublishing}
              gameId={editGameId ?? undefined}
              titlePlaceholder={`e.g. "Our Story in Words" for ${
                recipient.name || "them"
              }`}
            >
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">
                  Cover image{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                {coverPreviewUrl ? (
                  <div className="relative rounded-xl overflow-hidden h-32">
                    <img
                      src={coverPreviewUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : existingThumbnail ? (
                  <div className="relative rounded-xl overflow-hidden h-32">
                    <img
                      src={existingThumbnail}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs font-medium">
                        Change cover
                      </span>
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
                    <span className="text-xs text-muted-foreground">
                      Click to upload
                    </span>
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
            </PublishStep>

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
                  icon: "📝",
                  label: "Words",
                  value: `${placedWordCount} in grid`,
                },
              ]}
            >
              {grid && (
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                    Grid preview
                  </p>
                  <GridPreview grid={grid} size="sm" />
                </div>
              )}
            </SummaryCard>
          </>
        )}
      </div>
    </div>
  );
}
