"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { getPackExampleIcons } from "@/lib/pack-icons";

type GameInfoCarouselProps = {
  packLabel: string | null;
  hints: string[];
  revealedHints: boolean[];
  onRevealHint: (index: number) => void;
  highlightHintSlide?: boolean;
  winsToday: number;
  streak: number;
  totalGames: number;
  statsRefresh?: number;
};

/* Unified card dimensions and style */
const CARD_HEIGHT = "min-h-[88px]";
const CARD_PADDING = "px-4 py-3";
const CARD_RADIUS = "rounded-xl";
const CARD_SHADOW = "shadow-[0_1px_3px_rgba(0,0,0,0.06)]";
const CARD_BORDER = "border border-slate-200/70";
const CARD_BG = "bg-white";

const SPARKLE_COUNT = 4;
const SPARKLE_DURATION_MS = 400;

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
    <div className="relative min-w-0 flex-1 overflow-hidden rounded-lg">
      {/* Hint text always in DOM, visible when revealed */}
      <p
        className={cn(
          "text-sm font-medium text-foreground transition-opacity duration-300",
          !isRevealed && "select-none blur-[2px] opacity-40"
        )}
      >
        {hint}
      </p>

      {/* Diffused overlay - fades out on reveal */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm transition-opacity duration-300",
          isRevealed && "pointer-events-none opacity-0"
        )}
        aria-hidden={isRevealed}
      >
        <button
          type="button"
          onClick={onReveal}
          disabled={isRevealed}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 disabled:pointer-events-none"
          aria-label="Show hint"
        >
          Show hint
        </button>
      </div>

      {/* Sparkle on reveal - gentle shimmer */}
      {sparkleActive && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
          aria-hidden
        >
          {Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
            <span
              key={i}
              className="absolute text-amber-400/60"
              style={{
                left: `${18 + i * 24}%`,
                top: "45%",
                fontSize: "0.6rem",
                animation: `sparkle-burst ${SPARKLE_DURATION_MS}ms ease-out forwards`,
                animationDelay: `${i * 30}ms`,
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

const CARD_BASE = cn(
  CARD_HEIGHT,
  CARD_PADDING,
  CARD_RADIUS,
  CARD_SHADOW,
  CARD_BORDER,
  CARD_BG,
  "flex shrink-0 flex-col justify-center"
);

export function GameInfoCarousel({
  packLabel,
  hints,
  revealedHints,
  onRevealHint,
  highlightHintSlide = false,
  winsToday,
  streak,
  totalGames,
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
      const t = setTimeout(() => setSparkleIndex(null), SPARKLE_DURATION_MS + 80);
      return () => clearTimeout(t);
    },
    [onRevealHint]
  );

  const packName =
    packLabel?.replace(/\s+Pack$/i, "").trim() || "Surprise me";
  const showPackLabel = packLabel != null && packLabel.trim() !== "";
  const packIcons = getPackExampleIcons(packLabel);

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
        {/* Slide 1: Word Pack */}
        <div
          className={cn(CARD_BASE)}
          style={{
            width: "85%",
            minWidth: "85%",
            scrollSnapAlign: "start",
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Word pack
          </p>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="text-base font-semibold text-foreground">
              {showPackLabel ? packName : "Surprise me"}
            </p>
            {packIcons.length > 0 && (
              <div className="flex shrink-0 items-center gap-0.5 text-base opacity-60" aria-hidden>
                {packIcons.slice(0, 4).map((icon, i) => (
                  <span key={i} className="leading-none">
                    {icon}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Slide 2: Hint */}
        <div
          className={cn(
            CARD_BASE,
            highlightHintSlide && "border-primary/30 bg-primary/5"
          )}
          style={{
            width: "85%",
            minWidth: "85%",
            scrollSnapAlign: "start",
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Hint
          </p>
          <div className="mt-1.5">
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
        </div>

        {/* Slide 3: Stats - 3-column */}
        <div
          className={cn(CARD_BASE)}
          style={{
            width: "85%",
            minWidth: "85%",
            scrollSnapAlign: "start",
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Your stats
          </p>
          <div className="mt-1.5 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Today
              </p>
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {winsToday}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Streak
              </p>
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {streak}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Total
              </p>
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {totalGames}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
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
