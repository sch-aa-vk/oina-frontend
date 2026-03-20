import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Recipient, GameTheme } from "./types";

interface PreviewModalShellProps {
  recipient: Recipient;
  personalMessage: string;
  showMessage: boolean;
  /** e.g. "2 / 5" */
  progress: string;
  /** 0–100 */
  progressPercent: number;
  theme: GameTheme;
  onClose: () => void;
  children: React.ReactNode;
  /** Max width class for the modal, default "max-w-sm" */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={cn(
          "bg-background rounded-3xl border border-border shadow-2xl w-full overflow-hidden",
          maxWidth
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Preview
            </p>
            <p className="text-sm font-semibold">
              {recipient.name ? `A game for ${recipient.name}` : "Your game"}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {progress}
          </Badge>
        </div>

        {/* Personal message — only shown on first item */}
        {personalMessage && showMessage && (
          <div
            className={cn(
              "mx-5 mt-4 px-4 py-3 rounded-2xl border",
              theme.messageBg,
              theme.messageBorder
            )}
          >
            <p className={cn("text-xs font-medium mb-1", theme.messageLabel)}>
              A message for you 💌
            </p>
            <p className={cn("text-sm", theme.messageBody)}>
              {personalMessage}
            </p>
          </div>
        )}

        {/* Game-specific content */}
        {children}

        {/* Progress bar */}
        <div className="px-6 pb-3">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-linear-to-r transition-all duration-500",
                theme.progressGradient
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Close button */}
        <div className="px-6 pb-5">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl"
          >
            Close preview
          </Button>
        </div>
      </div>
    </div>
  );
}
 