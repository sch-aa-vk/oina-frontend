import { Plus, Eye, Sparkles, TrendingUp, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateGame {
  id: number;
  name: string;
  emoji: string;
  description: string;
  route: string;
  gradient: string;
  accentBg: string;
  tag: string;
}

interface TrendingGame {
  id: number;
  name: string;
  author: string;
  emoji: string;
  plays: number;
  gradient: string;
  image?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const templateGames: TemplateGame[] = [
  {
    id: 1,
    name: "Choose Me",
    emoji: "🎯",
    description: "Multiple choice questions that reveal how well they know you",
    route: "/create/choose-me",
    gradient: "from-violet-400 via-purple-500 to-indigo-500",
    accentBg: "bg-violet-50 dark:bg-violet-950/30",
    tag: "Most loved",
  },
  {
    id: 2,
    name: "Guess by Emoji",
    emoji: "😄",
    description: "Hide a word, phrase, or memory inside a string of emojis",
    route: "/create/guess-by-emoji",
    gradient: "from-amber-400 via-orange-400 to-rose-400",
    accentBg: "bg-amber-50 dark:bg-amber-950/30",
    tag: "Super fun",
  },
  {
    id: 3,
    name: "Crossword",
    emoji: "📝",
    description:
      "Craft a crossword full of words that mean something to you both",
    route: "/create/crossword",
    gradient: "from-emerald-400 via-teal-400 to-cyan-500",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/30",
    tag: "Thoughtful",
  },
];

const trendingGames: TrendingGame[] = [
  {
    id: 1,
    name: "Choose Me",
    author: "john_dev",
    emoji: "🎯",
    plays: 1243,
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    id: 2,
    name: "Guess by Emoji",
    author: "anna_k",
    emoji: "😄",
    plays: 987,
    gradient: "from-amber-500 to-rose-500",
  },
  {
    id: 3,
    name: "Crossword",
    author: "mike_g",
    emoji: "📝",
    plays: 754,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: 4,
    name: "Choose Me",
    author: "sarah_m",
    emoji: "🎯",
    plays: 622,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: 5,
    name: "Guess by Emoji",
    author: "leo_x",
    emoji: "😄",
    plays: 489,
    gradient: "from-sky-500 to-blue-500",
  },
  {
    id: 6,
    name: "Crossword",
    author: "priya_s",
    emoji: "📝",
    plays: 401,
    gradient: "from-purple-500 to-violet-500",
  },
];

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ game }: { game: TemplateGame }) {
  const navigate = useNavigate();

  return (
    <div className="group flex flex-col gap-3">
      {/* Visual tile */}
      <div
        className={cn(
          "relative h-44 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
          "ring-1 ring-black/5 dark:ring-white/5",
          "group-hover:ring-2 group-hover:ring-primary/40 group-hover:shadow-xl group-hover:-translate-y-1"
        )}
      >
        {/* Gradient background */}
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-br opacity-90",
            game.gradient
          )}
        />

        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
              radial-gradient(circle at 50% 50%, white 0.5px, transparent 0.5px)`,
            backgroundSize: "40px 40px, 60px 60px, 20px 20px",
          }}
        />

        {/* Emoji */}
        <div className="absolute top-4 left-4 text-4xl drop-shadow-sm select-none">
          {game.emoji}
        </div>

        {/* Tag badge */}
        <div className="absolute top-4 right-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {game.tag}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Create button */}
        <button
          onClick={() => navigate(game.route)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          aria-label={`Create ${game.name} game`}
        >
          <div className="flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" />
            Create
          </div>
        </button>

        {/* AI sparkle indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/70 text-xs">
          <Sparkles className="w-3 h-3" />
          <span>AI-powered</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5 space-y-0.5">
        <p className="text-sm font-semibold">{game.name}</p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {game.description}
        </p>
      </div>
    </div>
  );
}

// ─── Trending Card ────────────────────────────────────────────────────────────

function TrendingCard({ game }: { game: TrendingGame }) {
  const navigate = useNavigate();

  const formattedPlays =
    game.plays >= 1000
      ? `${(game.plays / 1000).toFixed(1)}k`
      : game.plays.toString();

  return (
    <div className="group flex flex-col gap-3">
      {/* Visual tile */}
      <div
        className={cn(
          "relative h-40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
          "ring-1 ring-black/5 dark:ring-white/5",
          "group-hover:ring-2 group-hover:ring-primary/30 group-hover:shadow-lg group-hover:-translate-y-0.5"
        )}
      >
        {/* Gradient background — muted version */}
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-br opacity-60",
            game.gradient
          )}
        />
        <div className="absolute inset-0 bg-muted/40 dark:bg-muted/60" />

        {/* Emoji */}
        <div className="absolute inset-0 flex items-center justify-center text-5xl select-none opacity-60 group-hover:opacity-40 transition-opacity">
          {game.emoji}
        </div>

        {/* Plays badge */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-background/70 backdrop-blur-sm text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            {formattedPlays}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* View button */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => navigate(`/game/${game.id}`)}
            className="flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
            aria-label={`View ${game.name}`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{game.name}</p>
          <p className="text-xs text-muted-foreground">by {game.author}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

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
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold">{title}</h2>
            {badge && (
              <Badge variant="secondary" className="text-xs font-normal">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="space-y-6 pb-8">
      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-pink-600 p-6 text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10 blur-xl" />

        <div className="relative space-y-3">
          <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            AI-powered mini-games
          </div>
          <h1 className="text-2xl font-bold leading-snug">
            Create a game for
            <br />
            someone you love 🎁
          </h1>
          <p className="text-white/70 text-sm max-w-xs leading-relaxed">
            Pick a template, personalize with AI, and share a unique game your
            recipient will never forget.
          </p>
        </div>
      </div>

      {/* Templates section */}
      <section className="rounded-2xl bg-muted/40 dark:bg-muted/20 p-5">
        <SectionHeader
          icon={Layers}
          title="Templates"
          subtitle="Start from a game type and make it yours"
          badge={`${templateGames.length} types`}
        />
        <div className="grid grid-cols-3 gap-4">
          {templateGames.map((game) => (
            <TemplateCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Trending section */}
      <section className="rounded-2xl bg-muted/40 dark:bg-muted/20 p-5">
        <SectionHeader
          icon={TrendingUp}
          title="Trending"
          subtitle="Games others are playing right now"
          badge="Community"
        />
        <div className="grid grid-cols-3 gap-4">
          {trendingGames.map((game) => (
            <TrendingCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
