import { cn } from "@/lib/utils";
import { CROSSWORD_THEME } from "@/components/game";
import type { Recipient } from "@/components/game";
import { InteractivePreviewGrid } from "./InteractivePreviewGrid";
import { ClueList } from "./ClueList";
import type { CrosswordGrid } from "./types";

interface PreviewModalProps {
  grid: CrosswordGrid;
  recipient: Recipient;
  personalMessage: string;
  onClose: () => void;
}

export function PreviewModal({
  grid,
  recipient,
  personalMessage,
}: PreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-t-2xl sm:rounded-3xl border border-border shadow-2xl w-full sm:max-w-5xl max-h-[90dvh] sm:max-h-[88vh] overflow-y-auto">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              Preview
            </p>
            <p className="text-xs sm:text-sm font-semibold truncate">
              {recipient.name
                ? `A crossword for ${recipient.name}`
                : "Your crossword"}
            </p>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {personalMessage && (
            <div
              className={cn(
                "px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border",
                CROSSWORD_THEME.messageBg,
                "border-border"
              )}
            >
              <p
                className={cn(
                  "text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1",
                  CROSSWORD_THEME.messageLabel
                )}
              >
                A message for you 💌
              </p>
              <p
                className={cn(
                  "text-xs sm:text-sm leading-snug",
                  CROSSWORD_THEME.messageBody
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
            <p className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
              Clues
            </p>
            <ClueList placedWords={grid.placedWords} />
          </div>
        </div>
      </div>
    </div>
  );
}
