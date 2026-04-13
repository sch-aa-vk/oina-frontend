import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { gamesService } from "@/services/games";
import {
  ChooseMeGamePlay,
  GuessByEmojiGamePlay,
  CrosswordGamePlay,
  buildCrosswordGrid,
} from "@/components/game";
import type { GameResponse, GameType } from "@/types/games";
import type { Question } from "@/components/game/choose-me";
import type { EmojiPuzzle } from "@/components/game/guess-by-emoji";
import type { CrosswordWord } from "@/components/game/crossword";
import type { Recipient } from "@/components/game";

type ViewState = "loading" | "ready" | "not-found" | "forbidden" | "error";

export default function GameDetails() {
  const { gameId = "" } = useParams<{ gameId: string }>();
  const [state, setState] = useState<ViewState>("loading");
  const [game, setGame] = useState<GameResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasGameId = gameId.trim().length > 0;

  useEffect(() => {
    if (!hasGameId) {
      return;
    }

    let active = true;

    const loadGame = async () => {
      setState("loading");
      setErrorMessage("");

      try {
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
      const questions = (content.questions as Question[]) || [];
      const settings = content.settings as { shuffle?: boolean } || {};
      return (
        <ChooseMeGamePlay
          questions={questions}
          recipient={recipient}
          personalMessage={personalMessage}
          shuffle={settings.shuffle || false}
        />
      );
    }

    if (gameType === "guess-by-emoji") {
      const puzzles = (content.puzzles as EmojiPuzzle[]) || [];
      const settings = content.settings as { showAnswers?: boolean } || {};
      return (
        <GuessByEmojiGamePlay
          puzzles={puzzles}
          recipient={recipient}
          personalMessage={personalMessage}
          showAnswers={settings.showAnswers || false}
        />
      );
    }

    if (gameType === "crossword") {
      const words = (content.words as CrosswordWord[]) || [];
      const settings = content.settings as { showSolution?: boolean } || {};
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
        />
      );
    }

    return null;
  }, [game]);

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
