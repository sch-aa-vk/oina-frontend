import type {
  BuildGiftPromptInput,
  GiftRecord,
  StorageLike,
  UploadedImage,
} from "../types/giftSite";

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

export function getStorageApi(): StorageLike | null {
  if (typeof window === "undefined") return null;
  const storageWindow = window as Window & { storage?: StorageLike };
  return storageWindow.storage || window.localStorage || null;
}

export function readAllGiftRecords(
  storageApi: StorageLike | null,
): GiftRecord[] {
  if (!storageApi) return [];

  const records: GiftRecord[] = [];
  const tryAddRecord = (key: string | null | undefined) => {
    if (!key || !String(key).startsWith("gift:")) return;
    try {
      const raw =
        typeof storageApi.getItem === "function"
          ? storageApi.getItem(key)
          : (storageApi[key] as string | undefined);
      if (!raw) return;
      const parsed = JSON.parse(raw) as GiftRecord;
      records.push(parsed);
    } catch {
      // Ignore malformed records.
    }
  };

  if (
    typeof storageApi.length === "number" &&
    typeof storageApi.key === "function"
  ) {
    for (let i = 0; i < storageApi.length; i += 1) {
      tryAddRecord(storageApi.key(i));
    }
  } else {
    Object.keys(storageApi).forEach((key) => tryAddRecord(key));
  }

  return records.sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );
}

// ---------------------------------------------------------------------------
// Prompt builder — optimised for Gemini 2.5 Pro extended thinking
// ---------------------------------------------------------------------------

export function buildGiftPrompt({
  recipientName,
  occasion,
  personalMessage,
  tone,
  themeName,
  themeDirection,
  templateLabel,
  templateBlueprint,
  variationLabel,
  variationBlueprint,
  variationDescription,
}: BuildGiftPromptInput): string {
  const isValentineYesNoTemplate = templateLabel === "Valentine Playful Yes/No";

  return `You are an expert creative web designer specialising in emotional, personalised gift experiences.

## TASK
Generate a complete, self-contained HTML gift webpage for the recipient described below.

## OUTPUT RULES (non-negotiable)
- Output ONLY raw HTML. No markdown, no backticks, no prose explanation, no code fences.
- All CSS must be embedded inside <style> tags within <head>.
- All JavaScript must be embedded inside <script> tags just before </body>.
- No external images or external CSS files.
- Google Fonts may be loaded via CSS @import inside a <style> block — never via a <link> tag.

## VISUAL QUALITY CHECKLIST (satisfy every item)
- Load 2–3 Google Fonts via @import and use them intentionally (display vs body vs accent).
- Define at least 3 distinct CSS @keyframe animations: entrance, ambient loop, and an interaction response.
- Use emoji decorations purposefully — consistent sizing, spacing, and placement that feels designed, not scattered.
- Build a cohesive color palette with 1–2 dominant colors and 1 sharp accent; derive all shades from CSS custom properties.
- Establish clear typographic hierarchy: headline → subheading → body → call-to-action.
- Every interactive element must have a visible :hover and :focus-visible state.

## RESPONSIVENESS — verify each rule before outputting
- <meta name="viewport" content="width=device-width, initial-scale=1.0"> must be present in <head>.
- Mobile-first CSS: base styles target 375px; larger screens override with min-width media queries.
- Breakpoints required: 480px, 768px, 1024px.
- All font sizes must use clamp(min, preferred-vw, max) — never bare px for type.
- All layout spacing uses clamp() or rem — never fixed px for gaps, padding, or margins.
- No element causes horizontal scroll on a 375px viewport.
- Buttons and tap targets must be at minimum 44px tall on mobile.
- Images: max-width:100%; height:auto; object-fit:cover where aspect ratio matters.
- All layout uses flexbox or CSS grid with fluid sizing — no float-based or table-based layouts.

## ACCESSIBILITY BASELINE
- All images have descriptive alt text.
- Color contrast between text and background meets WCAG AA (4.5:1 for body, 3:1 for large text).
- Interactive elements are keyboard-focusable and show a visible focus ring.
- Semantic HTML: use <main>, <section>, <header>, <footer>, <h1>–<h3>, <button>, <figure> appropriately.

## THEME
- Name: ${themeName}
- Art direction: ${themeDirection}

## TEMPLATE
- Label: ${templateLabel}
- Blueprint: ${templateBlueprint}

## VARIATION
- Label: ${variationLabel}
- Style: ${variationDescription}
- Blueprint: ${variationBlueprint}

${
  isValentineYesNoTemplate
    ? `## VALENTINE YES/NO INTERACTION RULES
- YES and NO buttons must both be visible and tappable on mobile AND desktop before a choice is made.
- The memory gallery must render ONLY after the user taps YES — never before, never on NO.
- Gallery must appear as the very last section, flowing below the success state with at least 32px vertical margin.
- Gallery must NEVER overlap, float over, or sit above any other element.
- Neither the success state nor the gallery may use position:fixed or position:absolute.
- Both must remain in normal document flow at all times.`
    : ""
}

## GIFT DETAILS
- Recipient name: ${recipientName}
- Occasion: ${occasion}
- Personal message: "${personalMessage}"
- Emotional tone: ${tone}

## STEP-BY-STEP PROCESS
Before writing any HTML, reason through these steps internally:
1. Choose a layout structure that fits the template blueprint and works on mobile first.
2. Plan the color palette (dominant, background, accent, text) and assign CSS custom properties.
3. Select font pairings that match the theme's emotional tone.
4. Decide which three animations best serve the occasion and tone.
5. Map the template blueprint to semantic HTML sections.
6. Write the complete HTML.
7. Mentally validate every item in the RESPONSIVENESS and VISUAL QUALITY checklists before outputting.

Output only the final HTML — no thinking text, no explanation.`;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

export function randomGiftId(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Strips markdown fences, preamble prose, and trailing prose that Gemini 2.5
 * Pro sometimes emits around the HTML output.
 */
export function normalizeGeneratedHtml(
  text: string | null | undefined,
): string {
  if (!text || typeof text !== "string") return "";
  let trimmed = text.trim();

  // 1. Strip fenced code blocks: ```html … ``` or ``` … ```
  const fenced = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) return fenced[1].trim();

  // 2. Strip any prose preamble that appears before <!doctype or <html
  const htmlStart = trimmed.search(/<!doctype\s+html|<html[\s>]/i);
  if (htmlStart > 0) trimmed = trimmed.slice(htmlStart);

  // 3. Strip any trailing prose after </html>
  const htmlEnd = trimmed.search(/<\/html>/i);
  if (htmlEnd !== -1) trimmed = trimmed.slice(0, htmlEnd + 7);

  return trimmed;
}

// ---------------------------------------------------------------------------
// HTML safety / escape
// ---------------------------------------------------------------------------

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Image compression
// ---------------------------------------------------------------------------

export function compressImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.84,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Only image files are supported."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () =>
        reject(new Error(`Could not process ${file.name}.`));
      image.onload = () => {
        const scale = Math.min(
          1,
          maxWidth / image.width,
          maxHeight / image.height,
        );
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error(`Could not process ${file.name}.`));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Gallery injection
// ---------------------------------------------------------------------------

/**
 * Sanitises a raw filename into a human-readable caption.
 * e.g. "fca49300-e7f1-11ea-9f51-cfd949b31560.png" → "Memory 1"
 *      "our_trip_to_paris.jpg"                     → "Our Trip To Paris"
 */
function prettifyImageName(raw: string, fallback: string): string {
  if (!raw) return fallback;
  // Strip extension
  const noExt = raw.replace(/\.[^.]+$/, "");
  // If it looks like a UUID or random hash (no real words), use fallback
  if (/^[a-f0-9\-]{20,}$/i.test(noExt)) return fallback;
  // Replace separators with spaces and title-case
  return noExt
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function injectUploadedImages(
  html: string,
  images: UploadedImage[],
  recipientName: string,
  occasion: string,
): string {
  if (!images?.length) return html;

  const safeRecipient = escapeHtml(recipientName || "Someone Special");
  const safeOccasion = escapeHtml(occasion || "Special Day");

  const galleryItems = images
    .map((image, index) => {
      const fallback = `Memory ${index + 1}`;
      const prettyName = prettifyImageName(image.name || "", fallback);
      const safeAlt = escapeHtml(prettyName);
      const safeCaption = escapeHtml(prettyName);
      return `<figure class="gift-memory-card">
  <div class="gift-memory-img-wrap">
    <img src="${image.dataUrl}" alt="${safeAlt}" loading="lazy" />
  </div>
  <figcaption>${safeCaption}</figcaption>
</figure>`;
    })
    .join("");

  const galleryBlock = `<section id="giftsite-user-gallery">
<style id="giftsite-user-gallery-style">
#giftsite-user-gallery {
  all: initial;
  display: block;
  position: relative;
  isolation: isolate;
  z-index: 1;
  clear: both;
  float: none;
  order: 9999;
  margin: clamp(20px, 5vw, 40px) auto 0;
  padding: clamp(16px, 3vw, 28px);
  width: min(100%, 960px);
  max-width: 100%;
  border-radius: clamp(16px, 3vw, 24px);
  background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,240,232,.78));
  border: 1px solid rgba(199,130,143,.25);
  box-shadow: 0 12px 36px rgba(120,72,57,.10);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: #3f2a1f;
  box-sizing: border-box;
}
body > #giftsite-user-gallery {
  grid-column: 1 / -1 !important;
  justify-self: stretch;
  align-self: start;
  flex: 0 0 100%;
}
#giftsite-user-gallery * { box-sizing: border-box; }

#giftsite-user-gallery h2 {
  margin: 0 0 4px;
  font-size: clamp(1.1rem, 2.5vw, 1.6rem);
  line-height: 1.2;
  font-weight: 700;
}
#giftsite-user-gallery > p {
  margin: 0 0 18px;
  opacity: .75;
  font-size: clamp(.85rem, 1.5vw, .97rem);
  line-height: 1.45;
}

/* ── Grid: 3 columns on desktop, 2 on tablet, 1 on mobile ── */
.gift-memory-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(10px, 1.8vw, 16px);
  width: 100%;
}
@media (max-width: 680px) {
  .gift-memory-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 400px) {
  .gift-memory-grid { grid-template-columns: 1fr; }
}

/* ── Cards ── */
.gift-memory-card {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 14px rgba(0,0,0,.08);
  min-width: 0;
  transition: transform .2s ease, box-shadow .2s ease;
}
.gift-memory-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(0,0,0,.13);
}

/* ── Fixed-height image wrapper prevents tall images dominating ── */
.gift-memory-img-wrap {
  width: 100%;
  height: 180px;          /* fixed thumb height */
  overflow: hidden;
  background: #f0ece8;
}
@media (max-width: 680px) {
  .gift-memory-img-wrap { height: 150px; }
}
.gift-memory-img-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;      /* crop to fill — no distortion */
  object-position: center;
}

/* ── Caption ── */
.gift-memory-card figcaption {
  padding: 7px 10px 9px;
  font-size: .82rem;
  color: #5a3e35;
  opacity: .85;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 480px) {
  #giftsite-user-gallery {
    margin: 16px auto 0;
    padding: 14px;
    border-radius: 16px;
    width: 100%;
  }
}
</style>
<h2>📸 Captured Moments for ${safeRecipient}</h2>
<p>A little photo memory lane for this ${safeOccasion} surprise.</p>
<div class="gift-memory-grid">${galleryItems}</div>
</section>`;

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${galleryBlock}</body>`);
  }

  return `${html}${galleryBlock}`;
}

// ---------------------------------------------------------------------------
// Adaptive HTML safety wrapper
// ---------------------------------------------------------------------------

export function ensureAdaptiveHtml(html: string): string {
  if (!html) return "";
  let output = String(html).trim();

  if (!/<html[\s>]/i.test(output)) {
    output = `<!doctype html>\n<html><head></head><body>${output}</body></html>`;
  }

  if (!/^<!doctype html>/i.test(output)) {
    output = `<!doctype html>\n${output}`;
  }

  if (!/<head[\s>]/i.test(output)) {
    output = output.replace(/<html([^>]*)>/i, "<html$1><head></head>");
  }

  if (!/<meta[^>]+name=["']viewport["']/i.test(output)) {
    output = output.replace(
      /<head([^>]*)>/i,
      '<head$1><meta name="viewport" content="width=device-width, initial-scale=1.0">',
    );
  }

  if (!/id=["']giftsite-adaptive-base["']/i.test(output)) {
    const adaptiveStyle = `<style id="giftsite-adaptive-base">
      *, *::before, *::after { box-sizing: border-box; }
      html, body {
        max-width: 100%;
        overflow-x: hidden;
      }
      html {
        width: 100%;
        scroll-behavior: smooth;
      }
      body {
        margin: 0;
        width: 100%;
        min-width: 0;
        word-break: break-word;
        -webkit-text-size-adjust: 100%;
      }
      img, svg, video, canvas, iframe, table {
        max-width: 100%;
        height: auto;
      }
      table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      main, section, article, aside, div {
        min-width: 0;
        max-width: 100%;
      }
      button, input, select, textarea {
        max-width: 100%;
      }
      /* Touch target floor */
      button, [role="button"], a {
        min-height: 44px;
        touch-action: manipulation;
      }
      /* Typography safety floor */
      p, li, figcaption, label {
        font-size: max(0.875rem, 14px);
        line-height: 1.55;
      }
      h1 { font-size: clamp(1.6rem, 5vw, 3rem); }
      h2 { font-size: clamp(1.25rem, 3.5vw, 2.2rem); }
      h3 { font-size: clamp(1.05rem, 2.5vw, 1.6rem); }
      /* Responsive font scale */
      @media (max-width: 1024px) { html { font-size: 15px; } }
      @media (max-width: 768px)  { html { font-size: 14px; } }
      @media (max-width: 480px)  {
        body { word-break: break-word; overflow-x: hidden; }
      }
    </style>`;
    output = output.replace(/<head([^>]*)>/i, `<head$1>${adaptiveStyle}`);
  }

  return output;
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export function pickRandomTemplateId(
  ids: string[],
  fallbackId: string,
): string {
  if (!ids.length) return fallbackId;
  const index = Math.floor(Math.random() * ids.length);
  return ids[index] || fallbackId;
}

// ---------------------------------------------------------------------------
// Recommended Gemini 2.5 Pro API config (use at call site)
// ---------------------------------------------------------------------------

/**
 * Generation config optimised for Gemini 2.5 Pro.
 *
 * Usage:
 *   import { GEMINI_GENERATION_CONFIG } from "./helpers";
 *   const response = await generativeModel.generateContent({
 *     contents: [...],
 *     generationConfig: GEMINI_GENERATION_CONFIG,
 *   });
 *
 * Adjust temperature per use-case:
 *   - 0.4–0.6  → accurate, predictable HTML structure
 *   - 0.7–0.85 → balanced creativity + accuracy (default)
 *   - 0.9–1.0  → maximum creative variation
 */
export const GEMINI_GENERATION_CONFIG = {
  temperature: 0.75,
  topP: 0.92,
  topK: 40,
  maxOutputTokens: 8192,
  // Gemini 2.5 Pro: extended thinking budget
  // Gives the model space to reason through layout, palette, and animations
  // before committing to output — dramatically improves HTML coherence.
  thinkingConfig: {
    thinkingBudget: 8192,
  },
} as const;
