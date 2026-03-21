export interface GameOption {
  text: string;
  emoji: string;
  isCorrect: boolean;
}

export type OptionField = keyof GameOption;

export interface Question {
  question: string;
  options: GameOption[];
}

export type QuestionField = keyof Question;

export const STEP_LABELS: [string, string, string] = [
  "Recipient",
  "Questions",
  "Publish",
];

export const createDefaultQuestion = (): Question => ({
  question: "",
  options: [
    { text: "", emoji: "❤️", isCorrect: true },
    { text: "", emoji: "🌟", isCorrect: false },
    { text: "", emoji: "🔥", isCorrect: false },
  ],
});
