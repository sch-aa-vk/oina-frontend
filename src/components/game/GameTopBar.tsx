import { ChevronLeft, Eye, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepBadge } from "./StepBadge";
import type { GameTheme } from "./types";

interface GameTopBarProps {
  step: number;
  onStepChange: (step: number) => void;
  stepLabels: [string, string, string];
  previewDisabled?: boolean;
  onPreview: () => void;
  canPublish: boolean;
  onPublish?: () => void;
  isPublishing?: boolean;
  theme: GameTheme;
}

export function GameTopBar({
  step,
  onStepChange,
  stepLabels,
  previewDisabled = false,
  onPreview,
  canPublish,
  onPublish,
  isPublishing = false,
  theme,
}: GameTopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 h-12 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: back + steps */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground -ml-1 sm:-ml-2 shrink-0 h-8 sm:h-9 w-8 sm:w-auto px-0 sm:px-3"
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:block">Games</span>
          </Button>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {([1, 2, 3] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 sm:gap-3">
                <button onClick={() => onStepChange(s)}>
                  <StepBadge step={s} label={stepLabels[i]} current={step} />
                </button>
                {i < 2 && (
                  <div className="w-3 sm:w-6 h-px bg-border hidden xs:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: preview + continue/publish */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 sm:h-9 w-8 sm:w-auto px-0 sm:px-3"
            disabled={previewDisabled}
            onClick={onPreview}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          {step < 3 ? (
            <Button
              size="sm"
              className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
              onClick={() => onStepChange(step + 1)}
            >
              <span className="sm:hidden">Next</span>
              <span className="hidden sm:inline">Continue</span>
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!canPublish || isPublishing}
              onClick={onPublish}
              className={cn(
                "h-8 sm:h-9 gap-1 sm:gap-1.5 bg-linear-to-r text-white border-0 text-xs sm:text-sm px-3 sm:px-4",
                theme.topBarPublishGradient
              )}
            >
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">
                {isPublishing ? "..." : "Publish"}
              </span>
              <span className="hidden sm:inline">
                {isPublishing ? "Publishing..." : "Publish game"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
