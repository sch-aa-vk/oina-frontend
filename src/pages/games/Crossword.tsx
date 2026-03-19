import { useState, useCallback, useEffect, useRef } from "react";
import {
  Trash2,
  Sparkles,
  Check,
  Lightbulb,
  RefreshCw,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GameTopBar,
  RecipientStep,
  AiBanner,
  AddItemButton,
  SummaryCard,
  ToggleSetting,
  PublishStep,
  CROSSWORD_THEME,
} from "@/components/game";
import type { Recipient } from "@/components/game";

// ─── Types ────────────────────────────────────────────────────────────────────

type Direction = "across" | "down";

interface CrosswordWord {
  id: string;
  word: string;
  clue: string;
}

interface PlacedWord {
  wordId: string;
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: Direction;
  number: number;
}

interface GridCell {
  letter: string;
  wordIds: string[];
  number?: number;
  isBlack: boolean;
}

interface CrosswordGrid {
  cells: GridCell[][];
  rows: number;
  cols: number;
  placedWords: PlacedWord[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS: [string, string, string] = [
  "Recipient",
  "Words & Clues",
  "Publish",
];
const MAX_WORDS = 12;
const MIN_WORDS = 3;
const GRID_SIZE = 13;

const createDefaultWord = (): CrosswordWord => ({
  id: Math.random().toString(36).slice(2),
  word: "",
  clue: "",
});

// ─── Grid Layout Algorithm ────────────────────────────────────────────────────

function buildCrosswordGrid(words: CrosswordWord[]): CrosswordGrid | null {
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

// ─── GridPreview ──────────────────────────────────────────────────────────────

function GridPreview({
  grid,
  size = "md",
}: {
  grid: CrosswordGrid;
  size?: "sm" | "md";
}) {
  const cellSize = size === "sm" ? 20 : 28,
    fontSize = size === "sm" ? 7 : 10,
    numSize = size === "sm" ? 5 : 7;
  return (
    <div className="overflow-auto">
      <div
        className="inline-grid gap-px bg-border rounded-xl overflow-hidden border border-border"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)` }}
      >
        {grid.cells.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={cn(
                "relative flex items-center justify-center select-none",
                cell.isBlack ? "bg-foreground" : "bg-background"
              )}
              style={{ width: cellSize, height: cellSize }}
            >
              {!cell.isBlack && (
                <>
                  {cell.number !== undefined && (
                    <span
                      className="absolute top-0 left-0.5 text-primary font-bold leading-none"
                      style={{ fontSize: numSize }}
                    >
                      {cell.number}
                    </span>
                  )}
                  <span
                    className="font-bold text-foreground"
                    style={{ fontSize }}
                  >
                    {cell.letter}
                  </span>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── ClueList ─────────────────────────────────────────────────────────────────

function ClueList({ placedWords }: { placedWords: PlacedWord[] }) {
  const across = placedWords
    .filter((pw) => pw.direction === "across")
    .sort((a, b) => a.number - b.number);
  const down = placedWords
    .filter((pw) => pw.direction === "down")
    .sort((a, b) => a.number - b.number);
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Across", words: across },
        { label: "Down", words: down },
      ].map(({ label, words }) => (
        <div key={label}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </p>
          <div className="space-y-1.5">
            {words.map((pw) => (
              <div key={pw.wordId} className="flex gap-2 text-sm">
                <span className="font-bold text-primary shrink-0 w-5 text-right">
                  {pw.number}.
                </span>
                <span className="text-muted-foreground leading-snug">
                  {pw.clue}
                </span>
              </div>
            ))}
            {words.length === 0 && (
              <p className="text-xs text-muted-foreground/50 italic">
                None yet
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── InteractivePreviewGrid ───────────────────────────────────────────────────

function InteractivePreviewGrid({ grid }: { grid: CrosswordGrid }) {
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [selectedDir, setSelectedDir] = useState<Direction>("across");
  const [revealed, setRevealed] = useState<boolean>(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const key = (r: number, c: number) => `${r}-${c}`;

  const getHighlightedCells = useCallback((): Set<string> => {
    if (!selectedCell) return new Set();
    const { r, c } = selectedCell;
    const highlighted = new Set<string>();
    for (const pw of grid.placedWords) {
      if (pw.direction !== selectedDir) continue;
      const dr = pw.direction === "down" ? 1 : 0,
        dc = pw.direction === "across" ? 1 : 0;
      for (let i = 0; i < pw.word.length; i++) {
        if (pw.row + dr * i === r && pw.col + dc * i === c) {
          for (let j = 0; j < pw.word.length; j++)
            highlighted.add(key(pw.row + dr * j, pw.col + dc * j));
          break;
        }
      }
    }
    return highlighted;
  }, [selectedCell, selectedDir, grid.placedWords]);

  const handleCellClick = (r: number, c: number): void => {
    if (grid.cells[r][c].isBlack) return;
    if (selectedCell?.r === r && selectedCell?.c === c)
      setSelectedDir((d) => (d === "across" ? "down" : "across"));
    else setSelectedCell({ r, c });
    inputRefs.current[key(r, c)]?.focus();
  };

  const handleInput = (r: number, c: number, value: string): void => {
    const letter = value
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(-1);
    setUserInputs((prev) => ({ ...prev, [key(r, c)]: letter }));
    if (letter) {
      const dr = selectedDir === "down" ? 1 : 0,
        dc = selectedDir === "across" ? 1 : 0;
      const nr = r + dr,
        nc = c + dc;
      if (nr < grid.rows && nc < grid.cols && !grid.cells[nr][nc].isBlack) {
        setSelectedCell({ r: nr, c: nc });
        inputRefs.current[key(nr, nc)]?.focus();
      }
    }
  };

  const handleKeyDown = (
    r: number,
    c: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    const dr = selectedDir === "down" ? 1 : 0,
      dc = selectedDir === "across" ? 1 : 0;
    if (e.key === "Backspace" && !userInputs[key(r, c)]) {
      const pr = r - dr,
        pc = c - dc;
      if (pr >= 0 && pc >= 0 && !grid.cells[pr][pc].isBlack) {
        setSelectedCell({ r: pr, c: pc });
        setUserInputs((prev) => ({ ...prev, [key(pr, pc)]: "" }));
        inputRefs.current[key(pr, pc)]?.focus();
      }
      e.preventDefault();
    }
    const arrows: Record<string, [Direction, number, number]> = {
      ArrowRight: ["across", 0, 1],
      ArrowLeft: ["across", 0, -1],
      ArrowDown: ["down", 1, 0],
      ArrowUp: ["down", -1, 0],
    };
    const arrow = arrows[e.key];
    if (arrow) {
      const [dir, ddr, ddc] = arrow;
      setSelectedDir(dir);
      const nr = r + ddr,
        nc = c + ddc;
      if (
        nr >= 0 &&
        nr < grid.rows &&
        nc >= 0 &&
        nc < grid.cols &&
        !grid.cells[nr][nc].isBlack
      ) {
        setSelectedCell({ r: nr, c: nc });
        inputRefs.current[key(nr, nc)]?.focus();
      }
      e.preventDefault();
    }
  };

  const checkAnswers = (): number => {
    let correct = 0,
      total = 0;
    grid.cells.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (!cell.isBlack) {
          total++;
          if ((userInputs[key(r, c)] ?? "") === cell.letter) correct++;
        }
      })
    );
    return Math.round((correct / total) * 100);
  };

  const highlighted = getHighlightedCells();
  const CELL = 36,
    NUM_SIZE = 9;

  return (
    <div className="space-y-4">
      <div className="overflow-auto">
        <div
          className="inline-grid gap-px bg-border rounded-xl overflow-hidden border border-border"
          style={{ gridTemplateColumns: `repeat(${grid.cols}, ${CELL}px)` }}
        >
          {grid.cells.flatMap((row, r) =>
            row.map((cell, c) => {
              const k = key(r, c),
                input = userInputs[k] ?? "";
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isHighlight = highlighted.has(k);
              const isCorrect = revealed && input === cell.letter;
              const isWrong = revealed && input !== "" && input !== cell.letter;
              return (
                <div
                  key={k}
                  onClick={() => handleCellClick(r, c)}
                  className={cn(
                    "relative flex items-center justify-center cursor-pointer transition-colors",
                    cell.isBlack
                      ? "bg-foreground cursor-default"
                      : isSelected
                      ? "bg-primary/20"
                      : isHighlight
                      ? "bg-primary/10"
                      : isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-950/30"
                      : isWrong
                      ? "bg-red-50 dark:bg-red-950/30"
                      : "bg-background"
                  )}
                  style={{ width: CELL, height: CELL }}
                >
                  {!cell.isBlack && (
                    <>
                      {cell.number !== undefined && (
                        <span
                          className="absolute top-0.5 left-0.5 text-primary font-bold leading-none pointer-events-none"
                          style={{ fontSize: NUM_SIZE }}
                        >
                          {cell.number}
                        </span>
                      )}
                      <input
                        ref={(el) => {
                          inputRefs.current[k] = el;
                        }}
                        value={input}
                        onChange={(e) => handleInput(r, c, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(r, c, e)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(r, c);
                        }}
                        className={cn(
                          "w-full h-full text-center font-bold uppercase bg-transparent outline-none border-none caret-transparent text-sm",
                          isCorrect
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isWrong
                            ? "text-red-500"
                            : "text-foreground"
                        )}
                        maxLength={2}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => setRevealed(true)}
        >
          <Check className="w-3 h-3" />
          Check answers
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => {
            setUserInputs({});
            setRevealed(false);
            setSelectedCell(null);
          }}
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </Button>
        {revealed && (
          <Badge variant="secondary" className="h-8 px-3 text-xs">
            {checkAnswers()}% correct
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── WordRow ──────────────────────────────────────────────────────────────────

interface WordRowProps {
  word: CrosswordWord;
  index: number;
  onChange: (id: string, changes: Partial<CrosswordWord>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  isPlaced: boolean;
}

function WordRow({
  word,
  index,
  onChange,
  onRemove,
  canRemove,
  isPlaced,
}: WordRowProps) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const isComplete =
    word.word.trim().length >= 2 && word.clue.trim().length > 0;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-background transition-all duration-200",
        isComplete && isPlaced
          ? "border-emerald-300/50 dark:border-emerald-700/40"
          : isComplete
          ? "border-amber-300/50 dark:border-amber-700/40"
          : "border-border"
      )}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          {word.word.trim() ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold tracking-widest uppercase">
                {word.word.trim()}
              </span>
              {word.clue && (
                <span className="text-xs text-muted-foreground truncate">
                  — {word.clue}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground/50">
              Word {index + 1} — enter a word and clue
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isComplete && isPlaced && (
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          {isComplete && !isPlaced && (
            <Badge
              variant="outline"
              className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30"
            >
              Skipped
            </Badge>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(word.id);
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Word
              </label>
              <Input
                placeholder="e.g. PARIS"
                value={word.word}
                onChange={(e) =>
                  onChange(word.id, {
                    word: e.target.value
                      .replace(/[^a-zA-Z]/g, "")
                      .toUpperCase(),
                  })
                }
                className="h-10 rounded-xl font-bold tracking-widest uppercase"
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">
                {word.word.trim().length > 0
                  ? `${word.word.trim().length} letters`
                  : "Letters only, min 2"}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3" />
                Clue
              </label>
              <div className="relative">
                <Input
                  placeholder="A hint…"
                  value={word.clue}
                  onChange={(e) => onChange(word.id, { clue: e.target.value })}
                  className="h-10 rounded-xl pr-8"
                  maxLength={80}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 text-muted-foreground/50 hover:text-primary"
                  title="AI suggest clue"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PreviewModal ─────────────────────────────────────────────────────────────

function PreviewModal({
  grid,
  recipient,
  personalMessage,
  onClose,
}: {
  grid: CrosswordGrid;
  recipient: Recipient;
  personalMessage: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-3xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background z-10">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Preview
            </p>
            <p className="text-sm font-semibold">
              {recipient.name
                ? `A crossword for ${recipient.name}`
                : "Your crossword"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl"
          >
            Close
          </Button>
        </div>
        <div className="p-6 space-y-6">
          {personalMessage && (
            <div
              className={cn(
                "px-4 py-3 rounded-2xl border",
                CROSSWORD_THEME.messageBg,
                CROSSWORD_THEME.messageBorder
              )}
            >
              <p
                className={cn(
                  "text-xs font-medium mb-1",
                  CROSSWORD_THEME.messageLabel
                )}
              >
                A message for you 💌
              </p>
              <p className={cn("text-sm", CROSSWORD_THEME.messageBody)}>
                {personalMessage}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Click a cell, then type. Click again to switch direction. Arrow
              keys to navigate.
            </p>
            <InteractivePreviewGrid grid={grid} />
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-semibold mb-3">Clues</p>
            <ClueList placedWords={grid.placedWords} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Crossword() {
  const [step, setStep] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<Recipient>({
    name: "",
    occasion: "",
  });
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [words, setWords] = useState<CrosswordWord[]>([
    createDefaultWord(),
    createDefaultWord(),
    createDefaultWord(),
  ]);
  const [grid, setGrid] = useState<CrosswordGrid | null>(null);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [gameTitle, setGameTitle] = useState<string>("");
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const validWordCount = words.filter(
    (w) => w.word.trim().length >= 2 && w.clue.trim()
  ).length;
  const placedWordCount = grid?.placedWords.length ?? 0;
  const skippedCount = validWordCount - placedWordCount;
  const placedWordIds = new Set(grid?.placedWords.map((pw) => pw.wordId) ?? []);

  const updateWord = (id: string, changes: Partial<CrosswordWord>): void => {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...changes } : w))
    );
    setGrid(null);
  };
  const addWord = (): void => {
    if (words.length < MAX_WORDS) setWords((p) => [...p, createDefaultWord()]);
  };
  const removeWord = (id: string): void => {
    setWords((p) => p.filter((w) => w.id !== id));
    setGrid(null);
  };

  const buildGrid = useCallback((): void => {
    setIsBuilding(true);
    setTimeout(() => {
      setGrid(buildCrosswordGrid(words));
      setIsBuilding(false);
    }, 50);
  }, [words]);

  useEffect(() => {
    if (validWordCount < MIN_WORDS) {
      setGrid(null);
      return;
    }
    const t = setTimeout(() => setGrid(buildCrosswordGrid(words)), 600);
    return () => clearTimeout(t);
  }, [words, validWordCount]);

  const completeness = {
    recipient: recipient.name.trim().length > 0,
    words: validWordCount >= MIN_WORDS,
    title: gameTitle.trim().length > 0,
  };
  const canPublish =
    Object.values(completeness).every(Boolean) && grid !== null;
  const missingFields = [
    !completeness.recipient && "recipient name",
    !completeness.words && `at least ${MIN_WORDS} complete words`,
    !completeness.title && "crossword title",
    !grid && "valid word arrangement",
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-muted/30">
      {showPreview && grid && (
        <PreviewModal
          grid={grid}
          recipient={recipient}
          personalMessage={personalMessage}
          onClose={() => setShowPreview(false)}
        />
      )}

      <GameTopBar
        step={step}
        onStepChange={setStep}
        stepLabels={STEP_LABELS}
        previewDisabled={!grid}
        onPreview={() => setShowPreview(true)}
        canPublish={canPublish}
        theme={CROSSWORD_THEME}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {step === 1 && (
          <RecipientStep
            recipient={recipient}
            onRecipientChange={setRecipient}
            personalMessage={personalMessage}
            onPersonalMessageChange={setPersonalMessage}
            onContinue={() => setStep(2)}
            theme={CROSSWORD_THEME}
            heading="Who's solving? 📝"
            namePlaceholder="e.g. Jamie, Grandma, My Love…"
            messagePlaceholder="A warm message your recipient sees before they start solving…"
            aiTeaserTitle="AI-powered word suggestions — coming next step"
            aiTeaserBody="Share memories or topics and our AI will generate meaningful words and clever clues to fill your crossword."
            continueLabel="Continue to words →"
          />
        )}

        {step === 2 && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  Add words & clues 📝
                </h1>
                <p className="text-muted-foreground text-sm">
                  Each word needs a clue. Words are auto-arranged into a
                  crossword grid as you type.
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 mt-1">
                {validWordCount}/{MAX_WORDS} words
              </Badge>
            </div>

            {recipient.name && (
              <AiBanner
                recipientName={recipient.name}
                theme={CROSSWORD_THEME}
                title={(name) => `AI can suggest words & clues for ${name}`}
                subtitle="Tell us about shared memories and we'll generate meaningful words"
              />
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🔤", tip: "Letters only, min 2" },
                { icon: "🔗", tip: "Words that share letters interlock" },
                { icon: "⚡", tip: "Grid updates automatically" },
              ].map((item) => (
                <div
                  key={item.tip}
                  className="rounded-2xl bg-background border border-border p-3 text-center space-y-1"
                >
                  <p className="text-xl">{item.icon}</p>
                  <p className="text-xs text-muted-foreground">{item.tip}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-3">
                {words.map((w, i) => (
                  <WordRow
                    key={w.id}
                    word={w}
                    index={i}
                    onChange={updateWord}
                    onRemove={removeWord}
                    canRemove={words.length > MIN_WORDS}
                    isPlaced={placedWordIds.has(w.id)}
                  />
                ))}
                {words.length < MAX_WORDS && (
                  <AddItemButton label="Add word" onClick={addWord} />
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Grid3X3 className="w-3.5 h-3.5" />
                      Grid preview
                    </p>
                    {validWordCount >= MIN_WORDS && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs text-muted-foreground"
                        onClick={buildGrid}
                        disabled={isBuilding}
                      >
                        <RefreshCw
                          className={cn(
                            "w-3 h-3",
                            isBuilding && "animate-spin"
                          )}
                        />
                        Rebuild
                      </Button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    {isBuilding && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <p className="text-xs">Building grid…</p>
                      </div>
                    )}
                    {!isBuilding && grid && (
                      <div className="space-y-3">
                        <GridPreview grid={grid} size="sm" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {placedWordCount} placed
                          </Badge>
                          {skippedCount > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                            >
                              {skippedCount} skipped
                            </Badge>
                          )}
                        </div>
                        {skippedCount > 0 && (
                          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                            Some words couldn't intersect. Try adding shared
                            letters.
                          </p>
                        )}
                      </div>
                    )}
                    {!isBuilding && !grid && validWordCount < MIN_WORDS && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                        <Grid3X3 className="w-8 h-8 opacity-20" />
                        <p className="text-xs">
                          Add at least {MIN_WORDS} complete words to generate
                          the grid
                        </p>
                      </div>
                    )}
                    {!isBuilding && !grid && validWordCount >= MIN_WORDS && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                        <AlertCircle className="w-6 h-6 opacity-40" />
                        <p className="text-xs">
                          Couldn't arrange these words. Try words that share
                          more letters.
                        </p>
                      </div>
                    )}
                  </div>

                  {grid && (
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Clues
                      </p>
                      <ClueList placedWords={grid.placedWords} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-11 px-5 rounded-xl"
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!grid}
                className="h-11 px-6 rounded-xl"
              >
                Continue to publish →
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <SummaryCard
              items={[
                {
                  icon: "👤",
                  label: "Recipient",
                  value: recipient.name || "—",
                },
                {
                  icon: "🎉",
                  label: "Occasion",
                  value: recipient.occasion || "—",
                },
                {
                  icon: "📝",
                  label: "Words",
                  value: `${placedWordCount} in grid`,
                },
              ]}
            >
              {grid && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Grid preview
                  </p>
                  <GridPreview grid={grid} size="sm" />
                </div>
              )}
            </SummaryCard>

            <PublishStep
              recipient={recipient}
              gameTitle={gameTitle}
              onGameTitleChange={setGameTitle}
              canPublish={canPublish}
              missingFields={missingFields}
              onPublish={() => {}}
              onPreview={() => setShowPreview(true)}
              previewDisabled={!grid}
              onBack={() => setStep(2)}
              backLabel="← Back to words"
              theme={CROSSWORD_THEME}
              titlePlaceholder={`e.g. "Our Story in Words" for ${
                recipient.name || "them"
              }`}
            >
              <ToggleSetting
                icon={Lightbulb}
                label='Allow "Reveal solution"'
                description="Let the player peek at answers if they get stuck"
                value={showSolution}
                onChange={setShowSolution}
              />
            </PublishStep>
          </>
        )}
      </div>
    </div>
  );
}
