import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";

interface EmojiPickerButtonProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPickerButton({ selected, onSelect }: EmojiPickerButtonProps) {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-9 h-9 sm:w-10 sm:h-10 text-lg sm:text-xl rounded-lg sm:rounded-xl border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center"
      >
        {selected || "😊"}
      </button>
      {open && (
        <div className="absolute z-50 top-11 sm:top-12 left-0 sm:left-auto sm:right-auto">
          <EmojiPicker
            onEmojiClick={(emojiData: EmojiClickData) => {
              onSelect(emojiData.emoji);
              setOpen(false);
            }}
            width={280}
            height={350}
            searchPlaceHolder="Search emoji…"
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}
