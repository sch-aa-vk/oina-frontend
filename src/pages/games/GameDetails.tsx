import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { appCache, CACHE_TTL, requestHistoryRefresh } from "@/lib/cache";
import { gamesService } from "@/services/games";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChooseMeGamePlay,
  GuessByEmojiGamePlay,
  CrosswordGamePlay,
  buildCrosswordGrid,
} from "@/components/game";
import type { GameResponse, GameType } from "@/types/games";
import type { Question, GameOutcome } from "@/components/game/choose-me";
import type { EmojiPuzzle } from "@/components/game/guess-by-emoji";
import type { CrosswordWord } from "@/components/game/crossword";
import type { Recipient } from "@/components/game";

type ViewState = "loading" | "ready" | "not-found" | "forbidden" | "error";

export default function GameDetails() {
  const { gameId = "" } = useParams<{ gameId: string }>();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<ViewState>("loading");
  const [game, setGame] = useState<GameResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasGameId = gameId.trim().length > 0;

  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (state === "ready") {
      startedAt.current = Date.now();
    }
  }, [state]);

  const handleGameComplete = useCallback(
    (score: number, total: number) => {
      if (!isAuthenticated || game?.visibility === "draft") return;
      const duration = Date.now() - startedAt.current;
      gamesService
        .recordGameResult(gameId, {
          score,
          maxScore: total,
          duration,
          completionStatus: "completed",
        })
        .then(() => requestHistoryRefresh())
        .catch(() => {});
    },
    [gameId, isAuthenticated, game?.visibility],
  );

  const handleChooseMeComplete = useCallback(
    (outcomeId: string) => {
      if (!isAuthenticated || game?.visibility === "draft") return;
      const duration = Date.now() - startedAt.current;
      gamesService
        .recordGameResult(gameId, {
          outcomeId,
          duration,
          completionStatus: "completed",
        })
        .then(() => requestHistoryRefresh())
        .catch(() => {});
    },
    [gameId, isAuthenticated, game?.visibility],
  );

  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [likeError, setLikeError] = useState("");

  useEffect(() => {
    if (!hasGameId) {
      return;
    }

    let active = true;

    const loadGame = async () => {
      setState("loading");
      setErrorMessage("");

      try {
        const cached = appCache.get<GameResponse>(`game-${gameId}`, CACHE_TTL.PUBLIC);
        if (cached) {
          setGame(cached);
          setState("ready");
          setLocalLikeCount(cached.likeCount);
          setIsLiked(cached.isLikedByCurrentUser ?? false);
          return;
        }

        const baseGame = await gamesService.getGame(gameId);

        if (!active) {
          return;
        }

        if (baseGame.visibility === "draft") {
          try {
            const previewGame = await gamesService.previewGame(gameId);
            if (!active) {
              return;
            }
            setGame(previewGame);
            setState("ready");

            return;
          } catch (previewError) {
            const parsed = gamesService.mapError(previewError);
            if (parsed.code !== "PREVIEW_ONLY_FOR_DRAFT") {
              setErrorMessage(parsed.message);
            }
          }
        }

        setGame(baseGame);
        setState("ready");
        setLocalLikeCount(baseGame.likeCount);
        setIsLiked(baseGame.isLikedByCurrentUser ?? false);

        if (baseGame.visibility !== "draft") {
          appCache.set(`game-${gameId}`, baseGame);
          gamesService.trackView(gameId).catch(() => {
            /* silently ignore */
          });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const parsed = gamesService.mapError(error);
        setErrorMessage(parsed.message);

        if (parsed.status === 404 || parsed.code === "GAME_NOT_FOUND") {
          setState("not-found");
          return;
        }

        if (parsed.status === 403 || parsed.code === "GAME_FORBIDDEN") {
          setState("forbidden");
          return;
        }

        setState("error");
      }
    };

    loadGame();

    return () => {
      active = false;
    };
  }, [gameId, hasGameId]);

  const handleToggleLike = useCallback(async () => {
    if (!isAuthenticated || isLiking || game?.visibility === "draft") return;

    setIsLiking(true);
    setLikeError("");

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLocalLikeCount((c) => c + (wasLiked ? -1 : 1));

    try {
      if (wasLiked) {
        await gamesService.unlikeGame(gameId);
      } else {
        await gamesService.likeGame(gameId);
      }
    } catch (err) {
      setIsLiked(wasLiked);
      setLocalLikeCount((c) => c + (wasLiked ? 1 : -1));
      const parsed = gamesService.mapError(err);

      if (
        parsed.code !== "GAME_ALREADY_LIKED" &&
        parsed.code !== "GAME_NOT_LIKED"
      ) {
        setLikeError(parsed.message);
      } else {
        setIsLiked(parsed.code === "GAME_ALREADY_LIKED");
      }
    } finally {
      setIsLiking(false);
    }
  }, [isAuthenticated, isLiking, isLiked, gameId, game?.visibility]);

  const gamePlayContent = useMemo(() => {
    if (!game) return null;

    const content = game.content;
    const recipient: Recipient = (content.recipient as Recipient) || {
      name: "Friend",
      occasion: "",
    };
    const personalMessage = (content.personalMessage as string) || "";

    const gameType = game.type as GameType;

    if (gameType === "choose-me") {
      const outcomes = (content.outcomes as GameOutcome[]) || [];
      if (outcomes.length < 2) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950 dark:to-pink-950 flex items-center justify-center p-4">
            <div className="bg-background rounded-3xl border border-border shadow-2xl p-8 max-w-md w-full space-y-4 text-center">
              <p className="text-lg font-semibold">Game unavailable</p>
              <p className="text-sm text-muted-foreground">
                This game was created in an older format and cannot be played.
              </p>
            </div>
          </div>
        );
      }
      const questions = (content.questions as Question[]) || [];
      const settings = (content.settings as { shuffle?: boolean }) || {};
      return (
        <ChooseMeGamePlay
          questions={questions}
          outcomes={outcomes}
          recipient={recipient}
          personalMessage={personalMessage}
          shuffle={settings.shuffle || false}
          onComplete={handleChooseMeComplete}
        />
      );
    }

    if (gameType === "guess-by-emoji") {
      const puzzles = (content.puzzles as EmojiPuzzle[]) || [];
      const settings = (content.settings as { showAnswers?: boolean }) || {};
      return (
        <GuessByEmojiGamePlay
          puzzles={puzzles}
          recipient={recipient}
          personalMessage={personalMessage}
          showAnswers={settings.showAnswers || false}
          onComplete={handleGameComplete}
        />
      );
    }

    if (gameType === "crossword") {
      const words = (content.words as CrosswordWord[]) || [];
      const settings = (content.settings as { showSolution?: boolean }) || {};
      const grid = buildCrosswordGrid(words);

      if (!grid) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
            <div className="bg-background rounded-3xl border border-border shadow-2xl p-8 max-w-md w-full space-y-4">
              <p className="text-lg font-semibold">Could not load game</p>
              <p className="text-sm text-muted-foreground">
                The crossword grid could not be generated from the saved words.
              </p>
            </div>
          </div>
        );
      }

      return (
        <CrosswordGamePlay
          grid={grid}
          recipient={recipient}
          personalMessage={personalMessage}
          showSolution={settings.showSolution || false}
          onComplete={handleGameComplete}
        />
      );
    }

    return null;
  }, [game, handleGameComplete, handleChooseMeComplete]);

  if (gamePlayContent && game?.visibility !== "draft") {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50 flex flex-col items-center gap-1">
          <button
            onClick={handleToggleLike}
            disabled={isLiking || !isAuthenticated}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-lg border transition-colors",
              isLiked
                ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
                : "bg-background text-muted-foreground border-border hover:text-rose-500 hover:border-rose-300",
            )}
            title={!isAuthenticated ? "Sign in to like games" : undefined}
          >
            <Heart className={cn("size-4", isLiked && "fill-current")} />
            <span>{localLikeCount}</span>
          </button>
          {likeError && (
            <p className="text-xs text-destructive bg-background rounded-md px-2 py-1 shadow border max-w-[160px] text-center">
              {likeError}
            </p>
          )}
        </div>
        {gamePlayContent}
      </div>
    );
  }

  if (gamePlayContent) {
    return gamePlayContent;
  }

  if (!hasGameId) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Game not found</h1>
        <p className="text-sm text-muted-foreground">
          The game may have been removed or you do not have access.
        </p>
        <Button asChild variant="outline">
          <Link to="/profile">Back to profile</Link>
        </Button>
      </div>
    );
  }

  if (state === "loading") {
    return <div className="text-sm text-muted-foreground">Loading game...</div>;
  }

  if (state === "not-found") {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Game not found</h1>
        <p className="text-sm text-muted-foreground">
          The game may have been removed or you do not have access.
        </p>
        <Button asChild variant="outline">
          <Link to="/profile">Back to profile</Link>
        </Button>
      </div>
    );
  }

  if (state === "forbidden") {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view this game.
        </p>
        <Button asChild variant="outline">
          <Link to="/profile">Back to profile</Link>
        </Button>
      </div>
    );
  }

  if (state === "error" || !game) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Could not load game</h1>
        <p className="text-sm text-muted-foreground">
          {errorMessage || "Something went wrong. Please try again."}
        </p>
        <Button asChild variant="outline">
          <Link to="/profile">Back to profile</Link>
        </Button>
      </div>
    );
  }

  return null;
}
