import { useState, useCallback, useEffect } from "react";
import {
  Lightbulb,
  RefreshCw,
  Grid3X3,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mapCrosswordContent, buildCreateGamePayload, buildPublishPayload, validateCreatePayload } from "@/lib/gameMappers";
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
  CROSSWORD_THEME,
} from "@/components/game";
import type { Recipient } from "@/components/game";
import {
  buildCrosswordGrid,
  GridPreview,
  ClueList,
  WordRow,
  MobileGridPanel,
  PreviewModal,
  STEP_LABELS,
  MAX_WORDS,
  MIN_WORDS,
  createDefaultWord,
} from "@/components/game/crossword";
import type { CrosswordGrid, CrosswordWord } from "@/components/game/crossword";

export default function Crossword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(false);
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
  const [visibility, setVisibility] = useState<Extract<GameVisibility, "private-link" | "public">>("private-link");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [draftGameId, setDraftGameId] = useState<string | null>(null);

  const validWordCount = words.filter(
    (w) => w.word.trim().length >= 2 && w.clue.trim()
  ).length;
  const placedWordCount = grid?.placedWords.length ?? 0;
  const skippedCount = validWordCount - placedWordCount;
  const placedWordIds = new Set(grid?.placedWords.map((pw) => pw.wordId) ?? []);

  const updateWord = (id: string, changes: Partial<CrosswordWord>): void => {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...changes } : w))
    );
    setGrid(null);
  };
  const addWord = (): void => {
    if (words.length < MAX_WORDS) setWords((p) => [...p, createDefaultWord()]);
  };
  const removeWord = (id: string): void => {
    setWords((p) => p.filter((w) => w.id !== id));
    setGrid(null);
  };

  const buildGrid = useCallback((): void => {
    setIsBuilding(true);
    setTimeout(() => {
      setGrid(buildCrosswordGrid(words));
      setIsBuilding(false);
    }, 50);
  }, [words]);

  useEffect(() => {
    if (validWordCount < MIN_WORDS) {
      setGrid(null);
      return;
    }
    const t = setTimeout(() => setGrid(buildCrosswordGrid(words)), 600);
    return () => clearTimeout(t);
  }, [words, validWordCount]);

  const completeness = {
    recipient: recipient.name.trim().length > 0,
    words: validWordCount >= MIN_WORDS,
    title: gameTitle.trim().length > 0,
  };
  const canPublish =
    Object.values(completeness).every(Boolean) && grid !== null;
  const missingFields = [
    !completeness.recipient && "recipient name",
    !completeness.words && `at least ${MIN_WORDS} complete words`,
    !completeness.title && "crossword title",
    !grid && "valid word arrangement",
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
          "crossword",
          {
            title: gameTitle,
            recipient,
            personalMessage,
          },
          mapCrosswordContent({
            recipient,
            personalMessage,
            words,
            showSolution,
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

  return (
    <div className="min-h-screen bg-muted/30">
      {showPreview && grid && (
        <PreviewModal
          grid={grid}
          recipient={recipient}
          personalMessage={personalMessage}
          onClose={() => setShowPreview(false)}
        />
      )}

      <GameTopBar
        step={step}
        onStepChange={setStep}
        stepLabels={STEP_LABELS}
        previewDisabled={!grid}
        onPreview={() => setShowPreview(true)}
        canPublish={canPublish}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        theme={CROSSWORD_THEME}
      />

      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
        {step === 1 && (
          <RecipientStep
            recipient={recipient}
            onRecipientChange={setRecipient}
            personalMessage={personalMessage}
            onPersonalMessageChange={setPersonalMessage}
            onContinue={() => setStep(2)}
            theme={CROSSWORD_THEME}
            heading="Who's solving? 📝"
            namePlaceholder="e.g. Jamie, Grandma, My Love…"
            messagePlaceholder="A warm message your recipient sees before they start solving…"
            aiTeaserTitle="AI-powered word suggestions — coming next step"
            aiTeaserBody="Share memories or topics and our AI will generate meaningful words and clever clues to fill your crossword."
            continueLabel="Continue to words →"
          />
        )}

        {step === 2 && (
          <>
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Add words & clues 📝
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Each word needs a clue. Words are auto-arranged into a
                  crossword grid as you type.
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 mt-1 text-[10px] sm:text-xs"
              >
                {validWordCount}/{MAX_WORDS}
              </Badge>
            </div>

            {recipient.name && (
              <AiBanner
                recipientName={recipient.name}
                theme={CROSSWORD_THEME}
                title={(name: string) =>
                  `AI can suggest words & clues for ${name}`
                }
                subtitle="Tell us about shared memories and we'll generate meaningful words"
              />
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: "🔤", tip: "Letters only, min 2" },
                { icon: "🔗", tip: "Shared letters interlock" },
                { icon: "⚡", tip: "Grid updates auto" },
              ].map((item) => (
                <div
                  key={item.tip}
                  className="rounded-xl sm:rounded-2xl bg-background border border-border p-2 sm:p-3 text-center space-y-0.5 sm:space-y-1"
                >
                  <p className="text-base sm:text-xl">{item.icon}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">
                    {item.tip}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile collapsible grid panel */}
            <MobileGridPanel
              grid={grid}
              isBuilding={isBuilding}
              validWordCount={validWordCount}
              placedWordCount={placedWordCount}
              skippedCount={skippedCount}
              onRebuild={buildGrid}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              <div className="lg:col-span-3 space-y-2.5 sm:space-y-3">
                {words.map((w, i) => (
                  <WordRow
                    key={w.id}
                    word={w}
                    index={i}
                    onChange={updateWord}
                    onRemove={removeWord}
                    canRemove={words.length > MIN_WORDS}
                    isPlaced={placedWordIds.has(w.id)}
                  />
                ))}
                {words.length < MAX_WORDS && (
                  <AddItemButton label="Add word" onClick={addWord} />
                )}
              </div>

              {/* Desktop sidebar — hidden on mobile */}
              <div className="hidden lg:block lg:col-span-2">
                <div className="sticky top-24 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Grid3X3 className="w-3.5 h-3.5" />
                      Grid preview
                    </p>
                    {validWordCount >= MIN_WORDS && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs text-muted-foreground"
                        onClick={buildGrid}
                        disabled={isBuilding}
                      >
                        <RefreshCw
                          className={cn(
                            "w-3 h-3",
                            isBuilding && "animate-spin"
                          )}
                        />
                        Rebuild
                      </Button>
                    )}
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {placedWordCount} placed
                          </Badge>
                          {skippedCount > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                            >
                              {skippedCount} skipped
                            </Badge>
                          )}
                        </div>
                        {skippedCount > 0 && (
                          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                            Some words couldn't intersect. Try adding shared
                            letters.
                          </p>
                        )}
                      </div>
                    )}
                    {!isBuilding && !grid && validWordCount < MIN_WORDS && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                        <Grid3X3 className="w-8 h-8 opacity-20" />
                        <p className="text-xs">
                          Add at least {MIN_WORDS} complete words to generate
                          the grid
                        </p>
                      </div>
                    )}
                    {!isBuilding && !grid && validWordCount >= MIN_WORDS && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                        <AlertCircle className="w-6 h-6 opacity-40" />
                        <p className="text-xs">
                          Couldn't arrange these words. Try words that share
                          more letters.
                        </p>
                      </div>
                    )}
                  </div>

                  {grid && (
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Clues
                      </p>
                      <ClueList placedWords={grid.placedWords} />
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
                disabled={!grid}
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
              previewDisabled={!grid}
              onBack={() => setStep(2)}
              backLabel="← Back to words"
              theme={CROSSWORD_THEME}
              titlePlaceholder={`e.g. "Our Story in Words" for ${
                recipient.name || "them"
              }`}
            >
              <ToggleSetting
                icon={Lightbulb}
                label='Allow "Reveal solution"'
                description="Let the player peek at answers if they get stuck"
                value={showSolution}
                onChange={setShowSolution}
              />
            </PublishStep>
          </>
        )}
      </div>
    </div>
  );
}
