import { User, Gift, MessageCircleHeart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OCCASIONS } from "./types";
import type { Recipient, GameTheme } from "./types";

interface RecipientStepProps {
  recipient: Recipient;
  onRecipientChange: (recipient: Recipient) => void;
  personalMessage: string;
  onPersonalMessageChange: (message: string) => void;
  onContinue: () => void;
  theme: GameTheme;
  namePlaceholder?: string;
  messagePlaceholder?: string;
  heading?: string;
  subheading?: string;
  aiTeaserTitle?: string;
  aiTeaserBody?: string;
  continueLabel?: string;
}

export function RecipientStep({
  recipient,
  onRecipientChange,
  personalMessage,
  onPersonalMessageChange,
  onContinue,
  theme,
  namePlaceholder = "e.g. Sarah, Mom, Best Friend…",
  messagePlaceholder = "Write a sweet intro message that your recipient will see before playing…",
  heading = "Who is this game for? 🎁",
  subheading = "Tell us about your recipient — we'll use this to personalize the experience.",
  aiTeaserTitle = "AI-powered personalization — coming next step",
  aiTeaserBody = "Once you fill in the recipient details, our AI will suggest tailored content that feels genuinely personal.",
  continueLabel = "Continue →",
}: RecipientStepProps) {
  return (
    <>
      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          {heading}
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{subheading}</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl sm:rounded-3xl border border-border bg-background p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-sm">
        {/* Name */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            Recipient's name
          </label>
          <Input
            placeholder={namePlaceholder}
            value={recipient.name}
            onChange={(e) =>
              onRecipientChange({ ...recipient, name: e.target.value })
            }
            className="h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm"
          />
        </div>

        {/* Occasion pills */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            Occasion
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onRecipientChange({ ...recipient, occasion: o })}
                className={cn(
                  "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm border transition-colors",
                  recipient.occasion === o
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Personal message */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
            <MessageCircleHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            Personal message
            <Badge
              variant="secondary"
              className="text-[10px] sm:text-xs font-normal"
            >
              Optional
            </Badge>
          </label>
          <Textarea
            placeholder={messagePlaceholder}
            value={personalMessage}
            onChange={(e) => onPersonalMessageChange(e.target.value)}
            className="rounded-lg sm:rounded-xl resize-none min-h-20 sm:min-h-22.5 text-sm"
            maxLength={280}
          />
          <p className="text-[11px] sm:text-xs text-right text-muted-foreground">
            {personalMessage.length}/280
          </p>
        </div>
      </div>

      {/* AI teaser */}
      <div
        className={cn(
          "rounded-2xl sm:rounded-3xl border p-4 sm:p-6 bg-linear-to-br",
          theme.teaserBorder,
          theme.teaserBg
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-linear-to-br flex items-center justify-center shrink-0 mt-0.5",
              theme.teaserIcon
            )}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 leading-snug",
                theme.teaserTitle
              )}
            >
              {aiTeaserTitle}
            </p>
            <p
              className={cn(
                "text-xs sm:text-sm leading-snug",
                theme.teaserBody
              )}
            >
              {aiTeaserBody}
            </p>
          </div>
        </div>
      </div>

      {/* Continue */}
      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          className="h-10 sm:h-11 px-5 sm:px-6 gap-2 rounded-xl text-sm w-full sm:w-auto"
        >
          {continueLabel}
        </Button>
      </div>
    </>
  );
}
