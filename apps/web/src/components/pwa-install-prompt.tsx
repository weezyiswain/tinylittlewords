"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "tlw-pwa-install-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSFallback, setShowIOSFallback] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    if (!("onbeforeinstallprompt" in window) && isIOS()) {
      setShowIOSFallback(true);
      setShowBanner(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setShowInstructions(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }, []);

  if (!showBanner) return null;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_28px_rgba(20,184,166,0.15)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Download className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Install as app</p>
            <p className="text-xs text-muted-foreground">
              {deferredPrompt
                ? "Add to your home screen for quick access."
                : "Get the best experience by adding Tiny Little Words to your home screen."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {deferredPrompt ? (
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(20,184,166,0.35)] transition hover:shadow-[0_12px_28px_rgba(20,184,166,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden />
            Add to Home Screen
          </button>
        ) : showIOSFallback ? (
          <>
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
            >
              How to install
            </button>
            {showInstructions && (
              <div className="w-full rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">On iPhone or iPad:</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4">
                  <li>Tap the Share button (square with arrow) in Safari.</li>
                  <li>Scroll and tap &quot;Add to Home Screen&quot;.</li>
                  <li>Tap &quot;Add&quot; in the top right.</li>
                </ol>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
