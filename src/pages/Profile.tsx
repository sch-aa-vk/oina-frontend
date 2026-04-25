import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { usersService } from "@/services/users";
import type { AvatarContentType } from "@/services/users";
import type { GameResponse } from "@/types/games";

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
  const [tempUsername, setTempUsername] = useState(user?.username || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [games, setGames] = useState<GameResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [gamesError, setGamesError] = useState<string>("");
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const handleEdit = () => {
    setTempName(displayName);
    setTempBio(user?.bio || "");
    setTempUsername(user?.username || "");
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
        username: tempUsername || undefined,
      });
      const newUser = { ...user!, ...updated };
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
      const { presignedUrl, avatarUrl } = await usersService.uploadAvatar(
        file.type as AvatarContentType
      );
      await usersService.putFileToS3(presignedUrl, file);
      const newUser = { ...user!, avatarUrl };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (err) {
      setAvatarError(usersService.mapError(err).message);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const loadGames = async (cursor?: string) => {
    if (cursor) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingGames(true);
    }

    try {
      setGamesError("");
      const response = await gamesService.listGames(cursor);
      setGames((prev) =>
        cursor ? [...prev, ...response.games] : response.games
      );
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
      try {
        const fresh = await usersService.getMe();
        setUser(fresh);
        localStorage.setItem("user", JSON.stringify(fresh));
      } catch {
        // keep stale context data on error
      }
    };
    loadProfile();
    loadGames();
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

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-6">
          <div className="relative shrink-0">
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

          <div className="flex-1 flex flex-col gap-3">
            {isEditing ? (
              <>
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="text-lg font-semibold h-9 max-w-xs"
                  placeholder="Display name"
                />
                <Input
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="text-sm h-9 max-w-xs"
                  placeholder="Username"
                />
                <Input
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="text-sm h-9"
                  placeholder="Short bio"
                />
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-semibold">
                    {displayName || "No name set"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.bio || "No bio yet."}
                </p>
                {avatarError && (
                  <p className="text-sm text-destructive">{avatarError}</p>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="size-4 mr-1" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="size-4 mr-1" /> Cancel
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
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    <Pencil className="size-4 mr-2" /> Edit profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
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
                <Link
                  key={game.gameId}
                  to={`/games/${game.gameId}`}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-36 bg-linear-to-br from-primary/20 to-primary/5 relative p-4">
                    <p className="text-4xl">{gameEmoji[game.type]}</p>
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 text-xs"
                    >
                      {visibilityLabel[game.visibility]}
                    </Badge>
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
                </Link>
              ))}
            </div>

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
    </div>
  );
}
