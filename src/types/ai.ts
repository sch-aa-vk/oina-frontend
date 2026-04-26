export type SupportedLanguage = "ru" | "en" | "kz";

export interface AiOutcomeItem {
  id: string;
  title: string;
}

export interface GenerateQuestionsRequest {
  topic: string;
  outcomes: AiOutcomeItem[];
  count: number;
  language: SupportedLanguage;
}
export interface AiPersonalityOption {
  text: string;
  outcomeId: string;
}
export interface AiQuestion {
  question: string;
  options: AiPersonalityOption[];
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
  emojis: string[];
  answer: string;
  hint?: string;
}
export interface GenerateEmojiResponse {
  puzzles: AiEmojiPuzzle[];
}

export interface GenerateEmojiHintRequest {
  mode: "emojis-from-answer" | "answer-from-emojis" | "hint-from-answer";
  input: string;
  language: SupportedLanguage;
}
export interface GenerateEmojiHintResponse {
  result: string;
  alternatives: string[];
}

export interface GenerateCrosswordRequest {
  mode: "definition-from-word" | "word-from-definition";
  input: string;
  language: SupportedLanguage;
}
export interface GenerateCrosswordResponse {
  result: string;
  alternatives: string[];
}

export interface GenerateOutcomesRequest {
  topic: string;
  description?: string;
  count?: number;
  language: SupportedLanguage;
}
export interface AiOutcomeSuggestion {
  title: string;
}
export interface GenerateOutcomesResponse {
  outcomes: AiOutcomeSuggestion[];
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
