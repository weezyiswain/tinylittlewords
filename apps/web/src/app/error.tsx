"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center bg-neutral-50 px-6 py-12 text-center"
      style={{ paddingBottom: "max(1.5rem, var(--safe-bottom))" }}
    >
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-8 shadow-sm max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-700">
          Tiny Little Words
        </p>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-neutral-600 sm:text-base">
          An unexpected hiccup stopped this page from loading. You can try the
          action again or head back home for a fresh start.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-full bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
