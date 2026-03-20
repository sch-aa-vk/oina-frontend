import { ChevronLeft, Eye, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepBadge } from "./StepBadge";
import type { GameTheme } from "./types";

interface GameTopBarProps {
  /** Current active step (1–3) */
  step: number;
  onStepChange: (step: number) => void;
  stepLabels: [string, string, string];
  /** Whether the preview button should be disabled */
  previewDisabled?: boolean;
  onPreview: () => void;
  canPublish: boolean;
  theme: GameTheme;
}

export function GameTopBar({
  step,
  onStepChange,
  stepLabels,
  previewDisabled = false,
  onPreview,
  canPublish,
  theme,
}: GameTopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: back + steps */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground -ml-2"
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:block">Games</span>
          </Button>

          <div className="flex items-center gap-3">
            {([1, 2, 3] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <button onClick={() => onStepChange(s)}>
                  <StepBadge step={s} label={stepLabels[i]} current={step} />
                </button>
                {i < 2 && (
                  <div className="w-6 h-px bg-border hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: preview + continue/publish */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9"
            disabled={previewDisabled}
            onClick={onPreview}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          {step < 3 ? (
            <Button
              size="sm"
              className="h-9"
              onClick={() => onStepChange(step + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!canPublish}
              className={cn(
                "h-9 gap-1.5 bg-linear-to-r text-white border-0",
                theme.topBarPublishGradient
              )}
            >
              <Gift className="w-4 h-4" />
              Publish game
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
