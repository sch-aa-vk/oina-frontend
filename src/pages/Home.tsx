import { Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const templateGames = [
  { id: 1, name: "Choose me", image: "/images/template-1.jpg" },
  { id: 2, name: "Guess by emoji", image: "/images/trending-1.jpg" },
  { id: 3, name: "Crossword", image: "/images/template-1.jpg" },
];

const trendingGames = [
  {
    id: 1,
    name: "Choose me",
    author: "john_dev",
    image: "/images/trending-1.jpg",
  },
  {
    id: 2,
    name: "Guess by emoji",
    author: "anna_k",
    image: "/images/template-1.jpg",
  },
  {
    id: 3,
    name: "Crossword",
    author: "mike_g",
    image: "/images/trending-1.jpg",
  },
  {
    id: 4,
    name: "Choose me",
    author: "john_dev",
    image: "/images/trending-1.jpg",
  },
  {
    id: 5,
    name: "Guess by emoji",
    author: "anna_k",
    image: "/images/template-1.jpg",
  },
  {
    id: 6,
    name: "Crossword",
    author: "mike_g",
    image: "/images/trending-1.jpg",
  },
];

function TemplateCard({ name, image }: { name: string; image: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative h-40 rounded-xl overflow-hidden bg-muted/50 group cursor-pointer"
        style={{ backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* + button */}
        <button
          onClick={() => navigate("/builder")}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
            <Plus className="size-5 text-black" />
          </div>
        </button>
      </div>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

function TrendingCard({ name, author, image }: { name: string; author: string; image: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative h-40 rounded-xl overflow-hidden bg-muted/50 group cursor-pointer"
        style={{ backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Play / View buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* <button
            onClick={() => navigate(`/play/${name}`)}
            className="bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
          >
            <Play className="size-4 text-black" />
          </button> */}
          <button
            onClick={() => navigate(`/game/${name}`)}
            className="bg-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
          >
            <Eye className="size-4 text-black" />
          </button>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">by {author}</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="rounded-xl bg-muted/50 p-4">
        <h2 className="text-lg font-semibold mb-4">Templates</h2>
        <div className="grid grid-cols-3 gap-4">
          {templateGames.map((game) => (
            <TemplateCard key={game.id} name={game.name} image={game.image} />
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-muted/50 p-4">
        <h2 className="text-lg font-semibold mb-4">
          Trending (games from other authors)
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {trendingGames.map((game) => (
            <TrendingCard key={game.id} name={game.name} author={game.author} image={game.image} />
          ))}
        </div>
      </section>
    </>
  );
}
