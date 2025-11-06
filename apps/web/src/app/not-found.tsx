import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="rounded-3xl border border-white/60 bg-white/85 px-6 py-8 shadow-[0_20px_50px_rgba(173,216,255,0.35)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">
          Tiny Little Words
        </p>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Page not found</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          The page you&apos;re looking for wandered off the word path. Head back
          home to start a fresh puzzle.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#ff87cf] via-[#ffb973] to-[#6bdff9] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,174,204,0.45)] transition hover:shadow-[0_14px_36px_rgba(255,174,204,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
