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
  /** Optional settings rows (ToggleSetting components) rendered inside the settings card */
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
        <h1 className="text-2xl font-bold tracking-tight">Almost there! 🚀</h1>
        <p className="text-muted-foreground text-sm">
          Give your game a title and choose sharing options before sending it
          off.
        </p>
      </div>

      {/* Settings card */}
      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Game title</label>
          <Input
            placeholder={placeholder}
            value={gameTitle}
            onChange={(e) => onGameTitleChange(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>

        {/* Game-specific toggle settings injected here */}
        {children}
      </div>

      {/* Publish CTA */}
      <div
        className={cn(
          "rounded-3xl bg-linear-to-br p-6 text-white",
          theme.publishGradient
        )}
      >
        <p className="font-bold text-lg mb-1">Ready to share! 🎉</p>
        <p className="text-white/70 text-sm mb-4">
          We'll generate a unique link you can send to{" "}
          {recipient.name || "your recipient"}.
        </p>

        <div className="flex gap-3">
          <Button
            disabled={!canPublish}
            onClick={onPublish}
            className={cn(
              "flex-1 bg-white hover:bg-white/90 font-semibold h-11 rounded-xl gap-2",
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
            className="h-11 rounded-xl border-white/30 text-white hover:bg-white/10"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {!canPublish && missingFields.length > 0 && (
          <p className="text-white/60 text-xs mt-3">
            Please fill in: {missingFields.join(" • ")}
          </p>
        )}
      </div>

      <div className="flex justify-start">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground"
        >
          {backLabel}
        </Button>
      </div>
    </>
  );
}
