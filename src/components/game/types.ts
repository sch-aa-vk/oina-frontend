export interface Recipient {
  name: string;
  occasion: string;
}

/** Colour theme passed down from each game page to shared components */
export interface GameTheme {
  /** Tailwind gradient classes for the AI banner button, e.g. "from-violet-600 to-pink-600" */
  bannerGradient: string;
  /** Tailwind border colour for the AI teaser card, e.g. "border-violet-200/60 dark:border-violet-800/30" */
  teaserBorder: string;
  /** Tailwind bg gradient for the AI teaser card, e.g. "from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20" */
  teaserBg: string;
  /** Tailwind text colour for the AI teaser title, e.g. "text-violet-900 dark:text-violet-200" */
  teaserTitle: string;
  /** Tailwind text colour for the AI teaser body, e.g. "text-violet-700/70 dark:text-violet-400" */
  teaserBody: string;
  /** Tailwind icon gradient for the AI teaser icon, e.g. "from-violet-500 to-pink-500" */
  teaserIcon: string;
  /** Tailwind gradient for the publish CTA card, e.g. "from-violet-600 to-pink-600" */
  publishGradient: string;
  /** Tailwind text colour for the publish button label, e.g. "text-violet-700" */
  publishButtonText: string;
  /** Tailwind gradient for the top-bar publish button, e.g. "from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700" */
  topBarPublishGradient: string;
  /** Tailwind gradient for progress bar, e.g. "from-violet-500 to-pink-500" */
  progressGradient: string;
  /** Tailwind bg for the personal message box in preview, e.g. "bg-pink-50 dark:bg-pink-950/30" */
  messageBg: string;
  /** Tailwind border for the personal message box, e.g. "border-pink-200/50 dark:border-pink-800/30" */
  messageBorder: string;
  /** Tailwind text for the message label, e.g. "text-pink-600 dark:text-pink-400" */
  messageLabel: string;
  /** Tailwind text for the message body, e.g. "text-pink-800 dark:text-pink-200" */
  messageBody: string;
}

export const OCCASIONS: string[] = [
  "Birthday 🎂",
  "Anniversary 💑",
  "Just because 🌸",
  "Valentine's 💝",
  "Graduation 🎓",
  "Other",
];

export const CHOOSE_ME_THEME: GameTheme = {
  bannerGradient:
    "from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700",
  teaserBorder: "border-violet-200/60 dark:border-violet-800/30",
  teaserBg:
    "from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20",
  teaserTitle: "text-violet-900 dark:text-violet-200",
  teaserBody: "text-violet-700/70 dark:text-violet-400",
  teaserIcon: "from-violet-500 to-pink-500",
  publishGradient: "from-violet-600 to-pink-600",
  publishButtonText: "text-violet-700",
  topBarPublishGradient:
    "from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700",
  progressGradient: "from-violet-500 to-pink-500",
  messageBg: "bg-pink-50 dark:bg-pink-950/30",
  messageBorder: "border-pink-200/50 dark:border-pink-800/30",
  messageLabel: "text-pink-600 dark:text-pink-400",
  messageBody: "text-pink-800 dark:text-pink-200",
};

export const GUESS_BY_EMOJI_THEME: GameTheme = {
  bannerGradient:
    "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
  teaserBorder: "border-amber-200/60 dark:border-amber-800/30",
  teaserBg:
    "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
  teaserTitle: "text-amber-900 dark:text-amber-200",
  teaserBody: "text-amber-700/70 dark:text-amber-400",
  teaserIcon: "from-amber-400 to-orange-500",
  publishGradient: "from-amber-500 to-orange-500",
  publishButtonText: "text-amber-700",
  topBarPublishGradient:
    "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
  progressGradient: "from-amber-400 to-orange-500",
  messageBg: "bg-orange-50 dark:bg-orange-950/30",
  messageBorder: "border-orange-200/50 dark:border-orange-800/30",
  messageLabel: "text-orange-600 dark:text-orange-400",
  messageBody: "text-orange-800 dark:text-orange-200",
};

export const CROSSWORD_THEME: GameTheme = {
  bannerGradient:
    "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
  teaserBorder: "border-emerald-200/60 dark:border-emerald-800/30",
  teaserBg:
    "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
  teaserTitle: "text-emerald-900 dark:text-emerald-200",
  teaserBody: "text-emerald-700/70 dark:text-emerald-400",
  teaserIcon: "from-emerald-500 to-teal-500",
  publishGradient: "from-emerald-600 to-teal-600",
  publishButtonText: "text-emerald-700",
  topBarPublishGradient:
    "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
  progressGradient: "from-emerald-500 to-teal-500",
  messageBg: "bg-emerald-50 dark:bg-emerald-950/30",
  messageBorder: "border-emerald-200/50 dark:border-emerald-800/30",
  messageLabel: "text-emerald-600 dark:text-emerald-400",
  messageBody: "text-emerald-800 dark:text-emerald-200",
};
