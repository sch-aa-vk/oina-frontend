export type Direction = "across" | "down";

export interface CrosswordWord {
  id: string;
  word: string;
  clue: string;
}

export interface PlacedWord {
  wordId: string;
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: Direction;
  number: number;
}

export interface GridCell {
  letter: string;
  wordIds: string[];
  number?: number;
  isBlack: boolean;
}

export interface CrosswordGrid {
  cells: GridCell[][];
  rows: number;
  cols: number;
  placedWords: PlacedWord[];
}

export const STEP_LABELS: [string, string, string] = [
  "Recipient",
  "Words & Clues",
  "Publish",
];

export const MAX_WORDS = 12;
export const MIN_WORDS = 3;
export const GRID_SIZE = 13;

export const createDefaultWord = (): CrosswordWord => ({
  id: Math.random().toString(36).slice(2),
  word: "",
  clue: "",
});
