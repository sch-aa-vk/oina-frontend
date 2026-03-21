import { Eye, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { GameTheme } from "./types";
import type { Recipient } from "./types";

interface PublishStepProps {
  recipient: Recipient;
  gameTitle: string;
  onGameTitleChange: (title: string) => void;
  canPublish: boolean;
  missingFields: string[];
  onPublish: () => void;
  onPreview: () => void;
  previewDisabled?: boolean;
  onBack: () => void;
  backLabel?: string;
  theme: GameTheme;
  titlePlaceholder?: string;
  children?: React.ReactNode;
}

export function PublishStep({
  recipient,
  gameTitle,
  onGameTitleChange,
  canPublish,
  missingFields,
  onPublish,
  onPreview,
  previewDisabled = false,
  onBack,
  backLabel = "← Back",
  theme,
  titlePlaceholder,
  children,
}: PublishStepProps) {
  const placeholder =
    titlePlaceholder ??
    `e.g. "A game just for you" for ${recipient.name || "them"}`;

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Almost there! 🚀
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Give your game a title and choose sharing options before sending it
          off.
        </p>
      </div>

      {/* Settings card */}
      <div className="rounded-2xl sm:rounded-3xl border border-border bg-background p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium">Game title</label>
          <Input
            placeholder={placeholder}
            value={gameTitle}
            onChange={(e) => onGameTitleChange(e.target.value)}
            className="h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm"
          />
        </div>

        {/* Game-specific toggle settings injected here */}
        {children}
      </div>

      {/* Publish CTA */}
      <div
        className={cn(
          "rounded-2xl sm:rounded-3xl bg-linear-to-br p-4 sm:p-6 text-white",
          theme.publishGradient
        )}
      >
        <p className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">
          Ready to share! 🎉
        </p>
        <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 leading-snug">
          We'll generate a unique link you can send to{" "}
          {recipient.name || "your recipient"}.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            disabled={!canPublish}
            onClick={onPublish}
            className={cn(
              "flex-1 bg-white hover:bg-white/90 font-semibold h-10 sm:h-11 rounded-xl gap-2 text-sm",
              theme.publishButtonText
            )}
          >
            <Gift className="w-4 h-4" />
            Publish & get link
          </Button>
          <Button
            variant="outline"
            onClick={onPreview}
            disabled={previewDisabled}
            className="h-10 sm:h-11 rounded-xl border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
          >
            <Eye className="w-4 h-4" />
            <span className="sm:hidden ml-1.5">Preview</span>
          </Button>
        </div>

        {!canPublish && missingFields.length > 0 && (
          <p className="text-white/60 text-[11px] sm:text-xs mt-2.5 sm:mt-3 leading-snug">
            Please fill in: {missingFields.join(" • ")}
          </p>
        )}
      </div>

      <div className="flex justify-start">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground text-sm h-9 sm:h-10"
        >
          {backLabel}
        </Button>
      </div>
    </>
  );
}
