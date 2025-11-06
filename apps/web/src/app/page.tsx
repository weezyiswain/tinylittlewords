"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { AVATAR_OPTIONS, getRandomAvatar } from "@/lib/avatars";
import { supabase } from "@/lib/supabaseClient";
import { canonicalUrl, seoConfig } from "@/lib/seo";

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
  const [avatar, setAvatar] = useState(() => AVATAR_OPTIONS[0]);
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
    setAvatar(getRandomAvatar());

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
          console.warn(
            "[Supabase] Packs request fell back to surprise mode:",
            message
          );
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

  const homeCanonical = useMemo(() => canonicalUrl("/"), []);

  const structuredData = useMemo(() => {
    const packName = selectedPack?.title ?? "All packs";
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: seoConfig.siteName,
      url: homeCanonical,
      description: seoConfig.defaultDescription,
      inLanguage: "en-US",
      isFamilyFriendly: true,
      genre: ["Educational", "Puzzle", "Kids"],
      publisher: {
        "@type": "Organization",
        name: "Tiny Little Words",
        url: seoConfig.siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${seoConfig.siteUrl}/icon.png`,
        },
      },
      potentialAction: [
        {
          "@type": "PlayAction",
          target: `${seoConfig.siteUrl}/play`,
          name: `Play a ${selectedLength}-letter word puzzle`,
        },
        {
          "@type": "ChooseAction",
          target: `${seoConfig.siteUrl}/play?pack=${selectedPack?.id ?? ""}`,
          name: `Choose pack: ${packName}`,
          actionOption: packName,
        },
      ],
    };
  }, [homeCanonical, selectedLength, selectedPack]);

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
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-4 py-8 pt-[calc(env(safe-area-inset-top,0)+2rem)] sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[-12%] h-64 w-64 rounded-full bg-gradient-to-br from-rose-200/70 via-rose-100/50 to-transparent blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute -bottom-24 right-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-sky-200/60 via-sky-100/40 to-transparent blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute bottom-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-200/45 via-amber-100/30 to-transparent blur-3xl" />
      </div>
      <Script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-xl space-y-6"
      >
        <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/95 via-rose-50/90 to-sky-50/90 p-6 text-center shadow-[0_25px_60px_rgba(255,191,221,0.35)] backdrop-blur-lg">
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

        <section className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(255,186,213,0.25)] backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold">Word length</h2>
            <p className="text-sm text-muted-foreground">
              Pick the word size that feels fun today—short and speedy or big and bold.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Select word length">
            {WORD_LENGTH_OPTIONS.map((lengthOption) => (
              <button
                key={lengthOption}
                type="button"
                onClick={() => setSelectedLength(lengthOption)}
                role="radio"
                aria-checked={lengthOption === selectedLength}
                aria-label={`${lengthOption}-letter words (${AGE_SHORT_COPY[lengthOption]})`}
                className={cn(
                  "flex h-20 flex-col items-center justify-center rounded-2xl border border-transparent bg-white/85 text-center font-semibold text-foreground shadow-[0_12px_28px_rgba(168,213,255,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_36px_rgba(255,170,214,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  lengthOption === selectedLength
                    ? "bg-gradient-to-br from-[#ff87cf] via-[#f9a9ff] to-[#6bdff9] text-white shadow-[0_18px_42px_rgba(255,135,207,0.45)]"
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

        <section className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(187,222,255,0.2)] backdrop-blur">
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
              className="mt-2 w-full cursor-not-allowed rounded-lg border border-dashed border-white/70 bg-muted px-3 py-2 text-sm font-medium text-muted-foreground/80 shadow-[0_10px_24px_rgba(174,215,255,0.15)] transition"
              value={selectedPackId}
              onChange={() => undefined}
              disabled
            >
              <option value="">Topic selection is a premium feature (coming soon)</option>
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
            {!packsLoading && !packsError && (
              <div className="mt-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-xs text-primary">
                Topic packs are part of Tiny Little Words Premium. We’re building the upgrade path now—until then, every game uses the surprise mix.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(255,232,179,0.25)] backdrop-blur">
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
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-rose-300/80 via-fuchsia-300/80 to-sky-300/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_10px_22px_rgba(255,180,220,0.4)] transition hover:shadow-[0_12px_28px_rgba(116,180,255,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Shuffle adventure buddy"
            >
              Shuffle
            </button>
          </div>

          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-dashed border-primary/40 bg-white/85 p-4 shadow-[0_14px_32px_rgba(255,190,210,0.25)]">
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
          className="w-full rounded-full bg-gradient-to-r from-[#ff87cf] via-[#ffb973] to-[#6bdff9] px-5 py-4 text-lg font-semibold text-white shadow-[0_18px_45px_rgba(255,174,204,0.5)] transition hover:shadow-[0_20px_55px_rgba(255,174,204,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Start playing
        </motion.button>

        <p className="text-center text-xs text-muted-foreground">
          No sign in needed. Just cozy word fun!
        </p>
      </motion.div>
    </main>
  );
}
