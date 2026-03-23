import { useState } from "react";
import { Camera, Pencil, Check, X, Gamepad2, Clock, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const myGames = [
  {
    id: 1,
    name: "Space Shooter",
    plays: 1240,
    stars: 48,
    image: "/images/template-1.jpg",
    updatedAt: "2 days ago",
  },
  {
    id: 2,
    name: "Platformer",
    plays: 870,
    stars: 31,
    image: "/images/trending-1.jpg",
    updatedAt: "1 week ago",
  },
  {
    id: 3,
    name: "Puzzle Game",
    plays: 3100,
    stars: 102,
    image: "/images/template-1.jpg",
    updatedAt: "3 weeks ago",
  },
];

export default function Profile() {
  const { user } = useAuth();

  const displayName = user?.displayName || user?.username || "";
  const initials = displayName.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "??";

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(displayName);
  const [tempBio, setTempBio] = useState(user?.bio || "");

  const handleEdit = () => {
    setTempName(displayName);
    setTempBio(user?.bio || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: call profile update API when available
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Profile Card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="size-24 ring-2 ring-border">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow hover:scale-110 transition-transform">
              <Camera className="size-3" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col gap-3">
            {isEditing ? (
              <>
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="text-lg font-semibold h-9 max-w-xs"
                  placeholder="Your name"
                />
                <Input
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="text-sm h-9"
                  placeholder="Short bio"
                />
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
              </>
            )}
          </div>

          {/* Edit / Save / Cancel */}
          <div className="flex gap-2 shrink-0">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  <Check className="size-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="size-4 mr-1" /> Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Pencil className="size-4 mr-1" /> Edit
              </Button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 pt-5 border-t flex gap-6">
          <div className="flex flex-col">
            <span className="text-xl font-bold">{user?.totalGames ?? 0}</span>
            <span className="text-xs text-muted-foreground">Games</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">{user?.gamesThisMonth ?? 0}</span>
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

      {/* My Games */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Games</h2>
        <div className="grid grid-cols-3 gap-4">
          {myGames.map((game) => (
            <div
              key={game.id}
              className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Thumbnail */}
              <div
                className="h-36 bg-muted/50 relative"
                style={{
                  backgroundImage: `url(${game.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="text-xs">
                    <Pencil className="size-3 mr-1" /> Edit
                  </Button>
                </div>
              </div>
              {/* Info */}
              <div className="p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{game.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    Published
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Gamepad2 className="size-3" />
                    {game.plays.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="size-3" />
                    {game.stars}
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Clock className="size-3" />
                    {game.updatedAt}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
