import type { PlacedWord } from "./types";

export function ClueList({ placedWords }: { placedWords: PlacedWord[] }) {
  const across = placedWords
    .filter((pw) => pw.direction === "across")
    .sort((a, b) => a.number - b.number);
  const down = placedWords
    .filter((pw) => pw.direction === "down")
    .sort((a, b) => a.number - b.number);
  return (
    <div className="space-y-3 sm:space-y-4">
      {[
        { label: "Across", words: across },
        { label: "Down", words: down },
      ].map(({ label, words }) => (
        <div key={label}>
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 sm:mb-2">
            {label}
          </p>
          <div className="space-y-1 sm:space-y-1.5">
            {words.map((pw) => (
              <div
                key={pw.wordId}
                className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <span className="font-bold text-primary shrink-0 w-4 sm:w-5 text-right">
                  {pw.number}.
                </span>
                <span className="text-muted-foreground leading-snug">
                  {pw.clue}
                </span>
              </div>
            ))}
            {words.length === 0 && (
              <p className="text-[10px] sm:text-xs text-muted-foreground/50 italic">
                None yet
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
