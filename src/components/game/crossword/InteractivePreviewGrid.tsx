import { useState, useCallback, useRef } from "react";
import { Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CrosswordGrid, Direction } from "./types";

export function InteractivePreviewGrid({ grid }: { grid: CrosswordGrid }) {
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
  const CELL = 32,
    CELL_SM = 36,
    NUM_SIZE = 8,
    NUM_SIZE_SM = 9;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="overflow-auto -mx-1 px-1">
        <div
          className="inline-grid gap-px bg-border rounded-lg sm:rounded-xl overflow-hidden border border-border"
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, var(--cell-size))`,
          }}
        >
          <style>{`
            :root { --cell-size: ${CELL}px; --num-size: ${NUM_SIZE}px; --letter-size: 12px; }
            @media (min-width: 640px) { :root { --cell-size: ${CELL_SM}px; --num-size: ${NUM_SIZE_SM}px; --letter-size: 14px; } }
          `}</style>
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
                  style={{
                    width: "var(--cell-size)",
                    height: "var(--cell-size)",
                  }}
                >
                  {!cell.isBlack && (
                    <>
                      {cell.number !== undefined && (
                        <span
                          className="absolute top-0.5 left-0.5 text-primary font-bold leading-none pointer-events-none"
                          style={{ fontSize: "var(--num-size)" }}
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
                          "w-full h-full text-center font-bold uppercase bg-transparent outline-none border-none caret-transparent",
                          isCorrect
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isWrong
                            ? "text-red-500"
                            : "text-foreground"
                        )}
                        style={{ fontSize: "var(--letter-size)" }}
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
      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="h-7 sm:h-8 text-[10px] sm:text-xs gap-1 sm:gap-1.5 px-2 sm:px-3"
          onClick={() => setRevealed(true)}
        >
          <Check className="w-3 h-3" />
          Check
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 sm:h-8 text-[10px] sm:text-xs gap-1 sm:gap-1.5 px-2 sm:px-3"
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
          <Badge
            variant="secondary"
            className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
          >
            {checkAnswers()}% correct
          </Badge>
        )}
      </div>
    </div>
  );
}
