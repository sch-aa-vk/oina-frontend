import type {
  TemplateOption,
  ThemeOption,
  VariationOption,
  ViewValue,
} from "../../../types/giftSite";

export const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Graduation",
  "Valentine's Day",
  "Mother's Day",
  "Father's Day",
  "Just Because",
] as const;

export const TONES = ["Romantic", "Funny", "Heartfelt"] as const;

export const THEMES: ThemeOption[] = [
  {
    name: "Rose Gold Elegance",
    direction:
      "warm rose gold and cream palette, luxurious glass cards, soft shimmer effects",
  },
  {
    name: "Enchanted Garden",
    direction:
      "botanical motifs, floral accents, organic curves, fresh spring colors",
  },
  {
    name: "Starlit Night",
    direction:
      "deep navy night sky, twinkling stars, dreamy glows, celestial details",
  },
  {
    name: "Vintage Love Letter",
    direction:
      "paper textures, postage details, classic serif typography, nostalgic romance",
  },
  {
    name: "Candy Pop Party",
    direction:
      "playful candy tones, bold shapes, confetti elements, joyful kinetic energy",
  },
  {
    name: "Minimal Modern Luxe",
    direction:
      "clean composition, refined typography, restrained palette, premium polish",
  },
  {
    name: "Golden Celebration",
    direction:
      "champagne and gold highlights, premium event feel, elegant glow animations",
  },
];

export const TEMPLATES: TemplateOption[] = [
  {
    id: "hero-celebration",
    label: "Hero Celebration",
    description:
      "Large hero, message spotlight, and animated call-to-celebrate button.",
    blueprint:
      "Create a single-page hero layout with: (1) large title + recipient focus, (2) highlighted message card, (3) floating emoji particles, (4) celebration CTA button.",
  },
  {
    id: "love-letter",
    label: "Love Letter",
    description:
      "Envelope/paper aesthetic with handwritten details and romantic motion.",
    blueprint:
      "Design as an opening letter experience with: (1) envelope intro effect, (2) unfolding paper-style message section, (3) signature area, (4) gentle heart animations.",
  },
  {
    id: "valentine-playful-yesno",
    label: "Valentine Playful Yes/No",
    description:
      "Playful proposal flow with “Will you be my Valentine?” vibe and charming interactions.",
    blueprint:
      "Build a playful Valentine section with: (1) central romantic question headline, (2) two playful action buttons where the positive action feels prominent, (3) affectionate success-state panel, (4) cute animated decorations. Keep interactions sweet and respectful.",
  },
  {
    id: "memory-timeline",
    label: "Memory Timeline",
    description:
      "Story-style timeline with milestones, moments, and heartfelt notes.",
    blueprint:
      "Compose a vertical timeline with: (1) intro banner, (2) 3-5 milestone cards, (3) final emotional message block, (4) subtle parallax or float animation for depth.",
  },
  {
    id: "scrapbook-collage",
    label: "Scrapbook Collage",
    description:
      "Layered paper collage style with stickers, tape accents, and warm notes.",
    blueprint:
      "Create a scrapbook collage with: (1) layered card layout, (2) sticker-like emoji badges, (3) paper tape visual accents, (4) responsive rearrangement on mobile.",
  },
];

export const VALENTINE_TEMPLATE_IDS = [
  "valentine-playful-yesno",
  "love-letter",
  "scrapbook-collage",
] as const;

export const MAX_UPLOADED_IMAGES = 6;

export const VALENTINE_VARIATIONS: VariationOption[] = [
  {
    id: "grand-proposal",
    label: "Grand Proposal",
    description:
      "Big romantic reveal with a strong headline, centered choice, and celebration moment.",
    blueprint:
      "Use a cinematic proposal structure: (1) dramatic hero intro, (2) centered Valentine question or declaration, (3) prominent action area, (4) glowing success state with confetti and hearts.",
  },
  {
    id: "love-notes",
    label: "Love Notes",
    description:
      "A sequence of short affectionate notes that feels handwritten and intimate.",
    blueprint:
      "Use a love-notes structure: (1) soft opening card, (2) 3-6 stacked note cards or envelope slips, (3) gentle reveal of the final message, (4) tactile paper or card motion.",
  },
  {
    id: "memory-roadmap",
    label: "Memory Roadmap",
    description:
      "A route of shared memories leading toward the Valentine message.",
    blueprint:
      "Use a roadmap/timeline structure: (1) intro map or path, (2) milestone stops with memories, (3) highlighted destination card, (4) warm romantic finish.",
  },
  {
    id: "date-night-invite",
    label: "Date Night Invite",
    description:
      "Feels like a polished invitation with event-style details and RSVP energy.",
    blueprint:
      "Use an invitation structure: (1) elegant invite header, (2) date-night details section, (3) RSVP-style CTA, (4) after-acceptance celebration panel.",
  },
  {
    id: "cute-qa",
    label: "Cute Q&A",
    description:
      "Playful question-and-answer flow that reveals affection piece by piece.",
    blueprint:
      "Use a Q&A structure: (1) question one leads to an affectionate answer, (2) question two deepens the feeling, (3) final Valentine prompt, (4) joyful reveal when completed.",
  },
  {
    id: "secret-scroll",
    label: "Secret Scroll",
    description:
      "Long-scroll story with sections that unfold as the user moves down the page.",
    blueprint:
      "Use a scroll story structure: (1) teaser intro, (2) flowing content sections with alternating cards, (3) centered emotional climax, (4) immersive end card with soft motion.",
  },
];

export const GEMINI_ENDPOINT =
  "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-pro:generateContent";

export const VIEW: Record<"FORM" | "PREVIEW" | "PUBLISHED", ViewValue> = {
  FORM: "form",
  PREVIEW: "preview",
  PUBLISHED: "published",
};
