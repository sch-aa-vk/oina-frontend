import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { appCache, CACHE_TTL } from "@/lib/cache";
import { cn } from "@/lib/utils";
import {
  Camera,
  Pencil,
  Check,
  X,
  Gamepad2,
  Clock,
  Eye,
  Heart,
  Loader2,
  LogOut,
  Settings,
  Undo2,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { gamesService } from "@/services/games";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usersService } from "@/services/users";
import { giftSiteService } from "@/services/giftSite";
import type { AvatarContentType } from "@/services/users";
import type { MyGiftItem } from "@/services/giftSite";
import type { GameResponse } from "@/types/games";
import type { User } from "@/types/auth";
import { compressImage } from "@/utils/imageUtils";

const ALLOWED_AVATAR_TYPES: AvatarContentType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.displayName || user?.username || "";
  const initials =
    displayName.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "??";

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(displayName);
  const [tempBio, setTempBio] = useState(user?.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const cachedGames = appCache.get<GameResponse[]>(
    "my-games",
    CACHE_TTL.PERSONAL,
  );
  const cachedGifts = appCache.get<MyGiftItem[]>(
    "my-gifts",
    CACHE_TTL.PERSONAL,
  );

  const [games, setGames] = useState<GameResponse[]>(cachedGames ?? []);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [gamesError, setGamesError] = useState<string>("");
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(!cachedGames);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const [restoringGameId, setRestoringGameId] = useState<string | null>(null);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const [openDeletePopoverId, setOpenDeletePopoverId] = useState<string | null>(null);
  const [gameActionError, setGameActionError] = useState<string>("");

  const [gifts, setGifts] = useState<MyGiftItem[]>(cachedGifts ?? []);
  const [giftsNextCursor, setGiftsNextCursor] = useState<string | undefined>();
  const [isLoadingGifts, setIsLoadingGifts] = useState(!cachedGifts);
  const [isLoadingMoreGifts, setIsLoadingMoreGifts] = useState(false);
  const [giftsError, setGiftsError] = useState("");

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const handleEdit = () => {
    setTempName(displayName);
    setTempBio(user?.bio || "");
    setSaveError("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    try {
      const updated = await usersService.updateMe({
        displayName: tempName || undefined,
        bio: tempBio || undefined,
      });
      const newUser = { ...user!, ...updated };
      appCache.set("me", newUser);
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      setIsEditing(false);
    } catch (err) {
      setSaveError(usersService.mapError(err).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError("");
  };

  const handleAvatarClick = () => {
    if (!isUploadingAvatar) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type as AvatarContentType)) {
      setAvatarError("Only JPEG, PNG, WebP, and GIF images are allowed.");
      e.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError("");
    try {
      const compressed = await compressImage(file);
      const { presignedUrl, avatarUrl } = await usersService.uploadAvatar(
        compressed.type as AvatarContentType,
      );
      await usersService.putFileToS3(presignedUrl, compressed);
      const newUser = { ...user!, avatarUrl };
      appCache.set("me", newUser);
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (err) {
      setAvatarError(usersService.mapError(err).message);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleRestoreGame = async (gameId: string) => {
    setRestoringGameId(gameId);
    setGameActionError("");
    try {
      const restored = await gamesService.restoreGame(gameId);
      const updated = games.map((g) => (g.gameId === gameId ? restored : g));
      setGames(updated);
      appCache.set("my-games", updated);
    } catch (err) {
      setGameActionError(gamesService.mapError(err).message);
    } finally {
      setRestoringGameId(null);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    setDeletingGameId(gameId);
    setGameActionError("");
    try {
      await gamesService.deleteGame(gameId);
      const updated = games.map((g) =>
        g.gameId === gameId ? { ...g, isDeleted: true } : g,
      );
      setGames(updated);
      appCache.set("my-games", updated);
    } catch (err) {
      setGameActionError(gamesService.mapError(err).message);
    } finally {
      setDeletingGameId(null);
      setOpenDeletePopoverId(null);
    }
  };

  const loadGifts = async (cursor?: string) => {
    if (cursor) {
      setIsLoadingMoreGifts(true);
    } else if (!appCache.get("my-gifts", CACHE_TTL.PERSONAL)) {
      setIsLoadingGifts(true);
    }
    setGiftsError("");
    try {
      const res = await giftSiteService.listMyGifts(cursor);
      const updated = cursor ? [...gifts, ...res.gifts] : res.gifts;
      setGifts(updated);
      if (!cursor) appCache.set("my-gifts", updated);
      setGiftsNextCursor(res.nextCursor);
    } catch {
      setGiftsError("Could not load gifts. Please try again.");
    } finally {
      setIsLoadingGifts(false);
      setIsLoadingMoreGifts(false);
    }
  };

  const loadGames = async (cursor?: string) => {
    if (cursor) {
      setIsLoadingMore(true);
    } else if (!appCache.get("my-games", CACHE_TTL.PERSONAL)) {
      setIsLoadingGames(true);
    }

    try {
      setGamesError("");
      const response = await gamesService.listGames(cursor);
      const updated = cursor ? [...games, ...response.games] : response.games;
      setGames(updated);
      if (!cursor) appCache.set("my-games", updated);
      setNextCursor(response.nextCursor);
    } catch (error) {
      const parsed = gamesService.mapError(error);
      setGamesError(parsed.message);
    } finally {
      setIsLoadingGames(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const cached = appCache.get<User>("me", CACHE_TTL.PERSONAL);
      if (cached) return;
      try {
        const fresh = await usersService.getMe();

        const s3Path = (url?: string | null) => url?.split("?")[0] ?? "";
        const merged: User =
          user?.avatarUrl && s3Path(user.avatarUrl) === s3Path(fresh.avatarUrl)
            ? { ...fresh, avatarUrl: user.avatarUrl }
            : fresh;
        appCache.set("me", merged);
        setUser(merged);
        localStorage.setItem("user", JSON.stringify(merged));
      } catch {
        // keep stale context data on error
      }
    };
    loadProfile();
    loadGames();
    loadGifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser]);

  const gameTypeLabel: Record<GameResponse["type"], string> = {
    "choose-me": "Choose Me",
    "guess-by-emoji": "Guess by Emoji",
    crossword: "Crossword",
  };

  const visibilityLabel: Record<GameResponse["visibility"], string> = {
    draft: "Draft",
    "private-link": "Private link",
    public: "Public",
  };

  const gameEmoji: Record<GameResponse["type"], string> = {
    "choose-me": "🎯",
    "guess-by-emoji": "😄",
    crossword: "📝",
  };

  const gradientByType: Record<GameResponse["type"], string> = {
    "choose-me": "from-violet-500 to-indigo-500",
    "guess-by-emoji": "from-amber-500 to-rose-500",
    crossword: "from-emerald-500 to-teal-500",
  };

  const getEditPath = (game: GameResponse): string =>
    `/create/${game.type}?gameId=${encodeURIComponent(game.gameId)}`;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-start gap-4 sm:gap-6">
          <div className="relative shrink-0 order-1">
            <Avatar className="size-24 ring-2 ring-border">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow hover:scale-110 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploadingAvatar ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Camera className="size-3" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="order-3 basis-full sm:order-2 sm:basis-auto sm:flex-1 flex flex-col gap-3">
            {isEditing ? (
              <>
                <div className="flex flex-col">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="max-w-xs text-xl md:text-xl font-semibold h-auto border-t-0 border-r-0 border-l-0 rounded-none bg-transparent shadow-none px-0 py-0 focus:bg-transparent focus-visible:ring-0"
                    placeholder="Display name"
                  />
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Input
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="w-full md:text-sm h-auto border-t-0 border-r-0 border-l-0 rounded-none bg-transparent shadow-none px-0 py-0 focus:bg-transparent focus-visible:ring-0 text-muted-foreground"
                  placeholder="Short bio"
                />
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-semibold border-b border-transparent">
                    {displayName || "No name set"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <p className="text-sm w-full text-muted-foreground border-b border-transparent">
                  {user?.bio || "No bio yet."}
                </p>
                {avatarError && (
                  <p className="text-sm text-destructive">{avatarError}</p>
                )}
              </>
            )}
          </div>

          <div className="order-2 ml-auto sm:order-3 sm:ml-0 flex gap-2 shrink-0">
            {isEditing ? (
              <>
                <Button
                  size="icon-sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  aria-label="Save profile"
                  title="Save"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  aria-label="Cancel editing profile"
                  title="Cancel"
                >
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Settings className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="cursor-pointer"
                  >
                    <Pencil className="size-4 mr-2" /> Edit profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="mt-5 pt-5 border-t flex gap-6">
          <div className="flex flex-col">
            <span className="text-xl font-bold">{user?.totalGames ?? 0}</span>
            <span className="text-xs text-muted-foreground">Games</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">
              {user?.gamesThisMonth ?? 0}
            </span>
            <span className="text-xs text-muted-foreground">This Month</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">
              {user?.isVerified ? "Verified" : "Unverified"}
            </span>
            <span className="text-xs text-muted-foreground">Status</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">My Games</h2>
        {isLoadingGames ? (
          <p className="text-sm text-muted-foreground">Loading games...</p>
        ) : gamesError ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">{gamesError}</p>
            <Button variant="outline" onClick={() => loadGames()}>
              Retry
            </Button>
          </div>
        ) : games.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You do not have any games yet.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {games.map((game) => (
                <div
                  key={game.gameId}
                  className={cn(
                    "group rounded-xl border bg-card overflow-hidden transition-all duration-300",
                    "ring-1 ring-black/5 dark:ring-white/5",
                    !game.isDeleted && "hover:shadow-md hover:ring-2 hover:ring-primary/30 hover:-translate-y-0.5",
                  )}
                >
                  {(() => {
                    const cardBody = (
                      <>
                        <div className="h-36 relative overflow-hidden">
                          {game.thumbnail ? (
                            <img
                              src={game.thumbnail}
                              alt={game.title}
                              className={`absolute inset-0 w-full h-full object-cover${game.isDeleted ? " opacity-60" : ""}`}
                            />
                          ) : (
                            <>
                              <div
                                className={cn(
                                  "absolute inset-0 bg-linear-to-br opacity-60",
                                  gradientByType[game.type],
                                  game.isDeleted && "opacity-40",
                                )}
                              />
                              <div className="absolute inset-0 bg-muted/40 dark:bg-muted/60" />
                              <div
                                className={cn(
                                  "absolute inset-0 flex items-center justify-center text-4xl select-none",
                                  game.isDeleted ? "opacity-40" : "opacity-60",
                                )}
                              >
                                {gameEmoji[game.type]}
                              </div>
                            </>
                          )}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {game.isDeleted && (
                              <Badge variant="destructive" className="text-xs">
                                Deleted
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {visibilityLabel[game.visibility]}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-3 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm truncate">
                              {game.title}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {gameTypeLabel[game.type]}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Gamepad2 className="size-3" />
                              {game.playCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" />
                              {game.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="size-3" />
                              {game.likeCount}
                            </span>
                            <span className="flex items-center gap-1 ml-auto">
                              <Clock className="size-3" />
                              {new Date(game.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                    return game.isDeleted ? (
                      <div className="block">{cardBody}</div>
                    ) : (
                      <Link to={getEditPath(game)} className="block">{cardBody}</Link>
                    );
                  })()}

                  <div className="flex items-center gap-2 px-3 pb-3 border-t border-border/50 pt-2 mx-3">
                    {game.isDeleted ? (
                      <button
                        onClick={() => handleRestoreGame(game.gameId)}
                        disabled={restoringGameId === game.gameId}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Undo2 className="size-3" />
                        {restoringGameId === game.gameId ? "Restoring..." : "Restore"}
                      </button>
                    ) : (
                      <>
                        <span className="text-[10px] text-muted-foreground">
                          Click to edit
                        </span>
                        <Popover
                          open={openDeletePopoverId === game.gameId}
                          onOpenChange={(open) =>
                            setOpenDeletePopoverId(open ? game.gameId : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors ml-auto cursor-pointer">
                              <Trash2 className="size-3" />
                              Delete
                            </button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <p className="text-sm font-medium mb-1">Delete this game?</p>
                            <p className="text-xs text-muted-foreground mb-3">
                              It will be hidden. You can restore it later.
                            </p>
                            <div className="flex justify-end gap-2">
                              <PopoverClose asChild>
                                <Button variant="outline" size="sm" style={{ cursor: "pointer" }}>Cancel</Button>
                              </PopoverClose>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteGame(game.gameId)}
                                disabled={deletingGameId === game.gameId}
                                style={{ cursor: "pointer" }}
                              >
                                {deletingGameId === game.gameId ? "Deleting..." : "Delete"}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {gameActionError && (
              <p className="text-sm text-destructive">{gameActionError}</p>
            )}
            {nextCursor && (
              <Button
                variant="outline"
                onClick={() => loadGames(nextCursor)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">My Gifts</h2>
        {isLoadingGifts ? (
          <p className="text-sm text-muted-foreground">Loading gifts...</p>
        ) : giftsError ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">{giftsError}</p>
            <Button variant="outline" onClick={() => loadGifts()}>
              Retry
            </Button>
          </div>
        ) : gifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have not generated any gifts yet.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {gifts.map((gift) => (
                <div
                  key={gift.giftId}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">🎁</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        For {gift.recipientName}
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          · {gift.occasion}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(gift.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {gift.status === "GENERATING" && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Loader2 className="size-3 animate-spin" />
                        Generating
                      </Badge>
                    )}
                    {gift.status === "ERROR" && (
                      <Badge variant="destructive" className="text-xs">
                        Failed
                      </Badge>
                    )}
                    {gift.status === "READY" && (
                      <Link
                        to={`/gift/${gift.giftId}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {giftsNextCursor && (
              <Button
                variant="outline"
                onClick={() => loadGifts(giftsNextCursor)}
                disabled={isLoadingMoreGifts}
              >
                {isLoadingMoreGifts ? "Loading..." : "Load more"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
