import type { Recipient } from "@/components/game";
import type { Question } from "@/components/game/choose-me";
import type { CrosswordWord } from "@/components/game/crossword";
import type { EmojiPuzzle } from "@/components/game/guess-by-emoji";
import type {
  CreateGameRequest,
  GameContent,
  GameType,
  PublishGameRequest,
} from "@/types/games";

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;
const MAX_CONTENT_BYTES = 100 * 1024;

interface BaseBuilderInput {
  title: string;
  recipient: Recipient;
  personalMessage: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export function mapChooseMeContent(input: {
  recipient: Recipient;
  personalMessage: string;
  questions: Question[];
  shuffle: boolean;
}): GameContent {
  return {
    recipient: input.recipient,
    personalMessage: input.personalMessage,
    questions: input.questions,
    settings: {
      shuffle: input.shuffle,
    },
  };
}

export function mapGuessByEmojiContent(input: {
  recipient: Recipient;
  personalMessage: string;
  puzzles: EmojiPuzzle[];
  showAnswers: boolean;
}): GameContent {
  return {
    recipient: input.recipient,
    personalMessage: input.personalMessage,
    puzzles: input.puzzles,
    settings: {
      showAnswers: input.showAnswers,
    },
  };
}

export function mapCrosswordContent(input: {
  recipient: Recipient;
  personalMessage: string;
  words: CrosswordWord[];
  showSolution: boolean;
}): GameContent {
  return {
    recipient: input.recipient,
    personalMessage: input.personalMessage,
    words: input.words,
    settings: {
      showSolution: input.showSolution,
    },
  };
}

export function buildCreateGamePayload(
  type: GameType,
  input: BaseBuilderInput,
  content: GameContent
): CreateGameRequest {
  return {
    type,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    category: input.category?.trim() || undefined,
    tags: normalizeTags(input.tags),
    content,
  };
}

export function buildPublishPayload(
  visibility: "private-link" | "public"
): PublishGameRequest {
  return { visibility };
}

export function validateCreatePayload(
  payload: CreateGameRequest
): string[] {
  const errors: string[] = [];

  if (!payload.title.trim()) {
    errors.push("Game title is required.");
  }
  if (payload.title.length > MAX_TITLE_LENGTH) {
    errors.push(`Game title must be at most ${MAX_TITLE_LENGTH} characters.`);
  }
  if ((payload.description?.length ?? 0) > MAX_DESCRIPTION_LENGTH) {
    errors.push(
      `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`
    );
  }

  if (payload.tags && payload.tags.length > MAX_TAGS) {
    errors.push(`You can add up to ${MAX_TAGS} tags.`);
  }

  for (const tag of payload.tags ?? []) {
    if (!tag.trim() || tag.length > MAX_TAG_LENGTH) {
      errors.push(`Each tag must be between 1 and ${MAX_TAG_LENGTH} characters.`);
      break;
    }
  }

  const contentBytes = getJsonByteSize(payload.content);
  if (contentBytes > MAX_CONTENT_BYTES) {
    errors.push("Game content is too large. Reduce content and try again.");
  }

  return errors;
}

function getJsonByteSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

function normalizeTags(tags?: string[]): string[] | undefined {
  if (!tags || tags.length === 0) {
    return undefined;
  }

  const normalized = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return normalized.length > 0 ? normalized : undefined;
}
