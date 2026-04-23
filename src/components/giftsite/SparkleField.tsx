import type { SparkleItem } from "../../types/giftSite";

interface SparkleFieldProps {
  sparkles: SparkleItem[];
}

export default function SparkleField({ sparkles }: SparkleFieldProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute -top-[10%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(148,163,184,0.2)_60%,transparent_100%)] opacity-0 filter-[drop-shadow(0_0_8px_rgba(148,163,184,0.25))] animate-float-sparkle"
          style={{
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration,
          }}
        />
      ))}
    </div>
  );
}
