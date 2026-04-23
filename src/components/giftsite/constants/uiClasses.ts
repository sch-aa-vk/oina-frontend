import type { UiClasses } from "../../../types/giftSite";

export const UI_CLASSES: UiClasses = {
  label: "mb-2 block text-sm font-medium text-foreground",
  field:
    "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring",
  btnPrimary:
    "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-65",
  btnGhost:
    "inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-65",
  btnSmGhost:
    "inline-flex items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent",
};
