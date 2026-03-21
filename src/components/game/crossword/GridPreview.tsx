import { cn } from "@/lib/utils";
import type { CrosswordGrid } from "./types";

export function GridPreview({
  grid,
  size = "md",
}: {
  grid: CrosswordGrid;
  size?: "sm" | "md";
}) {
  const cellSize = size === "sm" ? 20 : 28,
    fontSize = size === "sm" ? 7 : 10,
    numSize = size === "sm" ? 5 : 7;
  return (
    <div className="overflow-auto -mx-1 px-1">
      <div
        className="inline-grid gap-px bg-border rounded-lg sm:rounded-xl overflow-hidden border border-border"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)` }}
      >
        {grid.cells.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={cn(
                "relative flex items-center justify-center select-none",
                cell.isBlack ? "bg-foreground" : "bg-background"
              )}
              style={{ width: cellSize, height: cellSize }}
            >
              {!cell.isBlack && (
                <>
                  {cell.number !== undefined && (
                    <span
                      className="absolute top-0 left-0.5 text-primary font-bold leading-none"
                      style={{ fontSize: numSize }}
                    >
                      {cell.number}
                    </span>
                  )}
                  <span
                    className="font-bold text-foreground"
                    style={{ fontSize }}
                  >
                    {cell.letter}
                  </span>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
