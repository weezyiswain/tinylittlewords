"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { AVATAR_OPTIONS, getRandomAvatar } from "@/lib/avatars";
import { getBuddyTheme } from "@/lib/buddy-themes";
import { supabase } from "@/lib/supabaseClient";
import { canonicalUrl, seoConfig } from "@/lib/seo";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { StatsDisplay } from "@/components/stats-display";
import { WordPackSelect } from "@/components/word-pack-select";

const WORD_LENGTH_OPTIONS = [3, 4, 5] as const;
const AGE_SHORT_COPY: Record<(typeof WORD_LENGTH_OPTIONS)[number], string> = {
  3: "Ages 5-6",
  4: "Ages 6-7",
  5: "Ages 8+",
};

type Pack = {
  id: string;
  name: string;
};

export default function Home() {
  const router = useRouter();
  const [selectedLength, setSelectedLength] =
    useState<(typeof WORD_LENGTH_OPTIONS)[number]>(4);
  const [avatar, setAvatar] = useState(() => AVATAR_OPTIONS[0]);
  const [packsLoading, setPacksLoading] = useState(true);
  const [packsError, setPacksError] = useState<string | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [minLoadElapsed, setMinLoadElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinLoadElapsed(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    setAvatar(getRandomAvatar());

    const fetchPacks = async () => {
      setPacksLoading(true);
      setPacksError(null);
      
      if (!supabase) {
        if (!isCancelled) {
          setPacksError("Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
          setPacksLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("packs")
          .select("id,name,title")
          .eq("enabled", true);

        if (error) throw error;
        if (isCancelled) return;

        type PackRow = { id?: string | null; name?: string | null; title?: string | null };
        const normalized: Pack[] = (data ?? [])
          .map((row: PackRow) => {
            const id = row?.id;
            const name = (row.name ?? row.title)?.trim();
            if (!id || typeof name !== "string" || !name) return null;
            return { id, name };
          })
          .filter((p): p is Pack => p !== null)
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

        setPacks(normalized);
      } catch (err) {
        console.error("[packs] Supabase error:", err);
        const raw = err as { message?: string; code?: string; details?: string };
        const message =
          typeof raw?.message === "string"
            ? raw.message + (raw.code ? ` (${raw.code})` : "")
            : err instanceof Error
              ? err.message
              : "Couldn’t load packs. Check your connection and try again.";
        if (!isCancelled) setPacksError(message);
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

  const showLoading = packsLoading || !minLoadElapsed;
  const theme = useMemo(() => getBuddyTheme(avatar.id), [avatar.id]);

  const homeCanonical = useMemo(() => canonicalUrl("/"), []);

  const structuredData = useMemo(() => {
    const packName = selectedPackId
      ? packs.find((p) => p.id === selectedPackId)?.name ?? "Surprise me"
      : "Surprise me";
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
          target: `${seoConfig.siteUrl}/play`,
          name: `Choose pack: ${packName}`,
          actionOption: packName,
        },
      ],
    };
  }, [homeCanonical, selectedLength, selectedPackId, packs]);

  const handleStart = () => {
    const seed = Date.now();
    const params = new URLSearchParams({
      length: String(selectedLength),
      avatar: avatar.id,
      seed: seed.toString(),
    });
    if (selectedPackId) {
      const pack = packs.find((p) => p.id === selectedPackId);
      if (pack) {
        params.set("pack", pack.id);
        params.set("packName", pack.name);
      }
    } else {
      params.set("packName", "Surprise me");
    }

    router.push(`/play?${params.toString()}`);
  };

  return (
    <main className="relative flex h-dvh min-h-dvh flex-col items-center overflow-hidden px-4 py-8 pt-[calc(env(safe-area-inset-top,0)+2rem)] sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={cn("absolute inset-0", theme.bgBase)} aria-hidden />
        <div
          className={cn(
            "absolute -top-24 left-[-12%] h-64 w-64 rounded-full blur-3xl sm:h-72 sm:w-72",
            theme.blurLeft
          )}
        />
        <div
          className={cn(
            "absolute -bottom-24 right-[-10%] h-72 w-72 rounded-full blur-3xl sm:h-80 sm:w-80",
            theme.blurRight
          )}
        />
        <div
          className={cn(
            "absolute bottom-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl",
            theme.blurCenter
          )}
        />
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
        className="relative flex min-h-0 flex-1 flex-col w-full max-w-xl"
      >
        {showLoading ? (
          <div
            className={cn(
              "rounded-2xl border border-white/60 bg-gradient-to-br px-6 py-8 text-center backdrop-blur-lg sm:rounded-3xl sm:py-10",
              theme.loadingCard
            )}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
              Tiny Little Words
            </p>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Built for brave readers ages 6–10. Choose your word size and a
              friendly avatar will cheer you on each game.
            </p>
            <p className="mt-6 text-sm text-muted-foreground/80">
              Loading…
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 sm:space-y-5">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                  Tiny Little Words
                </p>
              </div>

              <section
                className={cn(
                  "rounded-2xl border border-white/70 bg-white/80 p-5 backdrop-blur",
                  theme.cardShadow
                )}
              >
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
                        "flex h-20 flex-col items-center justify-center rounded-2xl border border-transparent bg-white/85 text-center font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        theme.wordLengthBase,
                        theme.wordLengthHover,
                        "hover:border-primary/40",
                        lengthOption === selectedLength
                          ? theme.wordLengthSelected
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

              <section
                className={cn(
                  "rounded-2xl border border-white/70 bg-white/80 p-5 backdrop-blur",
                  theme.cardShadowAlt
                )}
              >
                <div>
                  <h2 className="text-lg font-semibold">Adventure buddy</h2>
                  <p className="text-sm text-muted-foreground">
                    Pick a pal to cheer you on.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6" role="radiogroup" aria-label="Pick adventure buddy">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={avatar.id === opt.id}
                      aria-label={`${opt.emoji} buddy`}
                      onClick={() => setAvatar(opt)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-2xl border-2 p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        avatar.id === opt.id ? theme.buddySelected : theme.buddyUnselected
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full text-2xl sm:h-14 sm:w-14 sm:text-3xl",
                          opt.bg
                        )}
                        aria-hidden
                      >
                        {opt.emoji}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section
                className={cn(
                  "rounded-2xl border border-white/70 bg-white/80 p-5 backdrop-blur",
                  theme.cardShadow
                )}
              >
                <div>
                  <h2 className="text-lg font-semibold">Word pack</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a themed pack or Surprise me.
                  </p>
                </div>

                <div className="mt-4">
                  <WordPackSelect
                    id="word-pack-select"
                    packs={packs}
                    loading={packsLoading}
                    error={packsError}
                    value={selectedPackId}
                    onChange={setSelectedPackId}
                    aria-label="Word pack"
                  />
                </div>
              </section>

              <p className="text-center text-sm text-muted-foreground">
                Tiny Little Words is in test mode. We&apos;re improving things with your
                help — more updates coming soon.
              </p>

              <StatsDisplay variant="block" />

              <PwaInstallPrompt />

              <p className="text-center text-xs text-muted-foreground">
                No sign in needed. Just cozy word fun!
              </p>

              <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 pb-4 text-xs text-muted-foreground">
                <Link
                  href="/parents"
                  className="underline decoration-primary/40 underline-offset-2 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                >
                  For parents
                </Link>
              </footer>
            </div>

            <div className="flex-shrink-0 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <motion.button
                type="button"
                onClick={handleStart}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full rounded-full bg-gradient-to-r px-5 py-4 text-lg font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  theme.ctaGradient,
                  theme.ctaShadow,
                  theme.ctaShadowHover
                )}
              >
                Start playing
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
