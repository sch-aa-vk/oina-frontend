import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Recipient, GameTheme } from "./types";

interface PreviewModalShellProps {
  recipient: Recipient;
  personalMessage: string;
  showMessage: boolean;
  progress: string;
  progressPercent: number;
  theme: GameTheme;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function PreviewModalShell({
  recipient,
  personalMessage,
  showMessage,
  progress,
  progressPercent,
  theme,
  onClose,
  children,
  maxWidth = "max-w-sm",
}: PreviewModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={cn(
          "bg-background rounded-t-2xl sm:rounded-3xl border border-border shadow-2xl w-full max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden",
          maxWidth
        )}
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              Preview
            </p>
            <p className="text-xs sm:text-sm font-semibold truncate">
              {recipient.name ? `A game for ${recipient.name}` : "Your game"}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="text-[10px] sm:text-xs shrink-0"
          >
            {progress}
          </Badge>
        </div>

        {personalMessage && showMessage && (
          <div
            className={cn(
              "mx-3 sm:mx-5 mt-3 sm:mt-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border",
              theme.messageBg,
              theme.messageBorder
            )}
          >
            <p
              className={cn(
                "text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1",
                theme.messageLabel
              )}
            >
              A message for you 💌
            </p>
            <p
              className={cn(
                "text-xs sm:text-sm leading-snug",
                theme.messageBody
              )}
            >
              {personalMessage}
            </p>
          </div>
        )}

        {children}

        <div className="px-4 sm:px-6 pb-2.5 sm:pb-3">
          <div className="w-full h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-linear-to-r transition-all duration-500",
                theme.progressGradient
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-5">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl h-10 sm:h-11 text-sm"
          >
            Close preview
          </Button>
        </div>
      </div>
    </div>
  );
}
