import { Eye, Gift, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepBadge } from "./StepBadge";
import type { GameTheme } from "./types";

interface GameTopBarProps {
  step: number;
  onStepChange: (step: number) => void;
  stepLabels: string[];
  previewDisabled?: boolean;
  onPreview: () => void;
  canPublish: boolean;
  onPublish?: () => void;
  isPublishing?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  saveSuccess?: boolean;
  isPublished?: boolean;
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
  onSave,
  isSaving = false,
  saveSuccess = false,
  isPublished = false,
  theme,
}: GameTopBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto px-3 sm:px-6 h-12 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-3">
            {stepLabels.map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} className="flex items-center gap-1.5 sm:gap-3">
                  <button onClick={() => onStepChange(s)}>
                    <StepBadge step={s} label={label} current={step} />
                  </button>
                  {i < stepLabels.length - 1 && (
                    <div className="w-3 sm:w-6 h-px bg-border hidden xs:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 sm:h-9 w-8 sm:w-auto px-0 sm:px-3"
              disabled={isSaving}
              onClick={onSave}
            >
              {saveSuccess ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isSaving
                  ? isPublished ? "Updating…" : "Saving…"
                  : saveSuccess
                  ? isPublished ? "Updated" : "Saved"
                  : isPublished ? "Update" : "Save"}
              </span>
            </Button>
          )}
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

          {isPublished ? null : (
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
