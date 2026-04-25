import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { giftSiteService } from "@/services/giftSite";

export default function GiftViewer() {
  const { giftId } = useParams<{ giftId: string }>();
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!giftId) return;

    let cancelled = false;
    const MAX_ATTEMPTS = 60;
    let attempts = 0;

    const check = async () => {
      try {
        const res = await giftSiteService.getGift(giftId);
        if (cancelled) return;
        if (res.status === "READY" && res.html) {
          setHtml(res.html);
          setIsLoading(false);
        } else if (res.status === "ERROR" || ++attempts >= MAX_ATTEMPTS) {
          setError("This gift could not be generated. The link may be invalid.");
          setIsLoading(false);
        } else {
          setTimeout(check, 3000);
        }
      } catch {
        if (!cancelled) {
          setError("This gift link is invalid or has expired.");
          setIsLoading(false);
        }
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [giftId]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <span
          className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-muted-foreground">Loading your gift...</p>
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">{error || "Gift not found."}</p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      sandbox="allow-scripts allow-same-origin"
      className="h-screen w-full border-none"
      title="Your gift"
    />
  );
}
