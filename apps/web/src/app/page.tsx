"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { getRandomAvatar } from "@/lib/avatars";
import { supabase } from "@/lib/supabaseClient";

const WORD_LENGTH_OPTIONS = [3, 4, 5] as const;
const AGE_SHORT_COPY: Record<(typeof WORD_LENGTH_OPTIONS)[number], string> = {
  3: "Ages 5-6",
  4: "Ages 6-7",
  5: "Ages 8+",
};

type Pack = {
  id: string;
  title: string;
};

export default function Home() {
  const router = useRouter();
  const [selectedLength, setSelectedLength] =
    useState<(typeof WORD_LENGTH_OPTIONS)[number]>(4);
  const [avatar, setAvatar] = useState(() => getRandomAvatar());
  const [packs, setPacks] = useState<Pack[]>([]);
  const [packsLoading, setPacksLoading] = useState(true);
  const [packsError, setPacksError] = useState<string | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string>("");

  const selectedPack =
    selectedPackId.length > 0
      ? packs.find((packItem) => packItem.id === selectedPackId) ?? null
      : null;

  useEffect(() => {
    let isCancelled = false;

    const fetchPacks = async () => {
      setPacksLoading(true);
      setPacksError(null);
      
      // If Supabase is not available, skip loading packs
      if (!supabase) {
        if (!isCancelled) {
          setPacksLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("packs")
          .select("id,title")
          .order("title", { ascending: true });

        if (error) throw error;
        if (isCancelled) return;

        const normalized =
          data?.filter(
            (item): item is Pack =>
              Boolean(item?.id) && typeof item?.title === "string"
          ) ?? [];

        setPacks(normalized);
        console.log(`[Supabase] Loaded ${normalized.length} packs.`);
        if (normalized.length > 0) {
          const sample =
            normalized[Math.floor(Math.random() * normalized.length)]!;
          console.log(`[Supabase] Sample pack: ${sample.title}`);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown Supabase error.";
        if (!isCancelled) {
          setPacksError(message);
          console.error("[Supabase] Failed to load packs:", message);
        }
      } finally {
        if (!isCancelled) {
          setPacksLoading(false);
        }
      }
    };

    void fetchPacks();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleStart = () => {
    const seed = Date.now();
    const params = new URLSearchParams({
      length: String(selectedLength),
      avatar: avatar.id,
      seed: seed.toString(),
    });

    if (selectedPack) {
      params.append("pack", selectedPack.id);
      params.append("packName", selectedPack.title);
    }

    router.push(`/play?${params.toString()}`);
  };

  const handleShuffleAvatar = () => {
    setAvatar((current) => getRandomAvatar(current.id));
  };

  return (
    <main className="min-h-dvh px-6 py-10 sm:px-10 grid place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-xl rounded-2xl bg-secondary/60 p-6 shadow-sm backdrop-blur"
      >
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
            Tiny Little Words
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            Pick your puzzle, meet your buddy, and start guessing!
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Built for brave readers ages 6-10. Choose your word size and a
            friendly avatar will cheer you on each game.
          </p>
        </div>

        <section className="mt-8 rounded-xl border border-border bg-background/80 p-5 shadow-inner">
          <div>
            <h2 className="text-lg font-semibold">Word length</h2>
            <p className="text-sm text-muted-foreground">
              Pick the word size that feels fun today—short and speedy or big and bold.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {WORD_LENGTH_OPTIONS.map((lengthOption) => (
              <button
                key={lengthOption}
                type="button"
                onClick={() => setSelectedLength(lengthOption)}
                className={cn(
                  "flex h-20 flex-col items-center justify-center rounded-xl border border-border bg-white text-center transition hover:border-primary/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  lengthOption === selectedLength
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-foreground"
                )}
              >
                <span className="text-2xl font-bold">{lengthOption}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground/80">
                  {AGE_SHORT_COPY[lengthOption]}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-background/80 p-5 shadow-inner">
          <div>
            <h2 className="text-lg font-semibold">Pick a topic (optional)</h2>
            <p className="text-sm text-muted-foreground">
              Choose a themed pack or keep it as a surprise mix.
            </p>
          </div>

          <div className="mt-4">
            <label
              htmlFor="pack-select"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Topic selection
            </label>
            <select
              id="pack-select"
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              value={selectedPackId}
              onChange={(event) => setSelectedPackId(event.target.value)}
              disabled={packsLoading}
            >
              <option value="">Surprise me (all words)</option>
              {packs.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.title}
                </option>
              ))}
            </select>
            {packsLoading && (
              <p className="mt-2 text-xs text-muted-foreground">
                Loading topics…
              </p>
            )}
            {packsError && (
              <p className="mt-2 text-xs text-amber-700">
                We couldn’t load topics right now (reason: {packsError}). We’ll
                surprise you instead!
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-background/80 p-5 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Adventure buddy</h2>
              <p className="text-sm text-muted-foreground">
                A new pal joins every game. Shuffle if you want to meet someone
                else!
              </p>
            </div>
            <button
              type="button"
              onClick={handleShuffleAvatar}
              className="inline-flex items-center justify-center rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Shuffle
            </button>
          </div>

          <div className="mt-5 flex items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-white/80 p-4">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full text-3xl",
                avatar.bg
              )}
              aria-hidden
            >
              {avatar.emoji}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Say hello to
              </p>
              <p className="text-xl font-semibold text-foreground">
                {avatar.name}
              </p>
              <p className="text-xs text-muted-foreground/80">
                They&apos;ll cheer you on while you hunt for the word!
              </p>
            </div>
          </div>
        </section>

        <motion.button
          type="button"
          onClick={handleStart}
          whileTap={{ scale: 0.98 }}
          className="mt-8 w-full rounded-full bg-primary px-5 py-4 text-lg font-semibold text-primary-foreground shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Start playing
        </motion.button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          No sign in needed. Just cozy word fun!
        </p>
      </motion.div>
    </main>
  );
}
