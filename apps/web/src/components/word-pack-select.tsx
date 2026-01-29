"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export type Pack = { id: string; name: string };

const SURPRISE_ME = "Surprise me";

type WordPackSelectProps = {
  packs: Pack[];
  loading?: boolean;
  error?: string | null;
  value: string | null;
  onChange: (packId: string | null) => void;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

export function WordPackSelect({
  packs,
  loading = false,
  error = null,
  value,
  onChange,
  id = "word-pack-select",
  disabled = false,
  "aria-label": ariaLabel = "Word pack",
}: WordPackSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedPack = value ? packs.find((p) => p.id === value) : null;
  const triggerLabel = loading ? "Loading…" : selectedPack ? selectedPack.name : SURPRISE_ME;
  const showIcon = !loading && !selectedPack;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const handleSelect = useCallback(
    (packId: string | null) => {
      onChange(packId);
      close();
    },
    [onChange, close]
  );

  const isDisabled = disabled || loading;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-disabled={isDisabled}
        onClick={() => !isDisabled && setOpen((o) => !o)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-white/70 bg-white/85 px-3 py-2 text-left text-sm font-medium text-foreground shadow-[0_10px_24px_rgba(20,184,166,0.1)] transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
          open && "border-primary/40 ring-2 ring-primary/60 ring-offset-2 ring-offset-background"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {showIcon && (
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
          )}
          <span className="truncate">{triggerLabel}</span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && !loading && (
        <div
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-white/70 bg-white py-1 shadow-[0_10px_24px_rgba(20,184,166,0.15)] backdrop-blur"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => handleSelect(null)}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-primary/10 focus:bg-primary/10 focus:outline-none",
              !value && "bg-primary/10 text-primary"
            )}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            <span>{SURPRISE_ME}</span>
          </button>

          <div
            className="my-1 border-t border-border"
            role="separator"
            aria-hidden
          />

          {packs.map((pack) => (
            <button
              key={pack.id}
              type="button"
              role="option"
              aria-selected={value === pack.id}
              onClick={() => handleSelect(pack.id)}
              className={cn(
                "flex w-full items-center px-3 py-2.5 text-left text-sm font-medium transition hover:bg-primary/10 focus:bg-primary/10 focus:outline-none",
                value === pack.id && "bg-primary/10 text-primary"
              )}
            >
              <span className="truncate">{pack.name}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-amber-700">
          We couldn&apos;t load packs right now ({error}). We&apos;ll surprise you instead!
        </p>
      )}
    </div>
  );
}
