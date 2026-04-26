import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Heart, Search, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { appCache, CACHE_TTL } from "@/lib/cache";
import { useAuth } from "@/contexts/AuthContext";
import { gamesService } from "@/services/games";
import type { GameSummaryResponse, GameType, SortBy } from "@/types/games";

const gameEmoji: Record<GameType, string> = {
  "choose-me": "🎯",
  "guess-by-emoji": "😄",
  crossword: "📝",
};

const gradientByType: Record<GameType, string> = {
  "choose-me": "from-violet-500 to-indigo-500",
  "guess-by-emoji": "from-amber-500 to-rose-500",
  crossword: "from-emerald-500 to-teal-500",
};

function PublicGameCard({
  game,
  isLiked,
  likeCount,
  isLiking,
  onToggleLike,
  isAuthenticated,
}: {
  game: GameSummaryResponse;
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  onToggleLike: (gameId: string) => void;
  isAuthenticated: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="group flex flex-col gap-2 sm:gap-3">
      <div
        onClick={() => navigate(`/games/${game.gameId}`)}
        className={cn(
          "relative h-28 sm:h-40 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
          "ring-1 ring-black/5 dark:ring-white/5",
          "group-hover:ring-2 group-hover:ring-primary/30 group-hover:shadow-lg group-hover:-translate-y-0.5",
          "active:scale-[0.98] sm:active:scale-100",
        )}
      >
        {game.thumbnail ? (
          <img
            src={game.thumbnail}
            alt={game.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <div
              className={cn(
                "absolute inset-0 bg-linear-to-br opacity-60",
                gradientByType[game.type],
              )}
            />
            <div className="absolute inset-0 bg-muted/40 dark:bg-muted/60" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-5xl select-none opacity-60 group-hover:opacity-40 transition-opacity">
              {gameEmoji[game.type]}
            </div>
          </>
        )}

        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-background/70 backdrop-blur-sm text-muted-foreground">
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {game.playCount >= 1000
              ? `${(game.playCount / 1000).toFixed(1)}k`
              : game.playCount}
          </span>
        </div>

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block" />
        <div className="absolute inset-0 items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:flex">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/games/${game.gameId}`);
            }}
            className="flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
        </div>
      </div>

      <div className="px-0.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold truncate">
            {game.title}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            by @{game.authorName || "N/A"}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(game.gameId);
          }}
          disabled={!isAuthenticated || isLiking}
          title={!isAuthenticated ? "Sign in to like" : undefined}
          className={cn(
            "flex items-center gap-1 shrink-0 text-[10px] sm:text-xs transition-colors disabled:opacity-50",
            isLiked
              ? "text-rose-500"
              : "text-muted-foreground hover:text-rose-400",
          )}
        >
          <Heart className={cn("size-3", isLiked && "fill-current")} />
          {likeCount}
        </button>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3.5 sm:mb-5">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-sm sm:text-base font-bold">{title}</h2>
            {badge && (
              <Badge
                variant="secondary"
                className="text-[10px] sm:text-xs font-normal"
              >
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  const [sortBy, setSortBy] = useState<SortBy>("popular");
  const [typeFilter, setTypeFilter] = useState<GameType | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const cacheKey = `public-games:${sortBy}:${typeFilter ?? ""}:${debouncedSearch}`;
  const cachedGames = appCache.get<GameSummaryResponse[]>(
    cacheKey,
    CACHE_TTL.PUBLIC,
  );

  const [publicGames, setPublicGames] = useState<GameSummaryResponse[]>(
    cachedGames ?? [],
  );
  const [publicGamesNextCursor, setPublicGamesNextCursor] = useState<
    string | undefined
  >();
  const [isLoadingPublicGames, setIsLoadingPublicGames] =
    useState(!cachedGames);
  const [publicGamesError, setPublicGamesError] = useState("");
  const [isLoadingMorePublicGames, setIsLoadingMorePublicGames] =
    useState(false);

  const [likedGames, setLikedGames] = useState<Record<string, boolean>>({});
  const [localLikeCounts, setLocalLikeCounts] = useState<
    Record<string, number>
  >({});
  const [likingGameId, setLikingGameId] = useState<string | null>(null);

  const loadPublicGames = async (
    cursor?: string,
    overrideSortBy = sortBy,
    overrideType = typeFilter,
    overrideSearch = debouncedSearch,
  ) => {
    const key = `public-games:${overrideSortBy}:${overrideType ?? ""}:${overrideSearch}`;
    if (cursor) {
      setIsLoadingMorePublicGames(true);
    } else if (!appCache.get(key, CACHE_TTL.PUBLIC)) {
      setIsLoadingPublicGames(true);
    }
    setPublicGamesError("");
    try {
      const res = await gamesService.listPublicGames({
        sortBy: overrideSortBy,
        type: overrideType,
        search: overrideSearch || undefined,
        cursor,
      });
      const updated = cursor ? [...publicGames, ...res.games] : res.games;
      setPublicGames(updated);
      if (!cursor) appCache.set(key, updated);
      setPublicGamesNextCursor(res.nextCursor);
      setLocalLikeCounts((prev) => {
        const next = { ...prev };
        res.games.forEach((g) => {
          if (!(g.gameId in next)) next[g.gameId] = g.likeCount;
        });
        return next;
      });
      setLikedGames((prev) => {
        const next = { ...prev };
        res.games.forEach((g) => {
          if (!(g.gameId in next) && g.isLikedByCurrentUser !== undefined) {
            next[g.gameId] = g.isLikedByCurrentUser;
          }
        });
        return next;
      });
    } catch (err) {
      setPublicGamesError(gamesService.mapError(err).message);
    } finally {
      setIsLoadingPublicGames(false);
      setIsLoadingMorePublicGames(false);
    }
  };

  useEffect(() => {
    const key = `public-games:${sortBy}:${typeFilter ?? ""}:${debouncedSearch}`;
    const cached = appCache.get<GameSummaryResponse[]>(key, CACHE_TTL.PUBLIC);

    if (cached) {
      setPublicGames(cached);
      setIsLoadingPublicGames(false);
    } else {
      setIsLoadingPublicGames(true);
    }
    setPublicGamesNextCursor(undefined);
    loadPublicGames(undefined, sortBy, typeFilter, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, typeFilter, debouncedSearch]);

  const handleToggleLike = async (gameId: string) => {
    if (!isAuthenticated || likingGameId) return;
    setLikingGameId(gameId);

    const wasLiked = likedGames[gameId] ?? false;
    setLikedGames((prev) => ({ ...prev, [gameId]: !wasLiked }));
    setLocalLikeCounts((prev) => ({
      ...prev,
      [gameId]: (prev[gameId] ?? 0) + (wasLiked ? -1 : 1),
    }));

    try {
      if (wasLiked) {
        await gamesService.unlikeGame(gameId);
      } else {
        await gamesService.likeGame(gameId);
      }
    } catch (err) {
      setLikedGames((prev) => ({ ...prev, [gameId]: wasLiked }));
      setLocalLikeCounts((prev) => ({
        ...prev,
        [gameId]: (prev[gameId] ?? 0) + (wasLiked ? 1 : -1),
      }));
      const parsed = gamesService.mapError(err);
      if (parsed.code === "GAME_ALREADY_LIKED") {
        setLikedGames((prev) => ({ ...prev, [gameId]: true }));
      } else if (parsed.code === "GAME_NOT_LIKED") {
        setLikedGames((prev) => ({ ...prev, [gameId]: false }));
      }
    } finally {
      setLikingGameId(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 gap-4 sm:gap-6">
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-pink-600 p-4 sm:p-6 text-white">
        <div className="absolute -top-8 -right-8 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 blur-xl" />

        <div className="relative space-y-2 sm:space-y-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 text-[10px] sm:text-xs font-medium">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            AI-powered mini-games
          </div>
          <h1 className="text-xl sm:text-2xl font-bold leading-snug">
            Create a game for
            <br />
            someone you love 🎁
          </h1>
          <p className="text-white/70 text-xs sm:text-sm max-w-xs leading-relaxed">
            Pick a template, personalize with AI, and share a unique game your
            recipient will never forget.
          </p>
        </div>
      </div>

      <section className="flex flex-col flex-1 rounded-xl sm:rounded-2xl bg-muted/40 dark:bg-muted/20 p-3 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <SectionHeader
            icon={TrendingUp}
            title="Trending"
            subtitle="Games others are playing right now"
            badge="Community"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSortBy("popular")}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full border transition-colors",
                sortBy === "popular"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              Popular
            </button>
            <button
              onClick={() => setSortBy("newest")}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full border transition-colors",
                sortBy === "newest"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              Newest
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-3.5 sm:mb-5">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full text-[10px] pl-6 pr-2 py-1 rounded-full border border-border bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [undefined, "choose-me", "guess-by-emoji", "crossword"] as (
                | GameType
                | undefined
              )[]
            ).map((t) => (
              <button
                key={t ?? "all"}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "text-[10px] px-2 py-1 rounded-full border transition-colors",
                  typeFilter === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {t
                  ? `${gameEmoji[t]} ${t === "choose-me" ? "Choose Me" : t === "guess-by-emoji" ? "By Emoji" : "Crossword"}`
                  : "All"}
              </button>
            ))}
          </div>
        </div>

        {isLoadingPublicGames ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Loading games...
          </p>
        ) : publicGamesError ? (
          <p className="text-xs text-destructive">{publicGamesError}</p>
        ) : publicGames.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No public games yet.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
              {publicGames.map((game) => (
                <PublicGameCard
                  key={game.gameId}
                  game={game}
                  isLiked={likedGames[game.gameId] ?? false}
                  likeCount={localLikeCounts[game.gameId] ?? game.likeCount}
                  isLiking={likingGameId === game.gameId}
                  onToggleLike={handleToggleLike}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
            {publicGamesNextCursor && (
              <button
                onClick={() => loadPublicGames(publicGamesNextCursor)}
                disabled={isLoadingMorePublicGames}
                className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {isLoadingMorePublicGames ? "Loading..." : "Load more"}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
