import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recipient } from "@/components/game";
import { GamePlay } from "@/components/game/choose-me";
import type { Question, GameOutcome } from "@/components/game/choose-me";

interface PreviewState {
  questions: Question[];
  outcomes: GameOutcome[];
  recipient: Recipient;
  personalMessage: string;
  shuffle: boolean;
}

export default function ChooseMePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PreviewState | null;

  if (!state?.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No preview available.</p>
      </div>
    );
  }

  const { questions, outcomes, recipient, personalMessage, shuffle } = state;

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
            {recipient.name ? `A game for ${recipient.name}` : "Your Choose Me game"}
          </p>
        </div>
      </div>

      <GamePlay
        questions={questions}
        outcomes={outcomes}
        recipient={recipient}
        personalMessage={personalMessage}
        shuffle={shuffle}
      />
    </div>
  );
}
