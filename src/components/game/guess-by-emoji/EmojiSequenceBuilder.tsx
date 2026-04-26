import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";

interface EmojiSequenceBuilderProps {
  emojis: string[];
  onChange: (e: string[]) => void;
}

const EMOJI_SEQUENCE_REGEX =
  /(?:\p{Regional_Indicator}{2}|(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:\p{Emoji_Modifier})?(?:\uFE0F)?(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:\p{Emoji_Modifier})?(?:\uFE0F)?)*)/gu;

export function EmojiSequenceBuilder({
  emojis,
  onChange,
}: EmojiSequenceBuilderProps) {
  const isMobile = useIsMobile();
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [mobileInputOpen, setMobileInputOpen] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  useEffect(() => {
    if (!isMobile) {
      setMobileInputOpen(false);
    }
  }, [isMobile]);

  const addEmoji = useCallback(
    (emoji: string) => {
      if (emojis.length >= 10) return;
      onChange([...emojis, emoji]);
    },
    [emojis, onChange]
  );

  const removeEmoji = useCallback(
    (index: number) => {
      onChange(emojis.filter((_, i) => i !== index));
    },
    [emojis, onChange]
  );

  const moveEmoji = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= emojis.length) return;
      const next = [...emojis];
      [next[from], next[to]] = [next[to], next[from]];
      onChange(next);
    },
    [emojis, onChange]
  );

  const extractEmojis = useCallback((value: string): string[] => {
    return value.match(EMOJI_SEQUENCE_REGEX) ?? [];
  }, []);

  const handleAddTrigger = useCallback(() => {
    if (isMobile) {
      setPickerOpen(false);
      setMobileInputOpen(true);
      requestAnimationFrame(() => mobileInputRef.current?.focus());
      return;
    }
    setMobileInputOpen(false);
    setPickerOpen((prev) => !prev);
  }, [isMobile]);

  const handleMobileInputChange = useCallback(
    (value: string) => {
      const parsed = extractEmojis(value);
      if (parsed.length === 0) return;
      const roomLeft = Math.max(10 - emojis.length, 0);
      if (roomLeft === 0) return;
      onChange([...emojis, ...parsed.slice(0, roomLeft)]);
    },
    [emojis, extractEmojis, onChange]
  );

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="min-h-14 sm:min-h-16 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-dashed border-border bg-muted/30 space-y-2">
        {emojis.length === 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground/60 text-center">
            Add emojis to build your puzzle
          </p>
        )}

        {emojis.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center justify-center">
            {emojis.map((e, i) => (
              <div
                key={i}
                className="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl rounded-lg sm:rounded-xl bg-background border border-border shadow-sm hover:border-primary/40 transition-all"
              >
                <span className="select-none">{e}</span>
                <div className="absolute -top-1 -right-1 hidden group-hover:flex flex-col gap-px">
                  <button
                    type="button"
                    onClick={() => moveEmoji(i, i - 1)}
                    disabled={i === 0}
                    className="w-4 h-4 rounded bg-background border border-border flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
                  >
                    <ChevronUp className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveEmoji(i, i + 1)}
                    disabled={i === emojis.length - 1}
                    className="w-4 h-4 rounded bg-background border border-border flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
                  >
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeEmoji(i)}
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground items-center justify-center flex sm:hidden group-hover:flex"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {emojis.length < 10 && (
          <div className="relative flex justify-center" ref={pickerRef}>
            <button
              type="button"
              onClick={handleAddTrigger}
              className={cn(
                "w-11 h-11 sm:w-14 sm:h-14 rounded-xl border-2 border-dashed flex items-center justify-center transition-all",
                pickerOpen
                  ? "border-primary bg-primary/5"
                  : "border-border text-muted-foreground/40 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
              )}
              aria-label="Add emoji"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            {pickerOpen && !isMobile && (
              <div className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2">
                <EmojiPicker
                  onEmojiClick={(data: EmojiClickData) => {
                    addEmoji(data.emoji);
                  }}
                  height={340}
                  width={280}
                  searchPlaceholder="Search emojis..."
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>
        )}

        {isMobile && emojis.length < 10 && mobileInputOpen && (
          <div className="space-y-1.5">
            <input
              ref={mobileInputRef}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Use emoji keyboard and type here"
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
              onChange={(e) => {
                handleMobileInputChange(e.target.value);
                e.target.value = "";
              }}
              onBlur={() => setMobileInputOpen(false)}
            />
            <p className="text-[10px] text-muted-foreground text-center">
              Only emoji characters are accepted. Letters are ignored.
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {emojis.length}/10 emojis
          <span className="hidden sm:inline"> · hover to reorder or remove</span>
        </p>
        {emojis.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] sm:text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
