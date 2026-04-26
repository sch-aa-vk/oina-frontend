import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recipient } from "@/components/game";
import { GamePlay } from "@/components/game/guess-by-emoji";
import type { EmojiPuzzle } from "@/components/game/guess-by-emoji";

interface PreviewState {
  puzzles: EmojiPuzzle[];
  recipient: Recipient;
  personalMessage: string;
  showAnswers: boolean;
}

export default function GuessByEmojiPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PreviewState | null;

  if (!state?.puzzles?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No preview available.</p>
      </div>
    );
  }

  const { puzzles, recipient, personalMessage, showAnswers } = state;

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
            {recipient.name ? `A game for ${recipient.name}` : "Your Guess by Emoji game"}
          </p>
        </div>
      </div>

      <GamePlay
        puzzles={puzzles}
        recipient={recipient}
        personalMessage={personalMessage}
        showAnswers={showAnswers ?? false}
      />
    </div>
  );
}
