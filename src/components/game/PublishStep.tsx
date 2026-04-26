import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Recipient } from "./types";

interface PublishStepProps {
  recipient: Recipient;
  gameTitle: string;
  onGameTitleChange: (title: string) => void;
  visibility: "private-link" | "public";
  onVisibilityChange: (visibility: "private-link" | "public") => void;
  isPublishing?: boolean;
  titlePlaceholder?: string;
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
        </div>

        {children}
      </div>
    </>
  );
}
