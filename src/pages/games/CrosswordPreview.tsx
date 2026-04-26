import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CROSSWORD_THEME } from "@/components/game";
import type { Recipient } from "@/components/game";
import {
  InteractivePreviewGrid,
  ClueList,
} from "@/components/game/crossword";
import type { CrosswordGrid } from "@/components/game/crossword";

interface PreviewState {
  grid: CrosswordGrid;
  recipient: Recipient;
  personalMessage: string;
}

export default function CrosswordPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PreviewState | null;

  if (!state?.grid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No preview available.</p>
      </div>
    );
  }

  const { grid, recipient, personalMessage } = state;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
            Preview
          </p>
          <p className="text-xs sm:text-sm font-semibold truncate">
            {recipient.name ? `A crossword for ${recipient.name}` : "Your crossword"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
        {personalMessage && (
          <div
            className={cn(
              "px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border",
              CROSSWORD_THEME.messageBg,
              "border-border",
            )}
          >
            <p
              className={cn(
                "text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1",
                CROSSWORD_THEME.messageLabel,
              )}
            >
              A message for you 💌
            </p>
            <p
              className={cn(
                "text-xs sm:text-sm leading-snug",
                CROSSWORD_THEME.messageBody,
              )}
            >
              {personalMessage}
            </p>
          </div>
        )}

        <div>
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2 sm:mb-3">
            Click a cell, then type. Click again to switch direction.
          </p>
          <InteractivePreviewGrid grid={grid} />
        </div>

        <div className="pt-3 sm:pt-4 border-t border-border">
          <p className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Clues</p>
          <ClueList placedWords={grid.placedWords} />
        </div>
      </div>
    </div>
  );
}
