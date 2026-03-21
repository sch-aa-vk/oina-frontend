export type DifficultyLevel = "easy" | "medium" | "hard";

export interface EmojiPuzzle {
  id: string;
  emojis: string[];
  answer: string;
  hint: string;
  difficulty: DifficultyLevel;
}

export interface DifficultyConfig {
  label: string;
  color: string;
  bg: string;
  description: string;
}

export const STEP_LABELS: [string, string, string] = [
  "Recipient",
  "Puzzles",
  "Publish",
];

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    label: "Easy",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/30",
    description: "Obvious clues",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/30",
    description: "Some thought needed",
  },
  hard: {
    label: "Hard",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-800/30",
    description: "Real head-scratcher",
  },
};

export const createDefaultPuzzle = (): EmojiPuzzle => ({
  id: Math.random().toString(36).slice(2),
  emojis: [],
  answer: "",
  hint: "",
  difficulty: "medium",
});
