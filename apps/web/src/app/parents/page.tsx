"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Share2 } from "lucide-react";

import { APP_VERSION } from "@/lib/app-version";
import { canonicalUrl, seoConfig } from "@/lib/seo";
import { getStats, type Stats } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 border-b border-neutral-100 last:border-b-0">
      <span className="text-sm font-medium text-neutral-900">{label}</span>
      <span className="text-sm text-neutral-600 tabular-nums">{value}</span>
    </div>
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function ParentsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showInstallBlock, setShowInstallBlock] = useState<boolean | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShowInstallBlock(!isStandalone());
  }, []);

  const handleShare = async () => {
    const url = canonicalUrl("/");
    const title = seoConfig.siteName;
    const text = "A word puzzle game for brave readers ages 6–10. No sign-in—just open and play.";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          try {
            await navigator.clipboard?.writeText(url);
          } catch {
            window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`, "_blank");
          }
        }
      }
    } else {
      try {
        await navigator.clipboard?.writeText(url);
      } catch {
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`, "_blank");
      }
    }
  };

  return (
    <main className="min-h-dvh bg-neutral-50 px-4 py-8 pt-[calc(env(safe-area-inset-top,0)+2rem)] sm:px-10 sm:py-12">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center">
          <Link
            href="/"
            className="inline-flex min-w-[4rem] shrink-0 items-center gap-1 text-sm text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </Link>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-xl font-bold text-neutral-900">For parents</h1>
            <p className="mt-1 text-sm text-neutral-500/80">
              Tiny Little Words is in test mode.
            </p>
          </div>
          <div className="min-w-[4rem] shrink-0" aria-hidden />
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">About Tiny Little Words</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Tiny Little Words is a word puzzle game built for brave readers ages 6–10. Kids pick a word length, choose a friendly buddy to cheer them on, and play through short, focused rounds. No sign-in required—just open and play.
          </p>
          <p className="mt-3 text-sm text-neutral-600">
            We&apos;re in an early phase and improving the app with feedback from families. Our goal is to make word practice feel fun and low-pressure.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Share with other parents</h2>
          <p className="mt-1 text-sm text-neutral-600">
            We&apos;re trying to learn as much as we can right now. If you know another parent who might want to try Tiny Little Words, feel free to share it with them.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleShare()}
            className="mt-4 border border-neutral-300 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 hover:text-neutral-900 focus-visible:ring-neutral-500"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            Share this app
          </Button>
        </section>

        <Dialog open={showInstallModal} onOpenChange={setShowInstallModal}>
          <DialogContent className="max-h-[85dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add to your phone</DialogTitle>
              <DialogDescription>
                You can pin Tiny Little Words to your home screen so it opens like a regular app—no app store needed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">On iPhone or iPad (Safari)</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-neutral-600">
                  <li>Open this site in Safari (not in another browser).</li>
                  <li>Tap the Share button at the bottom (square with an arrow).</li>
                  <li>Scroll and tap &quot;Add to Home Screen.&quot;</li>
                  <li>Tap &quot;Add&quot; in the top right.</li>
                </ol>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">On Android (Chrome)</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-neutral-600">
                  <li>Open this site in Chrome.</li>
                  <li>Tap the menu (three dots) in the top right.</li>
                  <li>Tap &quot;Add to Home screen&quot; or &quot;Install app.&quot;</li>
                  <li>Confirm with &quot;Add&quot; or &quot;Install.&quot;</li>
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showVersionModal} onOpenChange={setShowVersionModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Getting the latest version</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3 text-left text-sm text-neutral-600">
                  <p>
                    To see the latest version, close the app completely and reopen it from your home screen.
                  </p>
                  <p>
                    In the future we&apos;ll automatically update for major changes, but we don&apos;t have that yet while we&apos;re testing.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Feedback</h2>
          <p className="mt-1 text-sm text-neutral-600">
            We&apos;d love to hear from you—your feedback shapes what we build next.
          </p>
          <Link href="/feedback?from=parents" className="mt-4 inline-block">
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500"
            >
              Give feedback
            </Button>
          </Link>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">App info</h2>
          <div className="mt-3">
            <InfoRow
              label="Version"
              value={
                <span className="flex items-center justify-end gap-2">
                  <span>{APP_VERSION}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVersionModal(true)}
                    className="h-7 shrink-0 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-normal text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 focus-visible:ring-neutral-500"
                  >
                    Is this the latest version?
                  </Button>
                </span>
              }
            />
            <InfoRow label="Games played" value={stats?.totalGames ?? 0} />
            <InfoRow
              label="Data storage"
              value={
                <>
                  This device only{" "}
                  <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-500">
                    local
                  </span>
                </>
              }
            />
          </div>
          {showInstallBlock === true && (
            <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Download className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Install as app</p>
                  <p className="text-xs text-muted-foreground">
                    Add to your home screen for quick access.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowInstallModal(true)}
                className="shrink-0 border border-blue-600 bg-white text-blue-600 shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 focus-visible:ring-blue-500"
              >
                Show me how
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
