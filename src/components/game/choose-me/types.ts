export interface GameOutcome {
  id: string;       // "outcome_0"
  title: string;    // "Романтический ужин"
  emoji: string;    // "🌹"
  description?: string;
}

export interface GameOption {
  text: string;
  emoji: string;
  outcomeId: string;
}

export type OptionField = keyof GameOption;

export interface Question {
  question: string;
  options: GameOption[];
}

export type QuestionField = keyof Question;

export const STEP_LABELS: [string, string, string] = [
  "Recipient",
  "Outcomes & Questions",
  "Publish",
];

export const createDefaultQuestion = (): Question => ({
  question: "",
  options: [
    { text: "", emoji: "❤️", outcomeId: "" },
    { text: "", emoji: "🌟", outcomeId: "" },
  ],
});

export const createDefaultOutcome = (index: number): GameOutcome => ({
  id: `outcome_${index}`,
  title: "",
  emoji: "",
});
