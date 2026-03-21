import { useState } from "react";
import {
  RefreshCw,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GridPreview } from "./GridPreview";
import { ClueList } from "./ClueList";
import { MIN_WORDS } from "./types";
import type { CrosswordGrid } from "./types";

interface MobileGridPanelProps {
  grid: CrosswordGrid | null;
  isBuilding: boolean;
  validWordCount: number;
  placedWordCount: number;
  skippedCount: number;
  onRebuild: () => void;
}

export function MobileGridPanel({
  grid,
  isBuilding,
  validWordCount,
  placedWordCount,
  skippedCount,
  onRebuild,
}: MobileGridPanelProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="lg:hidden rounded-xl border border-border bg-background overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Grid3X3 className="w-3.5 h-3.5" />
          Grid preview
          {grid && (
            <Badge variant="secondary" className="text-[10px] ml-1">
              {placedWordCount} placed
            </Badge>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border/50">
          <div className="pt-3">
            {isBuilding && (
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <p className="text-[10px]">Building grid…</p>
              </div>
            )}
            {!isBuilding && grid && (
              <div className="space-y-2.5">
                <GridPreview grid={grid} size="sm" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">
                    {placedWordCount} placed
                  </Badge>
                  {skippedCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                    >
                      {skippedCount} skipped
                    </Badge>
                  )}
                  {validWordCount >= MIN_WORDS && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 text-[10px] text-muted-foreground ml-auto px-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRebuild();
                      }}
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Rebuild
                    </Button>
                  )}
                </div>
                {skippedCount > 0 && (
                  <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                    Some words couldn't intersect. Try shared letters.
                  </p>
                )}
              </div>
            )}
            {!isBuilding && !grid && validWordCount < MIN_WORDS && (
              <div className="flex flex-col items-center justify-center py-6 gap-1.5 text-center text-muted-foreground">
                <Grid3X3 className="w-6 h-6 opacity-20" />
                <p className="text-[10px]">
                  Add at least {MIN_WORDS} complete words
                </p>
              </div>
            )}
            {!isBuilding && !grid && validWordCount >= MIN_WORDS && (
              <div className="flex flex-col items-center justify-center py-6 gap-1.5 text-center text-muted-foreground">
                <AlertCircle className="w-5 h-5 opacity-40" />
                <p className="text-[10px]">
                  Couldn't arrange words. Try sharing more letters.
                </p>
              </div>
            )}
          </div>
          {grid && (
            <div className="pt-2.5 border-t border-border/50">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Clues
              </p>
              <ClueList placedWords={grid.placedWords} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
