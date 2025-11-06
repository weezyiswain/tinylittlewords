"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="rounded-3xl border border-white/60 bg-white/85 px-6 py-8 shadow-[0_20px_50px_rgba(173,216,255,0.35)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">
          Tiny Little Words
        </p>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Something went wrong</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          An unexpected hiccup stopped this page from loading. You can try the
          action again or head back home for a fresh start.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#ff87cf] via-[#ffb973] to-[#6bdff9] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,174,204,0.45)] transition hover:shadow-[0_14px_36px_rgba(255,174,204,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/70 bg-white px-5 py-2 text-sm font-semibold text-primary shadow-[0_10px_24px_rgba(173,216,255,0.3)] transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
