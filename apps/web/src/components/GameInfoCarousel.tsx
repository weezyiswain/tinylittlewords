"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

type GameInfoCarouselProps = {
  packLabel: string | null;
  hints: string[];
  revealedHints: boolean[];
  onRevealHint: (index: number) => void;
  highlightHintSlide?: boolean;
  winsToday: number;
  streak: number;
  statsRefresh?: number;
};

const SPARKLE_COUNT = 4;
const SPARKLE_DURATION_MS = 550;

function HintTile({
  hint,
  isRevealed,
  onReveal,
  sparkleActive,
}: {
  hint: string;
  isRevealed: boolean;
  onReveal: () => void;
  sparkleActive: boolean;
}) {
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-200/60 bg-white/95 p-3">
      {/* Hint text (visible when revealed) */}
      <p
        className={cn(
          "text-sm font-medium text-foreground transition-opacity duration-300",
          isRevealed ? "opacity-100" : "opacity-0"
        )}
      >
        {hint}
      </p>

      {/* Diffused overlay with Show hint button - fades out on reveal */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-lg border border-white/60 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300",
          isRevealed && "pointer-events-none opacity-0"
        )}
        aria-hidden={isRevealed}
      >
        <button
          type="button"
          onClick={onReveal}
          disabled={isRevealed}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:pointer-events-none"
          aria-label="Show hint"
        >
          <Lightbulb className="h-4 w-4" aria-hidden />
          Show hint
        </button>
      </div>

      {/* Sparkle burst - CSS respects prefers-reduced-motion */}
      {sparkleActive && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
          aria-hidden
        >
          {Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
            <span
              key={i}
              className="absolute text-amber-400/70"
              style={{
                left: `${20 + i * 22}%`,
                top: "50%",
                fontSize: "0.65rem",
                animation: `sparkle-burst ${SPARKLE_DURATION_MS}ms ease-out forwards`,
                animationDelay: `${i * 40}ms`,
              }}
            >
              ✦
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function GameInfoCarousel({
  packLabel,
  hints,
  revealedHints,
  onRevealHint,
  highlightHintSlide = false,
  winsToday,
  streak,
}: GameInfoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sparkleIndex, setSparkleIndex] = useState<number | null>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.offsetWidth * 0.85;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, 2));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleReveal = useCallback(
    (index: number) => {
      onRevealHint(index);
      setSparkleIndex(index);
      const t = setTimeout(() => setSparkleIndex(null), SPARKLE_DURATION_MS + 100);
      return () => clearTimeout(t);
    },
    [onRevealHint]
  );

  const packName =
    packLabel?.replace(/\s+Pack$/i, "").trim() || "Surprise me";
  const showPackLabel = packLabel != null && packLabel.trim() !== "";
  const hintsLeft = hints.length - revealedHints.filter(Boolean).length;

  return (
    <div
      className="relative z-10 w-full shrink-0 overflow-hidden px-4"
      style={{
        paddingLeft: "max(1rem, env(safe-area-inset-left, 0px))",
        paddingRight: "max(1rem, env(safe-area-inset-right, 0px))",
      }}
    >
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Slide 1: Pack context */}
        <div
          className="flex shrink-0 flex-col justify-center rounded-xl border border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm"
          style={{
            width: "85%",
            minWidth: "85%",
            scrollSnapAlign: "start",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Word pack
          </p>
          <p className="mt-0.5 text-lg font-medium text-foreground">
            {showPackLabel ? packName : "Surprise me"}
          </p>
        </div>

        {/* Slide 2: Hint */}
        <div
          className={cn(
            "flex shrink-0 flex-col gap-2 rounded-xl border px-4 py-4 shadow-sm",
            highlightHintSlide
              ? "border-primary/40 bg-primary/5"
              : "border-slate-200/80 bg-white/90"
          )}
          style={{
            width: "85%",
            minWidth: "85%",
            scrollSnapAlign: "start",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {hints.length > 0
              ? `${hintsLeft} hint${hintsLeft !== 1 ? "s" : ""} left`
              : "Hints"}
          </p>

          {hints.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hints for this word.
            </p>
          ) : hints.length === 1 ? (
            <HintTile
              hint={hints[0]!}
              isRevealed={revealedHints[0] ?? false}
              onReveal={() => handleReveal(0)}
              sparkleActive={sparkleIndex === 0}
            />
          ) : (
            <div className="flex min-w-0 gap-2">
              {hints.map((hint, i) => (
                <HintTile
                  key={i}
                  hint={hint}
                  isRevealed={revealedHints[i] ?? false}
                  onReveal={() => handleReveal(i)}
                  sparkleActive={sparkleIndex === i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Slide 3: Stats */}
        <div
          className="flex shrink-0 flex-col justify-center rounded-xl border border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm"
          style={{
            width: "85%",
            minWidth: "85%",
            scrollSnapAlign: "start",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your stats
          </p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0 text-sm text-muted-foreground">
            <span>Wins today: {winsToday}</span>
            <span>Streak: {streak}</span>
          </div>
        </div>
      </div>

      {/* 3 dots indicator */}
      <div className="flex justify-center gap-1.5 pb-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              const cardWidth = el.offsetWidth * 0.85;
              const gap = 12;
              el.scrollTo({
                left: i * (cardWidth + gap),
                behavior: "smooth",
              });
              setActiveIndex(i);
            }}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              activeIndex === i ? "bg-primary" : "bg-slate-300"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
