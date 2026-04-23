import type { Dispatch, SetStateAction } from "react";
import type { UiClasses, ViewValue } from "../../../types/giftSite";

interface PreviewViewProps {
  uiClasses: UiClasses;
  previewMode: "desktop" | "phone";
  setPreviewMode: Dispatch<SetStateAction<"desktop" | "phone">>;
  generatedHtml: string;
  publishGiftSite: () => void;
  generateGiftSite: () => void;
  isLoading: boolean;
  setView: Dispatch<SetStateAction<ViewValue>>;
  formView: ViewValue;
  errorMessage: string;
}

export default function PreviewView({
  uiClasses,
  previewMode,
  setPreviewMode,
  generatedHtml,
  publishGiftSite,
  generateGiftSite,
  isLoading,
  setView,
  formView,
  errorMessage,
}: PreviewViewProps) {
  const isPhonePreview = previewMode === "phone";
  const phoneScale = 0.82;

  return (
    <section
      className="rounded-xl border bg-card p-4 shadow-sm md:p-6"
      aria-live="polite"
    >
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        Live Preview
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        This is exactly how your generated page looks. Publish when you are
        ready to share.
      </p>

      <div className="rounded-xl border bg-background p-3.5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.03em] text-muted-foreground">
            Preview mode
          </span>
          <div
            className="inline-flex gap-1 rounded-full border bg-muted/40 p-1"
            role="tablist"
            aria-label="Preview mode selector"
          >
            <button
              type="button"
              className={
                previewMode === "desktop"
                  ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground"
              }
              onClick={() => setPreviewMode("desktop")}
            >
              Desktop
            </button>
            <button
              type="button"
              className={
                previewMode === "phone"
                  ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground"
              }
              onClick={() => setPreviewMode("phone")}
            >
              Phone
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-background">
          <div
            className="flex items-center gap-2 border-b bg-muted/35 px-3 py-2.5"
            aria-hidden="true"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/45" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/45" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/45" />
          </div>

          <div
            className={
              isPhonePreview
                ? "mx-auto mt-3 h-[min(76vh,760px)] w-full max-w-97.5 overflow-auto rounded-[34px] border-[6px] border-border bg-muted p-2 shadow-sm"
                : "mt-3 min-h-105 overflow-hidden rounded-xl border bg-background md:min-h-[68vh]"
            }
          >
            <iframe
              title="Gift preview"
              className={
                isPhonePreview
                  ? "block origin-top-left rounded-3xl border bg-background"
                  : "block min-h-105 w-full border-0 bg-background md:min-h-[68vh]"
              }
              style={
                isPhonePreview
                  ? {
                      transform: `scale(${phoneScale})`,
                      width: `${100 / phoneScale}%`,
                      height: `${100 / phoneScale}%`,
                    }
                  : undefined
              }
              srcDoc={generatedHtml}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          className={uiClasses.btnPrimary}
          type="button"
          onClick={publishGiftSite}
        >
          Publish & Get Link
        </button>
        <button
          className={uiClasses.btnGhost}
          type="button"
          onClick={generateGiftSite}
          disabled={isLoading}
        >
          {isLoading ? "Regenerating..." : "Regenerate"}
        </button>
        <button
          className={uiClasses.btnGhost}
          type="button"
          onClick={() => setView(formView)}
        >
          Edit
        </button>
      </div>

      {errorMessage && (
        <div className="mt-3.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {errorMessage}
        </div>
      )}
    </section>
  );
}
