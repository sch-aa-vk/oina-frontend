import axios from 'axios';
import type {
  GenerateQuestionsRequest, GenerateQuestionsResponse,
  GenerateEmojiRequest, GenerateEmojiResponse,
  GenerateEmojiHintRequest, GenerateEmojiHintResponse,
  GenerateCrosswordRequest, GenerateCrosswordResponse,
  SuggestThemeRequest, SuggestThemeResponse,
  GenerateOutcomesRequest, GenerateOutcomesResponse,
} from '../types/ai';

const aiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_URL,
  timeout: 30000,
});

export const aiService = {
  generateQuestions: (data: GenerateQuestionsRequest) =>
    aiClient.post<GenerateQuestionsResponse>('/ai/generate-questions', data).then(r => r.data),

  generateEmoji: (data: GenerateEmojiRequest) =>
    aiClient.post<GenerateEmojiResponse>('/ai/generate-emoji', data).then(r => r.data),

  generateEmojiHint: (data: GenerateEmojiHintRequest) =>
    aiClient.post<GenerateEmojiHintResponse>('/ai/generate-emoji-hint', data).then(r => r.data),

  generateCrossword: (data: GenerateCrosswordRequest) =>
    aiClient.post<GenerateCrosswordResponse>('/ai/generate-crossword', data).then(r => r.data),

  suggestTheme: (data: SuggestThemeRequest) =>
    aiClient.post<SuggestThemeResponse>('/ai/suggest-theme', data).then(r => r.data),

  generateOutcomes: (data: GenerateOutcomesRequest) =>
    aiClient.post<GenerateOutcomesResponse>('/ai/generate-outcomes', data).then(r => r.data),
};
