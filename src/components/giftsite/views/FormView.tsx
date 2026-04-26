import type { ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";
import {
  MAX_UPLOADED_IMAGES,
  OCCASIONS,
  TEMPLATES,
  THEMES,
  TONES,
  VALENTINE_TEMPLATE_IDS,
  VALENTINE_VARIATIONS,
} from "../constants/giftSiteCons";
import type {
  TemplateOption,
  UiClasses,
  UploadedImage,
  VariationOption,
} from "../../../types/giftSite";
import { pickRandomTemplateId } from "../../../utils/giftSiteUtil";

const TEMPLATE_VISUALS: Record<
  string,
  {
    accent: string;
    panel: string;
    headline: string;
    chips: string[];
  }
> = {
  "hero-celebration": {
    accent: "from-amber-300 via-orange-300 to-pink-300",
    panel: "bg-amber-50/90",
    headline: "text-amber-900",
    chips: ["Hero", "Spotlight", "CTA"],
  },
  "love-letter": {
    accent: "from-rose-200 via-amber-100 to-orange-200",
    panel: "bg-rose-50/90",
    headline: "text-rose-900",
    chips: ["Envelope", "Unfold", "Signature"],
  },
  "valentine-playful-yesno": {
    accent: "from-pink-300 via-rose-300 to-fuchsia-300",
    panel: "bg-pink-50/90",
    headline: "text-rose-900",
    chips: ["Question", "Playful", "Reveal"],
  },
  "memory-timeline": {
    accent: "from-sky-300 via-indigo-300 to-violet-300",
    panel: "bg-sky-50/90",
    headline: "text-slate-900",
    chips: ["Intro", "Milestones", "Finale"],
  },
  "scrapbook-collage": {
    accent: "from-lime-200 via-yellow-200 to-orange-200",
    panel: "bg-amber-50/90",
    headline: "text-zinc-900",
    chips: ["Layers", "Stickers", "Tape"],
  },
};

const VARIATION_VISUALS: Record<
  string,
  {
    accent: string;
    panel: string;
    chips: string[];
  }
> = {
  "grand-proposal": {
    accent: "from-rose-400 to-fuchsia-400",
    panel: "bg-rose-50/85",
    chips: ["Cinematic", "Centered", "Confetti"],
  },
  "love-notes": {
    accent: "from-amber-300 to-rose-300",
    panel: "bg-orange-50/85",
    chips: ["Notes", "Stacked", "Intimate"],
  },
  "memory-roadmap": {
    accent: "from-pink-300 to-violet-300",
    panel: "bg-violet-50/85",
    chips: ["Path", "Stops", "Destination"],
  },
  "date-night-invite": {
    accent: "from-red-300 to-amber-300",
    panel: "bg-red-50/85",
    chips: ["Invite", "Details", "RSVP"],
  },
  "cute-qa": {
    accent: "from-rose-300 to-orange-300",
    panel: "bg-pink-50/85",
    chips: ["Q&A", "Progressive", "Joyful"],
  },
  "secret-scroll": {
    accent: "from-fuchsia-300 to-indigo-300",
    panel: "bg-fuchsia-50/85",
    chips: ["Teaser", "Long Scroll", "Climax"],
  },
};

const TONE_VISUALS: Record<
  string,
  {
    accent: string;
    description: string;
    chips: string[];
  }
> = {
  Romantic: {
    accent: "from-rose-300 via-pink-300 to-fuchsia-300",
    description: "Soft, affectionate, and emotionally warm.",
    chips: ["Warm", "Tender", "Poetic"],
  },
  Funny: {
    accent: "from-amber-300 via-orange-300 to-yellow-300",
    description: "Playful, lighthearted, and smile-inducing.",
    chips: ["Playful", "Witty", "Cheerful"],
  },
  Heartfelt: {
    accent: "from-sky-300 via-indigo-300 to-violet-300",
    description: "Sincere, meaningful, and deeply personal.",
    chips: ["Sincere", "Personal", "Emotional"],
  },
};

const TONE_BUTTON_VISUALS: Record<
  string,
  {
    emoji: string;
    motion: string;
  }
> = {
  Romantic: {
    emoji: "💕",
    motion: "Soft fade and float",
  },
  Funny: {
    emoji: "😂",
    motion: "Springy pop and bounce",
  },
  Heartfelt: {
    emoji: "💌",
    motion: "Slow rise and gentle reveal",
  },
};

interface FormViewProps {
  uiClasses: UiClasses;
  recipientName: string;
  setRecipientName: (value: string) => void;
  occasion: string;
  setOccasion: (value: string) => void;
  personalMessage: string;
  setPersonalMessage: (value: string) => void;
  uploadedImages: UploadedImage[];
  isImageProcessing: boolean;
  handleImageSelection: (event: ChangeEvent<HTMLInputElement>) => void;
  removeUploadedImage: (id: string) => void;
  tone: string;
  setTone: (value: string) => void;
  themeName: string;
  setThemeName: (value: string) => void;
  templateId: string;
  setTemplateId: (value: string) => void;
  orderedTemplates: TemplateOption[];
  isValentineOccasion: boolean;
  valentineTemplates: TemplateOption[];
  selectedTemplate: TemplateOption;
  variationId: string;
  setVariationId: (value: string) => void;
  selectedVariation: VariationOption;
  isLoading: boolean;
  generateGiftSite: () => void;
  errorMessage: string;
}

export default function FormView({
  uiClasses,
  recipientName,
  setRecipientName,
  occasion,
  setOccasion,
  personalMessage,
  setPersonalMessage,
  uploadedImages,
  isImageProcessing,
  handleImageSelection,
  removeUploadedImage,
  tone,
  setTone,
  themeName,
  setThemeName,
  templateId,
  setTemplateId,
  orderedTemplates,
  isValentineOccasion,
  valentineTemplates,
  selectedTemplate,
  variationId,
  setVariationId,
  selectedVariation,
  isLoading,
  generateGiftSite,
  errorMessage,
}: FormViewProps) {
  const renderTemplatePreview = (template: TemplateOption) => {
    const visual = TEMPLATE_VISUALS[template.id] || {
      accent: "from-slate-300 to-slate-400",
      panel: "bg-slate-50/85",
      headline: "text-slate-900",
      chips: ["Layout", "Story", "Motion"],
    };

    return (
      <div className="rounded-md border bg-background/65 p-2">
        <div
          className={`mb-1.5 h-1.5 w-full rounded-full bg-linear-to-r ${visual.accent}`}
          aria-hidden="true"
        />
        <div className={`rounded border px-2 py-1.5 ${visual.panel}`}>
          <div className={`mb-1 text-xs font-semibold ${visual.headline}`}>
            {template.label}
          </div>
          <div className="flex flex-wrap gap-1">
            {visual.chips.slice(0, 2).map((chip) => (
              <span
                key={`${template.id}-${chip}`}
                className="rounded border bg-background/75 px-1.5 py-0.5 text-[0.62rem] text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVariationPreview = (variation: VariationOption) => {
    const visual = VARIATION_VISUALS[variation.id] || {
      accent: "from-rose-200 to-rose-300",
      panel: "bg-rose-50/85",
      chips: ["Romance", "Flow", "Finish"],
    };

    return (
      <div className="rounded-md border bg-background/65 p-2">
        <div
          className={`mb-1.5 h-1.5 w-full rounded-full bg-linear-to-r ${visual.accent}`}
          aria-hidden="true"
        />
        <div className={`rounded border px-2 py-1.5 ${visual.panel}`}>
          <div className="flex flex-wrap gap-1">
            {visual.chips.slice(0, 2).map((chip) => (
              <span
                key={`${variation.id}-${chip}`}
                className="rounded border bg-background/75 px-1.5 py-0.5 text-[0.62rem] text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTonePreview = (toneValue: string) => {
    const visual = TONE_BUTTON_VISUALS[toneValue] || {
      emoji: "✨",
      motion: "Natural motion treatment",
    };

    return (
      <span className="flex min-w-0 flex-col items-start gap-0.5">
        <span className="flex items-center gap-1 text-sm font-semibold leading-none">
          <span aria-hidden="true">{visual.emoji}</span>
          <span>{toneValue}</span>
        </span>
        <span className="text-[0.68rem] text-muted-foreground">
          {visual.motion}
        </span>
      </span>
    );
  };

  const renderThemePreview = (themeLabel: string) => {
    return <span className="text-sm font-semibold">{themeLabel}</span>;
  };

  return (
    <section
      className="rounded-xl border bg-card p-4 shadow-sm md:p-6"
      aria-live="polite"
    >
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        Design a Gift Site That Feels Personal
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Describe the vibe and message, then AI crafts a full celebratory web
        page you can instantly preview.
      </p>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <div>
          <label htmlFor="recipientName" className={uiClasses.label}>
            Recipient name
          </label>
          <input
            id="recipientName"
            className={uiClasses.field}
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
            placeholder="Avery"
          />
        </div>

        <div>
          <label htmlFor="occasion" className={uiClasses.label}>
            Occasion
          </label>
          <div className="relative">
            <select
              id="occasion"
              className={`${uiClasses.field} appearance-none pr-9`}
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
            >
              {OCCASIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="personalMessage" className={uiClasses.label}>
            Personal message
          </label>
          <textarea
            id="personalMessage"
            className={`${uiClasses.field} min-h-30 resize-y`}
            value={personalMessage}
            onChange={(event) => setPersonalMessage(event.target.value)}
            placeholder="What do you want this person to feel when they open this page?"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="photoUpload" className={uiClasses.label}>
            Photos (optional, up to {MAX_UPLOADED_IMAGES})
          </label>
          <div className="rounded-lg border border-dashed bg-muted/25 p-3">
            <input
              id="photoUpload"
              className={uiClasses.field}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelection}
              disabled={
                isImageProcessing ||
                uploadedImages.length >= MAX_UPLOADED_IMAGES
              }
            />
            <p className="mb-0 mt-2 text-sm text-muted-foreground">
              {isImageProcessing
                ? "Optimizing images..."
                : `${uploadedImages.length}/${MAX_UPLOADED_IMAGES} selected. These will be embedded into the final generated gift page.`}
            </p>

            {uploadedImages.length > 0 && (
              <div className="mt-2.5 grid grid-cols-[repeat(auto-fill,minmax(126px,1fr))] gap-2.5">
                {uploadedImages.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-lg border bg-background"
                  >
                    <img
                      className="block aspect-4/3 w-full object-cover"
                      src={image.dataUrl}
                      alt={image.name || "Uploaded memory"}
                    />
                    <div className="grid gap-1.5 p-1.5">
                      <span
                        className="truncate text-xs text-muted-foreground"
                        title={image.name}
                      >
                        {image.name || "Memory photo"}
                      </span>
                      <button
                        type="button"
                        className={uiClasses.btnSmGhost}
                        onClick={() => removeUploadedImage(image.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={uiClasses.label}>
            Tone
          </label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((toneOption) => {
              const isSelected = toneOption === tone;

              return (
                <button
                  key={toneOption}
                  type="button"
                  onClick={() => setTone(toneOption)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/35"
                  }`}
                >
                  {renderTonePreview(toneOption)}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {TONE_VISUALS[tone]?.description ||
              "Set the emotional direction for the generated page."}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className={uiClasses.label}>
            Theme
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {THEMES.map((theme) => {
              const isSelected = theme.name === themeName;

              return (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => setThemeName(theme.name)}
                  aria-pressed={isSelected}
                  className={`rounded-md border px-2.5 py-2 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/35"
                  }`}
                >
                  {renderThemePreview(theme.name)}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {THEMES.find((theme) => theme.name === themeName)?.direction}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className={uiClasses.label}>
            Template
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {orderedTemplates.map((template) => {
              const isRecommended =
                isValentineOccasion &&
                VALENTINE_TEMPLATE_IDS.includes(
                  template.id as (typeof VALENTINE_TEMPLATE_IDS)[number],
                );
              const isSelected = template.id === templateId;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  aria-pressed={isSelected}
                  className={`group rounded-lg border p-2 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/35"
                  }`}
                >
                  {renderTemplatePreview(template)}
                  <div className="px-1 pb-1 pt-1.5">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold">{template.label}</span>
                      {isRecommended && (
                        <span className="inline-flex items-center rounded-full border bg-muted/50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2.5">
            <p className="mb-0 mt-0 text-sm text-muted-foreground">
              {selectedTemplate.description}
            </p>
            <button
              type="button"
              className={uiClasses.btnSmGhost}
              onClick={() => {
                const pool = isValentineOccasion
                  ? valentineTemplates
                  : TEMPLATES;
                const randomId = pickRandomTemplateId(
                  pool.map((template) => template.id),
                  TEMPLATES[0].id,
                );
                setTemplateId(randomId);
              }}
            >
              Surprise Me
            </button>
          </div>
          {isValentineOccasion && (
            <span className="mt-2 inline-flex items-center rounded-full border bg-muted/40 px-2.5 py-1 text-[0.77rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Valentine templates prioritized
            </span>
          )}
        </div>

        {isValentineOccasion && (
          <div className="md:col-span-2">
            <label className={uiClasses.label}>
              Valentine variation
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {VALENTINE_VARIATIONS.map((variation) => {
                const isSelected = variation.id === variationId;
                return (
                  <button
                    key={variation.id}
                    type="button"
                    onClick={() => setVariationId(variation.id)}
                    aria-pressed={isSelected}
                    className={`group rounded-lg border p-2 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/35"
                    }`}
                  >
                    {renderVariationPreview(variation)}
                    <div className="px-1 pb-1 pt-1.5">
                      <div className="text-sm font-semibold">
                        {variation.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2.5">
              <p className="mb-0 mt-0 text-sm text-muted-foreground">
                {selectedVariation.description}
              </p>
              <button
                type="button"
                className={uiClasses.btnSmGhost}
                onClick={() => {
                  const randomId = pickRandomTemplateId(
                    VALENTINE_VARIATIONS.map((variation) => variation.id),
                    VALENTINE_VARIATIONS[0].id,
                  );
                  setVariationId(randomId);
                }}
              >
                Surprise Valentine
              </button>
            </div>
            <div className="mt-3 rounded-lg border border-dashed bg-muted/25 px-3.5 py-3 text-sm text-muted-foreground">
              Use this to change the structure, not just the colors. Each
              variation changes the story flow and interaction style.
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          className={uiClasses.btnPrimary}
          type="button"
          onClick={generateGiftSite}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2.5">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                aria-hidden="true"
              />
              Crafting your gift site...
            </span>
          ) : (
            "Generate Gift Site ✨"
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-3.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {errorMessage}
        </div>
      )}
    </section>
  );
}
