export type GameType = "choose-me" | "guess-by-emoji" | "crossword";

export type GameVisibility = "draft" | "private-link" | "public";

export type RewardType = "text" | "image" | "video" | "audio";

export interface ScoringConfig {
  enabled: boolean;
  maxScore?: number;
}

export interface Reward {
  id: string;
  pointsThreshold: number;
  label: string;
  type: RewardType;
  text?: string;
}

export interface GameContent {
  scoring?: ScoringConfig;
  rewards?: Reward[];
  [key: string]: unknown;
}

export interface GameResponse {
  gameId: string;
  userId: string;
  type: GameType;
  title: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  visibility: GameVisibility;
  content: Record<string, unknown>;
  publishedAt?: string;
  shareLink?: string;
  viewCount: number;
  playCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
}

export interface CreateGameRequest {
  type: GameType;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  content: GameContent;
}

export interface ListGamesResponse {
  games: GameResponse[];
  nextCursor?: string;
}

export interface PublishGameRequest {
  visibility: "private-link" | "public";
  changeLog?: string;
}

export interface GameApiError {
  status?: number;
  code?: string;
  message: string;
  debugMessage?: string;
}
