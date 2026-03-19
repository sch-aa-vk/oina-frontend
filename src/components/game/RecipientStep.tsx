import { User, Gift, MessageCircleHeart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OCCASIONS } from "./Types";
import type { Recipient, GameTheme } from "./Types";

interface RecipientStepProps {
  recipient: Recipient;
  onRecipientChange: (recipient: Recipient) => void;
  personalMessage: string;
  onPersonalMessageChange: (message: string) => void;
  onContinue: () => void;
  theme: GameTheme;
  /** Text shown in the name input placeholder */
  namePlaceholder?: string;
  /** Text shown in the message textarea placeholder */
  messagePlaceholder?: string;
  /** Title shown at the top of Step 1 */
  heading?: string;
  /** Subtitle shown below the heading */
  subheading?: string;
  /** Title for the AI teaser card */
  aiTeaserTitle?: string;
  /** Body text for the AI teaser card */
  aiTeaserBody?: string;
  /** Label on the "Continue" button */
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
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        <p className="text-muted-foreground text-sm">{subheading}</p>
      </div>

      {/* Form card */}
      <div className="rounded-3xl border border-border bg-background p-6 space-y-6 shadow-sm">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Recipient's name
          </label>
          <Input
            placeholder={namePlaceholder}
            value={recipient.name}
            onChange={(e) =>
              onRecipientChange({ ...recipient, name: e.target.value })
            }
            className="h-11 rounded-xl"
          />
        </div>

        {/* Occasion pills */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Gift className="w-4 h-4 text-muted-foreground" />
            Occasion
          </label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onRecipientChange({ ...recipient, occasion: o })}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
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
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MessageCircleHeart className="w-4 h-4 text-muted-foreground" />
            Personal message
            <Badge variant="secondary" className="text-xs font-normal">
              Optional
            </Badge>
          </label>
          <Textarea
            placeholder={messagePlaceholder}
            value={personalMessage}
            onChange={(e) => onPersonalMessageChange(e.target.value)}
            className="rounded-xl resize-none min-h-22.5"
            maxLength={280}
          />
          <p className="text-xs text-right text-muted-foreground">
            {personalMessage.length}/280
          </p>
        </div>
      </div>

      {/* AI teaser */}
      <div
        className={cn(
          "rounded-3xl border p-6 bg-linear-to-br",
          theme.teaserBorder,
          theme.teaserBg
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-10 h-10 rounded-2xl bg-linear-to-br flex items-center justify-center shrink-0 mt-0.5",
              theme.teaserIcon
            )}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={cn("font-semibold text-sm mb-1", theme.teaserTitle)}>
              {aiTeaserTitle}
            </p>
            <p className={cn("text-sm", theme.teaserBody)}>{aiTeaserBody}</p>
          </div>
        </div>
      </div>

      {/* Continue */}
      <div className="flex justify-end">
        <Button onClick={onContinue} className="h-11 px-6 gap-2 rounded-xl">
          {continueLabel}
        </Button>
      </div>
    </>
  );
}
