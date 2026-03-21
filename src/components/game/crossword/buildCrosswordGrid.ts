import type {
  CrosswordWord,
  CrosswordGrid,
  PlacedWord,
  GridCell,
  Direction,
} from "./types";
import { GRID_SIZE } from "./types";

export function buildCrosswordGrid(
  words: CrosswordWord[]
): CrosswordGrid | null {
  const validWords = words
    .filter((w) => w.word.trim().length >= 2 && w.clue.trim().length > 0)
    .map((w) => ({ ...w, word: w.word.trim().toUpperCase() }));
  if (validWords.length === 0) return null;

  const ROWS = GRID_SIZE,
    COLS = GRID_SIZE;
  const makeEmptyGrid = (): string[][] =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(""));

  function canPlace(
    grid: string[][],
    word: string,
    row: number,
    col: number,
    dir: Direction
  ): boolean {
    const dr = dir === "down" ? 1 : 0,
      dc = dir === "across" ? 1 : 0;
    const endRow = row + dr * (word.length - 1),
      endCol = col + dc * (word.length - 1);
    if (endRow >= ROWS || endCol >= COLS || row < 0 || col < 0) return false;
    if (row - dr >= 0 && col - dc >= 0 && grid[row - dr][col - dc] !== "")
      return false;
    if (
      endRow + dr < ROWS &&
      endCol + dc < COLS &&
      grid[endRow + dr][endCol + dc] !== ""
    )
      return false;
    let hasIntersection = false;
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i,
        c = col + dc * i;
      const existing = grid[r][c];
      if (existing === "") {
        if (
          dir === "across" &&
          ((r > 0 && grid[r - 1][c] !== "") ||
            (r < ROWS - 1 && grid[r + 1][c] !== ""))
        )
          return false;
        if (
          dir === "down" &&
          ((c > 0 && grid[r][c - 1] !== "") ||
            (c < COLS - 1 && grid[r][c + 1] !== ""))
        )
          return false;
      } else if (existing === word[i]) {
        hasIntersection = true;
      } else return false;
    }
    return hasIntersection || validWords.length === 1;
  }

  function placeWord(
    grid: string[][],
    word: string,
    row: number,
    col: number,
    dir: Direction
  ): string[][] {
    const next = grid.map((r) => [...r]);
    const dr = dir === "down" ? 1 : 0,
      dc = dir === "across" ? 1 : 0;
    for (let i = 0; i < word.length; i++)
      next[row + dr * i][col + dc * i] = word[i];
    return next;
  }

  function tryPlaceAll(
    remaining: CrosswordWord[],
    placed: PlacedWord[],
    grid: string[][]
  ): { placed: PlacedWord[]; grid: string[][] } | null {
    if (remaining.length === 0) return { placed, grid };
    const current = remaining[0],
      rest = remaining.slice(1),
      word = current.word;
    const candidates: {
      row: number;
      col: number;
      dir: Direction;
      score: number;
    }[] = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        for (const dir of ["across", "down"] as Direction[]) {
          if (canPlace(grid, word, r, c, dir)) {
            const dr = dir === "down" ? 1 : 0,
              dc = dir === "across" ? 1 : 0;
            let intersections = 0;
            for (let i = 0; i < word.length; i++)
              if (grid[r + dr * i][c + dc * i] !== "") intersections++;
            candidates.push({ row: r, col: c, dir, score: intersections });
          }
        }
    candidates.sort((a, b) => b.score - a.score);
    for (const cand of candidates.slice(0, 20)) {
      const newGrid = placeWord(grid, word, cand.row, cand.col, cand.dir);
      const pw: PlacedWord = {
        wordId: current.id,
        word,
        clue: current.clue,
        row: cand.row,
        col: cand.col,
        direction: cand.dir,
        number: 0,
      };
      const result = tryPlaceAll(rest, [...placed, pw], newGrid);
      if (result) return result;
    }
    return tryPlaceAll(rest, placed, grid);
  }

  const sorted = [...validWords].sort((a, b) => b.word.length - a.word.length);
  let grid = makeEmptyGrid();
  const first = sorted[0];
  const startRow = Math.floor(ROWS / 2),
    startCol = Math.floor((COLS - first.word.length) / 2);
  grid = placeWord(grid, first.word, startRow, startCol, "across");
  const firstPlaced: PlacedWord = {
    wordId: first.id,
    word: first.word,
    clue: first.clue,
    row: startRow,
    col: startCol,
    direction: "across",
    number: 0,
  };
  const result = tryPlaceAll(sorted.slice(1), [firstPlaced], grid);
  if (!result) return null;

  let minR = ROWS,
    maxR = 0,
    minC = COLS,
    maxC = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (result.grid[r][c] !== "") {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
  const pad = 1;
  minR = Math.max(0, minR - pad);
  maxR = Math.min(ROWS - 1, maxR + pad);
  minC = Math.max(0, minC - pad);
  maxC = Math.min(COLS - 1, maxC + pad);

  const rows = maxR - minR + 1,
    cols = maxC - minC + 1;
  const adjustedPlaced = result.placed.map((pw) => ({
    ...pw,
    row: pw.row - minR,
    col: pw.col - minC,
  }));

  const cells: GridCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const letter = result.grid[r + minR][c + minC];
      const wordIds = adjustedPlaced
        .filter((pw) => {
          const dr = pw.direction === "down" ? 1 : 0,
            dc = pw.direction === "across" ? 1 : 0;
          for (let i = 0; i < pw.word.length; i++)
            if (pw.row + dr * i === r && pw.col + dc * i === c) return true;
          return false;
        })
        .map((pw) => pw.wordId);
      return { letter, wordIds, isBlack: letter === "" };
    })
  );

  let clueNumber = 1;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (cells[r][c].isBlack) continue;
      const startsAcross =
        (c === 0 || cells[r][c - 1].isBlack) &&
        c + 1 < cols &&
        !cells[r][c + 1].isBlack;
      const startsDown =
        (r === 0 || cells[r - 1][c].isBlack) &&
        r + 1 < rows &&
        !cells[r + 1][c].isBlack;
      if (startsAcross || startsDown) {
        cells[r][c].number = clueNumber;
        adjustedPlaced.forEach((pw) => {
          if (pw.row === r && pw.col === c) pw.number = clueNumber;
        });
        clueNumber++;
      }
    }

  return { cells, rows, cols, placedWords: adjustedPlaced };
}
