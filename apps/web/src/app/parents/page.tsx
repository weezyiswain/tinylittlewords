"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, Download, Share2, Sparkles } from "lucide-react";

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
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 py-3 first:pt-0 last:border-b-0 last:pb-0">
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
  const [showAppDetails, setShowAppDetails] = useState(false);
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
    <main
      className="min-h-[var(--app-height,100dvh)] bg-[var(--app-bg)] px-4 py-8 pt-[calc(var(--safe-top)+2rem)] sm:px-10 sm:py-12"
      style={{ paddingBottom: "max(1.5rem, var(--safe-bottom))" }}
    >
      <div className="mx-auto max-w-xl space-y-8">
        {/* Header */}
        <div className="flex items-center">
          <Link
            href="/"
            className="inline-flex min-h-[44px] min-w-[4rem] shrink-0 items-center gap-1 text-sm text-slate-600 transition hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </Link>
          <h1 className="flex flex-1 justify-center text-xl font-bold text-neutral-900">
            For parents
          </h1>
          <div className="min-w-[4rem] shrink-0" aria-hidden />
        </div>

        {/* Intro section - not in a card */}
        <section>
          <h2 className="text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl">
            Built for kids who want to play with words — not race through them.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-600">
            Tiny Little Words started at home. Our kids wanted to join in when we played word puzzles, but most games moved too fast and felt stressful. We wanted something calm, welcoming, and confidence-building.
          </p>
        </section>

        {/* What we're focusing on */}
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold text-neutral-900">What we&apos;re focusing on</h2>
          <ul className="mt-5 space-y-5">
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600" aria-hidden>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Confidence over speed</h3>
                <p className="mt-0.5 text-sm text-neutral-600">
                  Short, repeatable puzzles that reward trying—not racing.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600" aria-hidden>
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Early readers & homeschool families</h3>
                <p className="mt-0.5 text-sm text-neutral-600">
                  Designed for kids learning to spell, read, and recognize word patterns.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-lg" aria-hidden>
                😊
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Meaningful practice</h3>
                <p className="mt-0.5 text-sm text-neutral-600">
                  Word packs based on topics kids care about (animals, food, sports) and language building blocks (nouns, verbs).
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* Help shape what comes next */}
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold text-neutral-900">Help shape what comes next</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Trying it with your kids already helps. Sharing feedback — or passing it to another family — helps even more.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/feedback?from=parents" className="inline-block">
              <Button
                type="button"
                size="lg"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700 focus-visible:ring-blue-500"
              >
                Give feedback
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => void handleShare()}
              className="min-h-[44px] min-w-[44px] rounded-xl border-neutral-300 bg-white px-5 text-neutral-700 shadow-sm hover:bg-neutral-50 hover:text-neutral-900 focus-visible:ring-neutral-500"
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Share with another parent
            </Button>
          </div>
        </section>

        {/* App details - tappable row */}
        <button
          type="button"
          onClick={() => setShowAppDetails(true)}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-200/80 bg-white px-5 py-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]"
        >
          <span className="font-medium text-neutral-900">App details</span>
          <ChevronRight className="h-5 w-5 text-neutral-400" aria-hidden />
        </button>

        {/* App details modal */}
        <Dialog open={showAppDetails} onOpenChange={setShowAppDetails}>
          <DialogContent className="max-h-[85dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>App details</DialogTitle>
              <DialogDescription>
                Version and usage info for Tiny Little Words.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <InfoRow
                label="Version"
                value={
                  <span className="flex items-center justify-end gap-2">
                    <span>{APP_VERSION}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAppDetails(false);
                        setShowVersionModal(true);
                      }}
                      className="h-7 shrink-0 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-normal text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 focus-visible:ring-neutral-500"
                    >
                      Is this the latest?
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
              <div className="mt-6 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
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
                  onClick={() => {
                    setShowAppDetails(false);
                    setShowInstallModal(true);
                  }}
                  className="shrink-0 border border-blue-600 bg-white text-blue-600 shadow-sm hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-500"
                >
                  Show me how
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
      </div>
    </main>
  );
}
