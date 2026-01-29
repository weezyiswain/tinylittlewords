"use client";

import { useEffect, useState } from "react";
import { getStats, type Stats } from "@/lib/stats";
import { cn } from "@/lib/utils";

type StatsDisplayProps = {
  refreshTrigger?: number;
  variant?: "compact" | "block";
  className?: string;
};

export function StatsDisplay({
  refreshTrigger = 0,
  variant = "compact",
  className,
}: StatsDisplayProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, [refreshTrigger]);

  if (!stats) return null;

  const { winsToday, streak, totalGames } = stats;
  const showCompact = winsToday > 0 || streak > 0 || totalGames > 0;

  if (variant === "block") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_10px_24px_rgba(173,216,255,0.2)] backdrop-blur",
          className
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your stats
        </p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0 text-sm font-medium text-foreground">
          <span>Wins today: {winsToday}</span>
          <span>Streak: {streak}</span>
          <span>Total games: {totalGames}</span>
        </div>
      </div>
    );
  }

  if (!showCompact) return null;

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-x-3 gap-y-0 text-xs font-medium text-muted-foreground",
        className
      )}
      role="status"
      aria-label={`Stats: ${winsToday} wins today, ${streak} day streak, ${totalGames} total games`}
    >
      <span>Wins today: {winsToday}</span>
      <span>Streak: {streak}</span>
      <span>Total: {totalGames}</span>
    </div>
  );
}
