import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Gamepad2, Heart, Lock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gamesService } from "@/services/games";
import type { GameResponse } from "@/types/games";

type ViewState = "loading" | "ready" | "not-found" | "forbidden" | "error";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function VisibilityBadge({ visibility }: { visibility: GameResponse["visibility"] }) {
  if (visibility === "public") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Globe className="size-3" />
        Public
      </Badge>
    );
  }

  if (visibility === "private-link") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Lock className="size-3" />
        Private link
      </Badge>
    );
  }

  return <Badge variant="outline">Draft</Badge>;
}

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

  const contentPreview = useMemo(() => {
    if (!game) {
      return "";
    }
    return JSON.stringify(game.content, null, 2);
  }, [game]);

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" className="px-2">
          <Link to="/profile">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <VisibilityBadge visibility={game.visibility} />
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {game.type}
        </p>
        <h1 className="text-2xl font-bold">{game.title}</h1>
        <p className="text-sm text-muted-foreground">
          {game.description || "No description"}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {game.viewCount} views
          </span>
          <span className="flex items-center gap-1">
            <Gamepad2 className="size-3" />
            {game.playCount} plays
          </span>
          <span className="flex items-center gap-1">
            <Heart className="size-3" />
            {game.likeCount} likes
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          Updated: {formatDate(game.updatedAt)}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Game content
        </h2>
        <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
          {contentPreview}
        </pre>
      </div>

      {errorMessage && (
        <p className="text-xs text-muted-foreground">
          Note: {errorMessage}
        </p>
      )}
    </div>
  );
}
