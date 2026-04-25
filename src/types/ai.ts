export type SupportedLanguage = "ru" | "en" | "kz";

export interface GenerateQuestionsRequest {
  topic: string;
  count: number;
  language: SupportedLanguage;
}
export interface AiQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}
export interface GenerateQuestionsResponse {
  questions: AiQuestion[];
}

export interface GenerateEmojiRequest {
  topic?: string;
  count: number;
  language: SupportedLanguage;
}
export interface AiEmojiPuzzle {
  emojis: string;
  answer: string;
  hint?: string;
}
export interface GenerateEmojiResponse {
  puzzles: AiEmojiPuzzle[];
}

export interface GenerateCrosswordRequest {
  mode: "word-to-definition" | "definition-to-word";
  input: string;
  language: SupportedLanguage;
}
export interface GenerateCrosswordResponse {
  result: string;
  alternatives: string[];
}

export interface SuggestThemeRequest {
  description: string;
  language: SupportedLanguage;
}
export interface AiTheme {
  name: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  emoji: string;
  description: string;
}
export interface SuggestThemeResponse {
  themes: AiTheme[];
}
