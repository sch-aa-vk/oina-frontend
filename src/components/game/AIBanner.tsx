import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameTheme } from "./Types";

interface AiBannerProps {
  recipientName: string;
  theme: GameTheme;
  /** Main title line, e.g. "AI can craft personalized questions for {name}" */
  title?: (name: string) => string;
  /** Subtitle line */
  subtitle?: string;
}

export function AiBanner({
  recipientName,
  theme,
  title = (name) =>
    `AI can craft personalized content for ${name || "your recipient"}`,
  subtitle = "Tell us about them and we'll generate fun, meaningful suggestions",
}: AiBannerProps) {
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl border bg-linear-to-r",
        theme.teaserBorder,
        theme.teaserBg
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-xl bg-linear-to-br flex items-center justify-center shrink-0",
          theme.teaserIcon
        )}
      >
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", theme.teaserTitle)}>
          {title(recipientName)}
        </p>
        <p className={cn("text-xs mt-0.5", theme.teaserBody)}>{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className={cn(
            "h-8 text-xs bg-linear-to-r text-white border-0 gap-1.5",
            theme.bannerGradient
          )}
        >
          <Sparkles className="w-3 h-3" />
          Generate
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className={cn("text-lg leading-none", theme.teaserBody)}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
