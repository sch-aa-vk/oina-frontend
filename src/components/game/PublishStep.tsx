import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Recipient } from "./types";
import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";

interface PublishStepProps {
  recipient: Recipient;
  gameTitle: string;
  onGameTitleChange: (title: string) => void;
  visibility: "private-link" | "public";
  onVisibilityChange: (visibility: "private-link" | "public") => void;
  isPublishing?: boolean;
  titlePlaceholder?: string;
  gameId?: string;
  children?: React.ReactNode;
}

export function PublishStep({
  recipient,
  gameTitle,
  onGameTitleChange,
  visibility,
  onVisibilityChange,
  isPublishing = false,
  titlePlaceholder,
  gameId,
  children,
}: PublishStepProps) {
  const [isCopied, setIsCopied] = useState(false);

  const shareLink = gameId ? `${window.location.origin}/games/${gameId}` : "";

  const handleCopyLink = useCallback(() => {
    if (!shareLink) return;
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {});
  }, [shareLink]);

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

      <div className="rounded-2xl sm:rounded-3xl border border-border bg-background p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium">Game title</label>
          <Input
            placeholder={placeholder}
            value={gameTitle}
            onChange={(e) => onGameTitleChange(e.target.value)}
            disabled={isPublishing}
            className="h-10 sm:h-11 rounded-lg sm:rounded-xl md:text-sm"
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-xs sm:text-sm font-medium">Visibility</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={visibility === "private-link" ? "default" : "outline"}
              disabled={isPublishing}
              onClick={() => onVisibilityChange("private-link")}
              className="h-10 rounded-xl text-xs sm:text-sm"
            >
              Private link
            </Button>
            <Button
              type="button"
              variant={visibility === "public" ? "default" : "outline"}
              disabled={isPublishing}
              onClick={() => onVisibilityChange("public")}
              className="h-10 rounded-xl text-xs sm:text-sm"
            >
              Public
            </Button>
          </div>
          {gameId && (
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-xs sm:text-sm font-medium">Share link</p>
              <div className="relative">
                <Input
                  readOnly
                  value={shareLink}
                  className="h-10 sm:h-11 rounded-lg sm:rounded-xl pr-10 text-xs text-muted-foreground select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  title={isCopied ? "Copied!" : "Copy link"}
                >
                  {isCopied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {children}
      </div>
    </>
  );
}
