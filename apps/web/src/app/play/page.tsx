"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, HelpCircle, Lightbulb, Sparkles, Star } from "lucide-react";

import { Keyboard } from "@/components/Keyboard";
import { cn } from "@/lib/utils";
import {
  AVATAR_OPTIONS,
  AvatarOption,
  getRandomAvatar,
} from "@/lib/avatars";
import { getBuddyTheme, type BuddyTheme } from "@/lib/buddy-themes";
import { getFallbackPuzzles, Puzzle } from "@/lib/game-data";
import { addWordToDictionary, isValidWord } from "@/lib/dictionary";
import { recordGame } from "@/lib/stats";
import { supabase } from "@/lib/supabaseClient";
import { StatsDisplay } from "@/components/stats-display";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

type LetterStatus = "correct" | "present" | "absent";

const WORD_LENGTHS = [3, 4, 5] as const;
const MAX_GUESSES = 6;

const STATUS_PRIORITY: Record<LetterStatus, number> = {
  absent: 1,
  present: 2,
  correct: 3,
};

const SUPPORTED_LENGTHS = [3, 4, 5] as const;

type StatusTone = "info" | "error" | "success" | "warning";

type StatusMessage = {
  text: string;
  tone: StatusTone;
};

function buildHints(word: string): string[] {
  const upper = word.toUpperCase();
  const hints: string[] = [
    `It starts with "${upper[0]}".`,
    `It ends with "${upper[upper.length - 1]}".`,
  ];

  if (upper.length >= 5) {
    hints.push(
      `Watch for the letter "${upper[Math.floor(upper.length / 2)]}" in the middle.`
    );
  }

  return hints.slice(0, upper.length >= 5 ? 2 : 1);
}

type HintListProps = {
  hints: string[];
  revealed: boolean[];
  onReveal: (index: number) => void;
  theme: BuddyTheme;
  className?: string;
  highlight?: boolean;
};

function HintList({
  hints,
  revealed,
  onReveal,
  theme,
  className,
  highlight = false,
}: HintListProps) {
  const firstHiddenIndex = revealed.findIndex((flag) => !flag);
  const showButtonHighlight = highlight && firstHiddenIndex !== -1;

  return (
    <section
      className={cn(
        "rounded-2xl border border-white/70 bg-white/85 px-4 py-4 backdrop-blur transition",
        theme.hintSection,
        highlight && theme.hintSectionHighlight,
        className
      )}
    >
      <h2
        className={cn(
          "text-base font-semibold text-foreground",
          highlight && theme.hintHeadingHighlight
        )}
      >
        Hints
      </h2>
      <ul className="mt-2 space-y-2 overflow-y-auto pr-1 text-sm text-muted-foreground sm:max-h-40 max-h-28">
        {hints.length === 0 ? (
          <li className="rounded-lg border border-dashed border-primary/30 bg-gradient-to-r from-primary/10 via-white/90 to-teal-50/60 px-3 py-1.5 text-xs text-muted-foreground">
            No hints just yet—trust your instincts!
          </li>
        ) : (
          hints.map((hint, index) => {
            const isRevealed = revealed[index];
            return (
              <li
                key={hint}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 transition",
                  isRevealed
                    ? "border-primary/20 bg-primary/5"
                    : "hover:border-primary/20 hover:bg-primary/5"
                )}
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                  💡
                </span>
                {isRevealed ? (
                  <span className="text-foreground">{hint}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReveal(index)}
                    className={cn(
                      "inline-flex w-full items-center justify-center rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      theme.revealButton,
                      showButtonHighlight &&
                        index === firstHiddenIndex &&
                        cn(theme.revealButtonHighlight, "animate-bounce")
                    )}
                  >
                    Reveal hint
                  </button>
                )}
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}

type PackRow = { id?: string | null; name?: string | null; title?: string | null };

type SupabaseWordRow = {
  text: string;
  length: number;
  difficulty: string | null;
};

function evaluateGuess(guess: string, target: string): LetterStatus[] {
  const result: LetterStatus[] = Array(target.length).fill("absent");
  const remainingTargetLetters = target.split("");
  const guessLetters = guess.split("");

  // First pass for correct placements
  for (let i = 0; i < guessLetters.length; i += 1) {
    if (guessLetters[i] === target[i]) {
      result[i] = "correct";
      remainingTargetLetters[i] = "_";
    }
  }

  // Second pass for present letters
  for (let i = 0; i < guessLetters.length; i += 1) {
    if (result[i] === "correct") continue;
    const index = remainingTargetLetters.indexOf(guessLetters[i]);
    if (index !== -1) {
      result[i] = "present";
      remainingTargetLetters[index] = "_";
    }
  }

  return result;
}

function chooseAvatar(idFromParams: string | null): AvatarOption {
  if (!idFromParams) return getRandomAvatar();
  const match = AVATAR_OPTIONS.find((option) => option.id === idFromParams);
  return match ?? getRandomAvatar();
}

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <PlayPageContent />
    </Suspense>
  );
}

function PlayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHintSheetOpen, setIsHintSheetOpen] = useState(false);

  const lengthFromParams = Number(searchParams?.get("length") ?? NaN);
  const wordLength =
    WORD_LENGTHS.find((option) => option === lengthFromParams) ?? 5;

  const avatarId = searchParams?.get("avatar") ?? null;
  const packId = searchParams?.get("pack") ?? null;
  const packName = searchParams?.get("packName") ?? null;
  const seed = searchParams?.get("seed") ?? null;
  const avatar = useMemo(() => chooseAvatar(avatarId), [avatarId]);
  const theme = useMemo(() => getBuddyTheme(avatar.id), [avatar.id]);
  const boardContainerStyle = useMemo(
    () =>
      ({
        "--tile-size": "clamp(44px, 10vw, 60px)",
        "--tile-gap": "clamp(6px, 1.5vw, 10px)",
        width: "100%",
        maxWidth: `calc(var(--tile-size) * ${wordLength} + var(--tile-gap) * ${Math.max(
          0,
          wordLength - 1
        )})`,
        maxHeight: "100%",
      }) as CSSProperties,
    [wordLength]
  );
  const boardRowStyle = useMemo(
    () =>
      ({
        gridTemplateColumns: `repeat(${wordLength}, var(--tile-size))`,
        gap: "var(--tile-gap)",
      }) as CSSProperties,
    [wordLength]
  );
  const boardStackStyle = useMemo(
    () =>
      ({
        display: "flex",
        flexDirection: "column",
        gap: "var(--tile-gap)",
        maxHeight: "100%",
      }) as CSSProperties,
    []
  );

  const [resolvedSurprisePack, setResolvedSurprisePack] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [wordPool, setWordPool] = useState<Puzzle[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [wordSource, setWordSource] = useState<"supabase" | "fallback">(
    "fallback"
  );
  const [wordFetchError, setWordFetchError] = useState<string | null>(null);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<LetterStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyboardStatus, setKeyboardStatus] = useState<
    Record<string, LetterStatus>
  >({});
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [revealedHints, setRevealedHints] = useState<boolean[]>([]);
  const [hasRetried, setHasRetried] = useState(false);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  const [isCheckingWord, setIsCheckingWord] = useState(false);
  const [statsRefresh, setStatsRefresh] = useState(0);
  const [invalidWordShake, setInvalidWordShake] = useState(false);
  const [lastEvaluatedRowIndex, setLastEvaluatedRowIndex] = useState<number | null>(null);
  const [buddyAnimation, setBuddyAnimation] = useState<"correct" | "present" | "absent" | null>(null);
  const recordedForRoundRef = useRef(false);

  const targetWord = currentPuzzle?.word ?? "";
  const activeHints = currentPuzzle?.hints ?? [];

  const effectivePackId = packId ?? resolvedSurprisePack?.id ?? null;
  const packLabel =
    packId && typeof packName === "string" && packName.trim().length > 0
      ? packName
      : resolvedSurprisePack?.name ?? null;

  useEffect(() => {
    const client = supabase;
    if (packId || !client) return;
    let isCancelled = false;

    const resolveSurprisePack = async () => {
      try {
        let data: PackRow[] | null = null;
        const withBoth = await client
          .from("packs")
          .select("id,name,title")
          .eq("enabled", true);
        if (withBoth.error) {
          const code = (withBoth.error as { code?: string }).code;
          const msg = (withBoth.error as { message?: string }).message ?? "";
          if (code === "42703" && msg.includes("name")) {
            const withTitle = await client
              .from("packs")
              .select("id,title")
              .eq("enabled", true);
            if (withTitle.error) throw withTitle.error;
            data = withTitle.data;
          } else if (code === "42703" && msg.includes("title")) {
            const withName = await client
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

        const list = (data ?? [])
          .map((row: PackRow) => {
            const id = row?.id;
            const name = (row?.name ?? row?.title)?.trim();
            if (!id || typeof name !== "string" || !name) return null;
            return { id, name };
          })
          .filter((p): p is { id: string; name: string } => p !== null);

        if (!isCancelled && list.length > 0) {
          const chosen = list[Math.floor(Math.random() * list.length)]!;
          setResolvedSurprisePack(chosen);
        }
      } catch {
        if (!isCancelled) setResolvedSurprisePack({ id: "", name: "Random" });
      }
    };

    void resolveSurprisePack();
    return () => {
      isCancelled = true;
    };
  }, [packId]);

  useEffect(() => {
    if (packId === null && resolvedSurprisePack === null) return;
    let isCancelled = false;

    const loadWords = async () => {
      setWordFetchError(null);
      const filterPackId = effectivePackId || undefined;

      try {
        if (!supabase) {
          throw new Error("Supabase client unavailable");
        }
        const lengthFilter = Array.from(SUPPORTED_LENGTHS);
        const { data: wordsData, error } = await supabase
          .from("words")
          .select("text,length,difficulty")
          .eq("enabled", true)
          .in("length", lengthFilter);

        if (error) throw error;

        let filteredRows: SupabaseWordRow[] =
          (wordsData ?? []).filter(
            (row): row is SupabaseWordRow =>
              typeof row?.text === "string" && typeof row?.length === "number"
          );

        if (filterPackId) {
          const { data: packWordData, error: packWordError } = await supabase
            .from("pack_words")
            .select("words(text,length)")
            .eq("pack_id", filterPackId);

          if (packWordError) throw packWordError;

          const allowedTexts = new Set(
            (packWordData ?? [])
              .map((item) => {
                const row = item as { words?: { text?: string | null } | null };
                const word = row?.words?.text ?? null;
                return typeof word === "string" ? word.toUpperCase() : null;
              })
              .filter((text): text is string => Boolean(text))
          );

          filteredRows = filteredRows.filter((row) =>
            allowedTexts.has(row.text.toUpperCase())
          );
        }

        filteredRows = filteredRows.filter((row) => row.length === wordLength);

        if (!isCancelled && filteredRows.length > 0) {
          const puzzles = filteredRows.map((row) => {
            const upper = row.text.toUpperCase();
            addWordToDictionary(row.length, upper);
            return {
              word: upper,
              hints: buildHints(upper),
            } as Puzzle;
          });

          setWordPool(puzzles);
          setWordSource("supabase");
          return;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown Supabase error.";
        if (!isCancelled) setWordFetchError(message);
      }

      if (isCancelled) return;

      setWordFetchError((prev) =>
        prev
          ? `${prev} (using fallback list)`
          : filterPackId
          ? "No words available for this pack right now."
          : "No words returned from Supabase."
      );

      const fallbackPool = getFallbackPuzzles(wordLength);
      fallbackPool.forEach((puzzle) =>
        addWordToDictionary(wordLength, puzzle.word.toUpperCase())
      );
      setWordPool(fallbackPool);
      setWordSource("fallback");
    };

    void loadWords();

    return () => {
      isCancelled = true;
    };
  }, [effectivePackId, wordLength, packId, resolvedSurprisePack]);

  useEffect(() => {
    if (wordPool.length === 0) {
      setCurrentPuzzle(null);
      return;
    }
    const nextPuzzle = wordPool[Math.floor(Math.random() * wordPool.length)]!;
    setCurrentPuzzle(nextPuzzle);
  }, [seed, wordPool]);

  useEffect(() => {
    if (!currentPuzzle) return;
    setGuesses([]);
    setResults([]);
    setCurrentGuess("");
    setKeyboardStatus({});
    setStatusMessage(null);
    setRevealedHints(Array(activeHints.length).fill(false));
    setHasRetried(false);
    setShowRetryPrompt(false);
    setLastEvaluatedRowIndex(null);
    setInvalidWordShake(false);
    recordedForRoundRef.current = false;
  }, [currentPuzzle, activeHints.length]);

  const isSolved = guesses.includes(targetWord);
  const allowedGuesses = hasRetried ? MAX_GUESSES + 1 : MAX_GUESSES;
  const isOutOfTries = guesses.length >= allowedGuesses && !isSolved;
  const isGameOver = isSolved || isOutOfTries;
  const revealedCount = revealedHints.filter(Boolean).length;
  const hintsLeft = Math.max(0, activeHints.length - revealedCount);
  const hasHintAvailable = hintsLeft > 0;
  const triesLeft = Math.max(0, allowedGuesses - guesses.length);
  const isFinalChanceWithHint =
    triesLeft === 1 && hasHintAvailable && !isSolved;
  const shouldHighlightHints =
    (isFinalChanceWithHint || (showRetryPrompt && hasHintAvailable)) &&
    !isSolved;
  const hintButtonHighlight = shouldHighlightHints && !isHintSheetOpen && hasHintAvailable;
  const renderHintHelp = (
    buttonClassName?: string,
    _variant: "default" | "muted" = "default"
  ) => {
    const baseClasses =
      "inline-flex h-11 min-h-[44px] min-w-[44px] w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2";
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(baseClasses, buttonClassName)}
            aria-label="How to play"
          >
            <HelpCircle className="h-6 w-6" aria-hidden />
          </button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "flex max-h-[85dvh] w-[min(calc(100vw-2rem),28rem)] flex-col overflow-hidden border-white/70 bg-[#fafafa] px-6 pt-6 pb-[max(1rem,env(safe-area-inset-bottom,0px))]",
            theme.resultModal
          )}
        >
          <DialogHeader className="shrink-0 pb-2 pr-8 text-center">
            <DialogTitle className="text-xl font-bold text-foreground">
              How to Play
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Guess the secret word in {MAX_GUESSES} tries. Use the colors after each guess to steer your next one!
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-2">
            <section className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                The Goal
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Type a {wordLength}-letter word. Keep trying until every tile is in the perfect spot!
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
                Color Detective Guide
              </h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">
                    😀
                  </span>
                  <span className="font-semibold text-emerald-700">
                    Green = Perfect spot
                  </span>
                </li>
                <li className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-xs font-bold text-white">
                    😮
                  </span>
                  <span className="font-semibold text-amber-700">
                    Yellow = Move me
                  </span>
                </li>
                <li className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted-foreground/60 text-xs font-bold text-white">
                    😴
                  </span>
                  <span className="font-semibold text-foreground">
                    Gray = Not in word
                  </span>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Star className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
                Super Star Tips
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>
                  Start with different letters like <span className="font-semibold text-foreground">RAIN</span> or <span className="font-semibold text-foreground">BIRD</span>.
                </li>
                <li>Look at the hints above the keyboard—they’re friendly clue cards.</li>
                <li>If you’re stuck, peek at a hint or try swapping the letters around.</li>
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderHintAccess = (compact?: boolean) => (
    <Sheet open={isHintSheetOpen} onOpenChange={setIsHintSheetOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full border border-white/65 bg-white/85 px-4 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
            compact ? "h-9 px-5" : "h-11 px-5 sm:h-11",
            theme.backButton,
            hintButtonHighlight && cn(theme.hintHighlight, "animate-bounce")
          )}
          aria-label="View hints"
        >
          Hint{activeHints.length > 1 ? "s" : ""}
          {hasHintAvailable ? ` (${hintsLeft})` : ""}
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className={cn(
          "max-h-[85dvh] w-full rounded-t-3xl border-t border-white/60 bg-[#fafafa] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,44px))] pt-5 backdrop-blur",
          theme.sheetShadow
        )}
      >
        <SheetHeader className="pb-2 text-center">
          <SheetTitle className="text-xl font-bold text-foreground">
            Word Hint{activeHints.length === 1 ? "" : "s"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Reveal hints one at a time whenever you need a nudge.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto pb-4">
          <HintList
            hints={activeHints}
            revealed={revealedHints}
            onReveal={revealHint}
            theme={theme}
            highlight={shouldHighlightHints}
          />
        </div>
      </SheetContent>
    </Sheet>
  );

  const updateKeyboard = useCallback(
    (guess: string, evaluation: LetterStatus[]) => {
      setKeyboardStatus((prev) => {
        const next = { ...prev };

        evaluation.forEach((status, idx) => {
          const letter = guess[idx];
          const currentStatus = next[letter];
          if (!currentStatus || STATUS_PRIORITY[status] > STATUS_PRIORITY[currentStatus]) {
            next[letter] = status;
          }
        });

        return next;
      });
    },
    []
  );

  const handleLetter = useCallback(
    (letter: string) => {
      if (isGameOver || !currentPuzzle || isCheckingWord) return;
      setStatusMessage(null);
      setCurrentGuess((prev) => {
        if (prev.length >= wordLength) return prev;
        return `${prev}${letter}`;
      });
    },
    [currentPuzzle, isCheckingWord, isGameOver, wordLength]
  );

  const handleBackspace = useCallback(() => {
    if (isGameOver || !currentPuzzle || isCheckingWord) return;
    setStatusMessage(null);
    setCurrentGuess((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  }, [currentPuzzle, isCheckingWord, isGameOver]);

  const handleSubmit = useCallback(async () => {
    if (!currentPuzzle || isCheckingWord) return;
    if (isGameOver) {
      setStatusMessage({
        text: "Nice! Head home to try a new word.",
        tone: "success",
      });
      return;
    }
    if (currentGuess.length !== wordLength) {
      setStatusMessage({
        text: "Finish the word first!",
        tone: "warning",
      });
      setInvalidWordShake(true);
      setTimeout(() => setInvalidWordShake(false), 400);
      return;
    }

    setIsCheckingWord(true);
    setStatusMessage(null);

    try {
      const isRealWord = await isValidWord(wordLength, currentGuess);

      if (!isRealWord) {
        setStatusMessage({
          text: "Not a word—try again!",
          tone: "error",
        });
        setInvalidWordShake(true);
        setTimeout(() => setInvalidWordShake(false), 400);
        return;
      }

      const evaluation = evaluateGuess(currentGuess, targetWord);
      const evaluatedRowIndex = guesses.length;

      setGuesses((prev) => [...prev, currentGuess]);
      setResults((prev) => [...prev, evaluation]);
      updateKeyboard(currentGuess, evaluation);
      setCurrentGuess("");
      setLastEvaluatedRowIndex(evaluatedRowIndex);
      setTimeout(() => setLastEvaluatedRowIndex(null), 400);

      const hasCorrect = evaluation.some((s) => s === "correct");
      const hasPresent = evaluation.some((s) => s === "present");
      const anim: "correct" | "present" | "absent" = hasCorrect
        ? "correct"
        : hasPresent
          ? "present"
          : "absent";
      setBuddyAnimation(anim);
      setTimeout(() => setBuddyAnimation(null), 400);

      const nextIsSolved = currentGuess === targetWord;
      const nextGuessCount = guesses.length + 1;

      if (nextIsSolved) {
        if (!recordedForRoundRef.current) {
          recordedForRoundRef.current = true;
          recordGame(true);
          setStatsRefresh((n) => n + 1);
        }
        setStatusMessage({ text: "You did it!", tone: "success" });
        setShowRetryPrompt(false);
      } else if (nextGuessCount >= allowedGuesses) {
        if (hasRetried && !recordedForRoundRef.current) {
          recordedForRoundRef.current = true;
          recordGame(false);
          setStatsRefresh((n) => n + 1);
        }
        const baseMessage = `The word was ${targetWord}.`;
        const hintReminder =
          !hasRetried && hasHintAvailable
            ? " You still have a hint for another try!"
            : "";
        setStatusMessage({
          text: `${baseMessage}${hintReminder}`,
          tone: "warning",
        });
        setShowRetryPrompt(!hasRetried);
      }
    } finally {
      setIsCheckingWord(false);
    }
  }, [
    currentGuess,
    currentPuzzle,
    guesses.length,
    allowedGuesses,
    hasHintAvailable,
    hasRetried,
    isCheckingWord,
    isGameOver,
    targetWord,
    updateKeyboard,
    wordLength,
  ]);

  const handleRetryRound = useCallback(() => {
    setCurrentGuess("");
    setStatusMessage({
      text: hasHintAvailable
        ? "Final guess unlocked! Peek at your hint if you need a boost."
        : "Final guess unlocked! You can do this!",
      tone: "info",
    });
    setShowRetryPrompt(false);
    setHasRetried(true);
  }, [hasHintAvailable]);

  const handleChooseNewPuzzle = useCallback(() => {
    if (isOutOfTries && !recordedForRoundRef.current) {
      recordedForRoundRef.current = true;
      recordGame(false);
      setStatsRefresh((n) => n + 1);
    }
    router.push("/");
  }, [router, isOutOfTries]);

  const handlePlayAgain = useCallback(() => {
    const params = new URLSearchParams();
    params.set("length", String(wordLength));
    params.set("avatar", avatar.id);
    params.set("seed", String(Date.now()));
    if (effectivePackId && (packLabel ?? "").trim()) {
      params.set("pack", effectivePackId);
      params.set("packName", (packLabel ?? "").trim());
    } else {
      params.set("packName", (packLabel ?? "Surprise me").trim() || "Surprise me");
    }
    router.push(`/play?${params.toString()}`);
  }, [router, wordLength, avatar.id, effectivePackId, packLabel]);

  const revealHint = useCallback((index: number) => {
    setRevealedHints((prev) =>
      prev.map((flag, idx) => (idx === index ? true : flag))
    );
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        handleLetter(key.toUpperCase());
      } else if (key === "Backspace") {
        event.preventDefault();
        handleBackspace();
      } else if (key === "Enter") {
        event.preventDefault();
        void handleSubmit();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleBackspace, handleLetter, handleSubmit]);

  return (
    <main className="relative flex min-h-[100dvh] min-w-0 flex-col overflow-x-hidden overflow-y-hidden bg-[#fafafa]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={cn("absolute inset-0", theme.bgBase)} aria-hidden />
        <div
          className={cn(
            "absolute -top-24 left-[-15%] h-24 w-24 rounded-full blur-3xl opacity-40 sm:h-40 sm:w-40 sm:opacity-50",
            theme.blurLeft
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-18%] right-[-10%] h-24 w-24 rounded-full blur-3xl opacity-40 sm:h-40 sm:w-40 sm:opacity-50",
            theme.blurRight
          )}
        />
        <div
          className={cn(
            "absolute top-1/3 right-1/2 h-20 w-20 translate-x-1/2 rounded-full blur-3xl opacity-30 sm:h-28 sm:w-28 sm:opacity-40",
            theme.blurCenter
          )}
        />
      </div>

      <header
        className="relative z-10 flex w-full shrink-0 items-center justify-between pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-2 pt-3 sm:pl-6 sm:pr-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <Link
          href="/"
          className="inline-flex h-11 min-h-[44px] min-w-[44px] w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
          aria-label="Back to puzzles"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden />
        </Link>

        <motion.div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/85 text-2xl shadow-[0_6px_16px_rgba(0,0,0,0.1)] backdrop-blur sm:h-14 sm:w-14",
            avatar.bg
          )}
          aria-hidden
          animate={
            buddyAnimation === "correct"
              ? {
                  scale: [1, 1.15, 1.1, 1],
                  transition: { duration: 0.35, ease: "easeOut" },
                }
              : buddyAnimation === "present"
                ? {
                    scale: [1, 1.06, 1],
                    rotate: [0, -4, 4, 0],
                    transition: { duration: 0.3, ease: "easeOut" },
                  }
                : buddyAnimation === "absent"
                  ? {
                      x: [0, -4, 4, -2, 2, 0],
                      transition: { duration: 0.25, ease: "easeOut" },
                    }
                  : undefined
          }
        >
          {avatar.emoji}
        </motion.div>

        {renderHintHelp(undefined, "muted")}
      </header>

      <section className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-4 sm:pl-6 sm:pr-6 sm:pb-6">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex min-h-0 flex-1 flex-col gap-3"
          >
            {packLabel != null && packLabel.trim() !== "" && (
              <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-[0.7rem]">
                Pack: {packLabel}
              </p>
            )}

            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <div
                className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-2 sm:px-4"
                style={{ maxHeight: "100%" } as CSSProperties}
              >
                <div className="flex w-full flex-col items-center" style={boardContainerStyle}>
                  <div className="flex w-full flex-col" style={boardStackStyle}>
                    {Array.from({ length: allowedGuesses }).map((_, rowIndex) => {
                      const guess = guesses[rowIndex] ?? "";
                      const evaluation = results[rowIndex];
                      const isCurrentRow =
                        rowIndex === guesses.length && !isGameOver;
                      const shouldShake =
                        invalidWordShake && isCurrentRow;
                      const isJustEvaluated =
                        lastEvaluatedRowIndex === rowIndex && evaluation;

                      const display = isCurrentRow ? currentGuess : guess;

                      return (
                        <motion.div
                          key={`row-${rowIndex}`}
                          className="grid"
                          style={boardRowStyle}
                          animate={
                            shouldShake
                              ? {
                                  x: [0, -8, 8, -8, 8, 0],
                                  transition: {
                                    duration: 0.25,
                                    ease: "easeOut",
                                  },
                                }
                              : undefined
                          }
                        >
                          {Array.from({ length: wordLength }).map((_, letterIndex) => {
                            const letter = display[letterIndex];
                            const status = evaluation?.[letterIndex];

                            return (
                              <motion.div
                                key={`row-${rowIndex}-cell-${letterIndex}`}
                                className={cn(
                                  "flex aspect-square min-h-0 w-full items-center justify-center rounded border text-sm font-bold uppercase sm:text-base",
                                  status === "correct" &&
                                    "border-emerald-500 bg-emerald-500 text-white",
                                  status === "present" &&
                                    "border-amber-400 bg-amber-400 text-white",
                                  status === "absent" &&
                                    "border-slate-300 bg-slate-200 text-slate-600",
                                  !status &&
                                    letter &&
                                    "border-primary/60 bg-primary/10 text-primary",
                                  !letter &&
                                    "border-border bg-background text-muted-foreground/40"
                                )}
                                initial={false}
                                animate={
                                  isJustEvaluated && status
                                    ? status === "correct"
                                      ? {
                                          scale: [1, 1.15, 1],
                                          transition: {
                                            duration: 0.2,
                                            delay: letterIndex * 0.03,
                                          },
                                        }
                                      : status === "present"
                                      ? {
                                          scale: [1, 1.08, 1],
                                          rotate: [0, -3, 3, 0],
                                          transition: {
                                            duration: 0.2,
                                            delay: letterIndex * 0.03,
                                          },
                                        }
                                      : {
                                          scale: [1, 1.08, 1],
                                          transition: {
                                            duration: 0.18,
                                            delay: letterIndex * 0.03,
                                          },
                                        }
                                    : undefined
                                }
                              >
                                {letter ?? ""}
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto pb-1">
                {statusMessage && (
                  <p
                    className={cn(
                      "text-center text-sm font-medium",
                      statusMessage.tone === "error" && "text-red-600",
                      statusMessage.tone === "warning" && "text-amber-700",
                      statusMessage.tone === "success" && "text-emerald-600",
                      statusMessage.tone === "info" && "text-muted-foreground"
                    )}
                  >
                    {statusMessage.text}
                  </p>
                )}

                {wordFetchError && wordSource === "fallback" && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700 shadow-sm">
                    Live words are taking a break (reason: {wordFetchError}). Using our cozy backup list for now.
                  </div>
                )}

                {showRetryPrompt && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-800 shadow-sm">
                    <p className="text-base font-semibold">Bonus chance unlocked!</p>
                    <p className="mt-1">
                      Take one more try or choose a new puzzle.
                      {hasHintAvailable
                        ? " Your hint is still waiting to help."
                        : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleRetryRound}
                        className="inline-flex items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Try again
                      </button>
                      <button
                        type="button"
                        onClick={handleChooseNewPuzzle}
                        className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-400 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Choose a new puzzle
                      </button>
                    </div>
                  </div>
                )}

                {isGameOver && (
                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-4 shadow-md sm:px-5 sm:py-5",
                      theme.statusCardFlip
                    )}
                  >
                    <p className="text-center text-base font-semibold text-foreground sm:text-lg">
                      {isSolved ? "You did it!" : "Nice try!"}
                    </p>
                    <p className="mt-1 text-center text-sm text-muted-foreground">
                      Play again with the same buddy & pack, or start a new game.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                      <button
                        type="button"
                        onClick={handlePlayAgain}
                        className={cn(
                          "inline-flex items-center justify-center rounded-full bg-gradient-to-r px-5 py-3 text-base font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          theme.ctaGradient,
                          theme.ctaShadow,
                          theme.ctaShadowHover
                        )}
                      >
                        Play again
                      </button>
                      <Link
                        href="/"
                        onClick={() => {
                          if (isOutOfTries && !recordedForRoundRef.current) {
                            recordedForRoundRef.current = true;
                            recordGame(false);
                            setStatsRefresh((n) => n + 1);
                          }
                        }}
                        className={cn(
                          "inline-flex items-center justify-center rounded-full border-2 bg-white/90 px-5 py-3 text-base font-semibold text-foreground transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          theme.buddySelectedBorder,
                          "hover:opacity-90"
                        )}
                      >
                        New game
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </div>
      </section>

      <footer className="relative z-10 w-full min-w-0 shrink-0 overflow-x-hidden bg-transparent">
        <div className="w-full min-w-0 pt-2">
          <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col items-center justify-center gap-2 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]">
            <StatsDisplay refreshTrigger={statsRefresh} variant="compact" />
          </div>
          <div className="flex justify-center py-2">
            {renderHintAccess(true)}
          </div>
          <Keyboard
            keyboardStatus={keyboardStatus}
            onLetter={handleLetter}
            onBackspace={handleBackspace}
            onSubmit={() => void handleSubmit()}
            disabled={isGameOver || !currentPuzzle || isCheckingWord}
          />
        </div>
      </footer>
    </main>
  );
}
