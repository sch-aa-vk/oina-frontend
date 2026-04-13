import axios from "axios";
import api from "./api";
import type {
  CreateGameRequest,
  GameApiError,
  GameResponse,
  ListGamesResponse,
  PublishGameRequest,
} from "@/types/games";

type ApiErrorPayload = {
  message?: string;
  errorCode?: string;
  code?: string;
  error?: {
    code?: string;
  };
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_GAME_PAYLOAD: "Please check the game details and try again.",
  INVALID_REWARD_PAYLOAD: "Please fix reward details before publishing.",
  CONTENT_TOO_LARGE: "Game content is too large. Please reduce it and try again.",
  QUOTA_TOTAL_GAMES_EXCEEDED: "You reached the total games limit for this account.",
  QUOTA_MONTHLY_GAMES_EXCEEDED: "You reached your monthly game creation limit.",
  GAME_FORBIDDEN: "You do not have access to this game.",
  GAME_NOT_FOUND: "Game not found.",
  PREVIEW_ONLY_FOR_DRAFT: "Preview is available only for draft games.",
};

function extractApiError(error: unknown): GameApiError {
  if (!axios.isAxiosError(error)) {
    return { message: "Something went wrong. Please try again." };
  }

  const status = error.response?.status;
  const payload = error.response?.data as ApiErrorPayload | undefined;
  const code = payload?.errorCode ?? payload?.code ?? payload?.error?.code;
  const backendMessage = payload?.message ?? error.message;

  if (status === 401) {
    return {
      status,
      code,
      message: "Your session expired. Please sign in again.",
      debugMessage: backendMessage,
    };
  }

  return {
    status,
    code,
    message:
      (code ? ERROR_MESSAGES[code] : undefined) ??
      backendMessage ??
      "Something went wrong. Please try again.",
    debugMessage: backendMessage,
  };
}

export const gamesService = {
  async createGame(payload: CreateGameRequest): Promise<GameResponse> {
    const response = await api.post<GameResponse>("/games", payload);
    return response.data;
  },

  async listGames(cursor?: string): Promise<ListGamesResponse> {
    const response = await api.get<ListGamesResponse>("/games", {
      params: cursor ? { cursor } : undefined,
    });
    return response.data;
  },

  async getGame(gameId: string): Promise<GameResponse> {
    const response = await api.get<GameResponse>(`/games/${gameId}`);
    return response.data;
  },

  async publishGame(
    gameId: string,
    payload: PublishGameRequest
  ): Promise<GameResponse> {
    const response = await api.post<GameResponse>(`/games/${gameId}/publish`, payload);
    return response.data;
  },

  async previewGame(gameId: string): Promise<GameResponse> {
    const response = await api.get<GameResponse>(`/games/${gameId}/preview`);
    return response.data;
  },

  mapError(error: unknown): GameApiError {
    return extractApiError(error);
  },
};
