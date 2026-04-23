import type { CSSProperties, Dispatch, SetStateAction } from "react";
import type {
  ConfettiPiece,
  GiftRecord,
  UiClasses,
  ViewValue,
} from "../../../types/giftSite";

interface PublishedViewProps {
  uiClasses: UiClasses;
  confettiPieces: ConfettiPiece[];
  publishedLink: string;
  copied: boolean;
  copyLink: () => void;
  setView: Dispatch<SetStateAction<ViewValue>>;
  formView: ViewValue;
  myGifts: GiftRecord[];
  errorMessage: string;
}

export default function PublishedView({
  uiClasses,
  confettiPieces,
  publishedLink,
  copied,
  copyLink,
  setView,
  formView,
  myGifts,
  errorMessage,
}: PublishedViewProps) {
  return (
    <section
      className="relative rounded-xl border bg-card p-4 shadow-sm md:p-6"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className="absolute -top-2.5 h-4 w-2.5 rounded-sm opacity-0 animate-confetti-drop"
            style={
              {
                left: piece.left,
                animationDelay: piece.delay,
                backgroundColor: `hsl(${piece.hue} 72% 72%)`,
                "--rotation": piece.rotation,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        It is Live 🎉
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Your gift page now has a shareable URL.
      </p>

      <div className="my-4 break-all rounded-lg border bg-background p-3 text-sm font-medium">
        {publishedLink}
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          className={uiClasses.btnPrimary}
          type="button"
          onClick={copyLink}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          className={uiClasses.btnGhost}
          type="button"
          onClick={() => setView(formView)}
        >
          Create Another Gift
        </button>
      </div>

      <section className="mt-6">
        <h3 className="mb-2.5 text-lg font-semibold">My Gifts</h3>
        {myGifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No gifts in storage yet.
          </p>
        ) : (
          <ul className="grid list-none gap-2 p-0">
            {myGifts.map((gift) => (
              <li
                key={gift.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5"
              >
                <div>
                  <strong>{gift.recipientName || "Untitled Gift"}</strong>
                  <small className="text-muted-foreground">
                    {" "}
                    · {gift.occasion || "Occasion"} ·{" "}
                    {new Date(gift.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <small className="text-muted-foreground">g/{gift.id}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      {errorMessage && (
        <div className="mt-3.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {errorMessage}
        </div>
      )}
    </section>
  );
}
