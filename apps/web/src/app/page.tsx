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
import { Button } from "@/components/ui/button";
import { WordPackSelect } from "@/components/word-pack-select";
import { ChevronRight, Users } from "lucide-react";

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
  const [skipInitialLoader] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("tlw-initial-load-done") === "1"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("tlw-initial-load-done") === "1") {
      setMinLoadElapsed(true);
      return;
    }
    const t = setTimeout(() => {
      sessionStorage.setItem("tlw-initial-load-done", "1");
      setMinLoadElapsed(true);
    }, 2800);
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
        type PackRow = { id?: string | null; name?: string | null; title?: string | null };
        let data: PackRow[] | null = null;

        const withBoth = await supabase
          .from("packs")
          .select("id,name,title")
          .eq("enabled", true);
        if (withBoth.error) {
          const code = (withBoth.error as { code?: string }).code;
          const msg = (withBoth.error as { message?: string }).message ?? "";
          if (code === "42703" && msg.includes("name")) {
            const withTitle = await supabase
              .from("packs")
              .select("id,title")
              .eq("enabled", true);
            if (withTitle.error) throw withTitle.error;
            data = withTitle.data;
          } else if (code === "42703" && msg.includes("title")) {
            const withName = await supabase
              .from("packs")
              .select("id,name")
              .eq("enabled", true);
            if (withName.error) throw withName.error;
            data = withName.data;
          } else {
            throw withBoth.error;
          }
        } else {
          data = withBoth.data;
        }

        if (isCancelled) return;

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

  const showLoading = (packsLoading || !minLoadElapsed) && !skipInitialLoader;
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
    <>
      <div
        className="pointer-events-none fixed -z-10"
        style={{
          left: "-15vmin",
          top: "-15vmin",
          width: "calc(100vw + 30vmin)",
          height: "calc(100dvh + env(safe-area-inset-bottom, 0px) + 30vmin)",
        }}
        aria-hidden
      >
        <div className={cn("absolute inset-0", theme.bgBase)} />
        {!showLoading && (
          <>
            <div
              className={cn(
                "absolute -top-24 left-[-12%] h-24 w-24 rounded-full blur-3xl opacity-40 sm:h-40 sm:w-40 sm:opacity-50",
                theme.blurLeft
              )}
            />
            <div
              className={cn(
                "absolute -bottom-24 right-[-10%] h-24 w-24 rounded-full blur-3xl opacity-40 sm:h-40 sm:w-40 sm:opacity-50",
                theme.blurRight
              )}
            />
            <div
              className={cn(
                "absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-30 sm:h-28 sm:w-28 sm:opacity-40",
                theme.blurCenter
              )}
            />
          </>
        )}
      </div>
      <main className="relative flex h-dvh min-h-dvh flex-col items-center overflow-hidden px-4 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+1rem))]">
      <Script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex h-full w-full max-w-xl flex-col"
      >
        {showLoading ? (
          <div className="fixed inset-0 z-0 flex items-center justify-center px-4">
            <div className="flex flex-col items-center gap-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-700">
                Tiny Little Words
              </p>
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce [animation-duration:1.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce [animation-duration:1.2s] [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce [animation-duration:1.2s] [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="shrink-0 py-2 sm:py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-700">
                  Tiny Little Words
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="shrink-0 border-neutral-300 bg-white/90 text-neutral-600 shadow-sm transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-500"
                >
                  <Link href="/parents" className="gap-1.5">
                    <Users className="size-4" aria-hidden />
                    For parents
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              <div className="space-y-2.5 sm:space-y-3">
              <section
                className={cn(
                  "overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-4",
                  theme.cardShadow
                )}
              >
                <div>
                  <h2 className="text-lg font-semibold">Word length</h2>
                  <p className="text-sm text-muted-foreground">
                    Pick how many letters are in today&apos;s word
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-label="Select word length">
                  {WORD_LENGTH_OPTIONS.map((lengthOption) => (
                    <button
                      key={lengthOption}
                      type="button"
                      onClick={() => setSelectedLength(lengthOption)}
                      role="radio"
                      aria-checked={lengthOption === selectedLength}
                      aria-label={`${lengthOption}-letter words (${AGE_SHORT_COPY[lengthOption]})`}
                      className={cn(
                        "flex h-16 flex-col items-center justify-center rounded-xl border border-transparent bg-white/85 text-center font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-[4.5rem]",
                        theme.wordLengthBase,
                        theme.wordLengthHover,
                        "hover:border-neutral-400",
                        lengthOption === selectedLength
                          ? theme.wordLengthSelected
                          : "text-foreground"
                      )}
                    >
                      <span className="text-xl font-bold sm:text-2xl">{lengthOption}</span>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground/80">
                        {AGE_SHORT_COPY[lengthOption]}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section
                className={cn(
                  "rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur",
                  theme.cardShadowAlt
                )}
              >
                <div>
                  <h2 className="text-lg font-semibold">Adventure buddy</h2>
                  <p className="text-sm text-muted-foreground">
                    Pick a pal to cheer you on
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3" role="radiogroup" aria-label="Pick adventure buddy">
                  {AVATAR_OPTIONS.map((opt) => {
                    const isSelected = avatar.id === opt.id;
                    return (
                      <div key={opt.id} className="aspect-square w-full min-w-0">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`${opt.emoji} buddy`}
                          onClick={() => setAvatar(opt)}
                          className={cn(
                            "flex h-full w-full flex-col items-center justify-center rounded-xl border p-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            isSelected
                              ? cn(opt.bgSelected, theme.buddySelectedBorder, "shadow-[0_8px_20px_rgba(0,0,0,0.08)]")
                              : cn(opt.bg, "border-transparent hover:border-primary/40")
                          )}
                        >
                          <span className="text-2xl sm:text-3xl" aria-hidden>
                            {opt.emoji}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section
                className={cn(
                  "overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-5",
                  theme.cardShadow
                )}
              >
                <div>
                  <h2 className="text-lg font-semibold">Word pack</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a theme to explore, or let us surprise you
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

              </div>
            </div>

            <div className="shrink-0 w-full border-t border-white/50 bg-white/80 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
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
    </>
  );
}
