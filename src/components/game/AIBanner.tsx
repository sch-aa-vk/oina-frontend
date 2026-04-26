import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameTheme } from "./types";

interface AiBannerProps {
  recipientName: string;
  theme: GameTheme;
  title?: (name: string) => string;
  subtitle?: string;
  onGenerate?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string | null;
  showCloseButton?: boolean;
}

export function AiBanner({
  recipientName,
  theme,
  title = (name) =>
    `AI can craft personalized content for ${name || "your recipient"}`,
  subtitle = "Tell us about them and we'll generate fun, meaningful suggestions",
  onGenerate,
  isLoading = false,
  disabled = false,
  error,
  showCloseButton = true,
}: AiBannerProps) {
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed) return null;

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl sm:rounded-2xl border bg-linear-to-r relative justify-between",
          theme.teaserBorder,
          theme.teaserBg,
        )}
      >
        {showCloseButton && (
          <button
            onClick={() => setDismissed(true)}
            className={cn(
              "absolute top-2.5 right-3 sm:static sm:order-last text-lg leading-none p-1",
              theme.teaserBody,
            )}
          >
            &times;
          </button>
        )}

        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-lg sm:rounded-xl bg-linear-to-br flex items-center justify-center shrink-0",
              theme.teaserIcon,
            )}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1 min-w-0 pr-6 sm:pr-0">
            <p
              className={cn(
                "text-xs sm:text-sm font-medium leading-snug",
                theme.teaserTitle,
              )}
            >
              {title(recipientName)}
            </p>
            <p
              className={cn(
                "text-[11px] sm:text-xs mt-0.5 leading-snug",
                theme.teaserBody,
              )}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {onGenerate && (
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={disabled || isLoading}
            className={cn(
              "h-8 text-xs bg-linear-to-r text-white border-0 gap-1.5 w-full sm:w-auto shrink-0",
              theme.bannerGradient,
            )}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {isLoading ? "Generating…" : "Generate"}
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-destructive px-1">{error}</p>}
    </div>
  );
}
