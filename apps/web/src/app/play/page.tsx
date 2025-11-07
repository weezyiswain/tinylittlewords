"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, HelpCircle, Lightbulb, Sparkles, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AVATAR_OPTIONS,
  AvatarOption,
  getRandomAvatar,
} from "@/lib/avatars";
import { getFallbackPuzzles, Puzzle } from "@/lib/game-data";
import { addWordToDictionary, isValidWord } from "@/lib/dictionary";
import { supabase } from "@/lib/supabaseClient";
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

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
] as const;

const STATUS_PRIORITY: Record<LetterStatus, number> = {
  absent: 1,
  present: 2,
  correct: 3,
};

const SUPPORTED_LENGTHS = [3, 4, 5] as const;

type StatusTone = "info" | "error" | "success" | "warning" | "encouragement";

type StatusSpeaker = Pick<AvatarOption, "id" | "name" | "emoji" | "bg">;

type StatusMessage = {
  text: string;
  tone: StatusTone;
  speaker?: StatusSpeaker;
};

const ENCOURAGEMENT_MESSAGES: Record<string, string> = {
  bear: "Brave Bear rumbles: keep roaring through those letters!",
  dog: "Daring Dog barks: keep sniffing out that word!",
  fox: "Swift Fox grins: keep darting toward the answer!",
  owl: "Wise Owl hoots: keep those clever guesses coming!",
  panda: "Playful Panda claps: keep the giggles and guesses going!",
  "lovey-cat": "Lovey the Cat purrs: keep guessing—you're paws-itively close!",
};

const ENCOURAGEMENT_ACCENTS: Record<
  string,
  { border: string; message: string }
> = {
  bear: { border: "border-amber-300", message: "text-amber-900" },
  dog: { border: "border-blue-300", message: "text-blue-900" },
  fox: { border: "border-orange-300", message: "text-orange-900" },
  owl: { border: "border-purple-300", message: "text-purple-900" },
  panda: { border: "border-emerald-300", message: "text-emerald-900" },
  "lovey-cat": { border: "border-pink-300", message: "text-pink-900" },
};

const STATUS_TONE_STYLES: Record<StatusTone, string> = {
  info: "border-border bg-white/90 text-foreground",
  error: "border-red-300 bg-red-50 text-red-900",
  success: "border-emerald-300 bg-emerald-50 text-emerald-900",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  encouragement: "",
};

function getEncouragementMessage(avatar: AvatarOption): string {
  return (
    ENCOURAGEMENT_MESSAGES[avatar.id] ?? "Your buddy cheers: keep guessing!"
  );
}

function getEncouragementAccent(avatar?: StatusSpeaker) {
  if (!avatar) {
    return { border: "border-primary/40", message: "text-primary-900" };
  }
  return (
    ENCOURAGEMENT_ACCENTS[avatar.id] ?? {
      border: "border-primary/40",
      message: "text-primary-900",
    }
  );
}

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

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60_000;
  return Math.floor(diff / 86_400_000);
}

type HintListProps = {
  hints: string[];
  revealed: boolean[];
  onReveal: (index: number) => void;
  className?: string;
  highlight?: boolean;
};

function HintList({
  hints,
  revealed,
  onReveal,
  className,
  highlight = false,
}: HintListProps) {
  const firstHiddenIndex = revealed.findIndex((flag) => !flag);
  const showButtonHighlight = highlight && firstHiddenIndex !== -1;

  return (
    <section
      className={cn(
        "rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-[0_15px_35px_rgba(173,216,255,0.25)] backdrop-blur transition",
        highlight &&
          "border-amber-300 bg-gradient-to-br from-amber-50/95 via-white to-rose-100/90 shadow-[0_0_40px_rgba(251,191,36,0.35)]",
        className
      )}
    >
      <h2
        className={cn(
          "text-base font-semibold text-foreground",
          highlight && "text-amber-700"
        )}
      >
        Hints
      </h2>
      <ul className="mt-2 space-y-2 overflow-y-auto pr-1 text-sm text-muted-foreground sm:max-h-40 max-h-28">
        {hints.length === 0 ? (
          <li className="rounded-lg border border-dashed border-primary/30 bg-gradient-to-r from-primary/10 via-white/90 to-sky-100/60 px-3 py-1.5 text-xs text-muted-foreground">
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
                      "inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-sky-200/70 via-rose-200/70 to-amber-200/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary shadow-[0_10px_22px_rgba(156,214,255,0.35)] transition hover:shadow-[0_12px_30px_rgba(255,182,193,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      showButtonHighlight && index === firstHiddenIndex
                        ? "border-amber-400 bg-amber-100 text-amber-700 animate-bounce"
                        : ""
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

  const lengthFromParams = Number(searchParams?.get("length") ?? NaN);
  const wordLength =
    WORD_LENGTHS.find((option) => option === lengthFromParams) ?? 5;

  const avatarId = searchParams?.get("avatar") ?? null;
  const packId = searchParams?.get("pack") ?? null;
  const packName = searchParams?.get("packName") ?? null;
  const seed = searchParams?.get("seed") ?? null;
  const packLabel =
    typeof packName === "string" && packName.trim().length > 0
      ? packName
      : "Surprise mix";
  const avatar = useMemo(() => chooseAvatar(avatarId), [avatarId]);

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
  const [isMessageFlipped, setIsMessageFlipped] = useState(false);

  const targetWord = currentPuzzle?.word ?? "";
  const activeHints = currentPuzzle?.hints ?? [];

  useEffect(() => {
    let isCancelled = false;

    const loadWords = async () => {
      setWordFetchError(null);

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

        if (packId) {
          const { data: packWordData, error: packWordError } = await supabase
            .from("pack_words")
            .select("words(text,length)")
            .eq("pack_id", packId);

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

          console.log(
            `[Supabase] Loaded ${puzzles.length} words for length ${wordLength}${
              packId ? ` (pack ${packId})` : ""
            }.`
          );
          const sample = puzzles[Math.floor(Math.random() * puzzles.length)]!;
          console.log(`[Supabase] Sample word: ${sample.word}`);
          if (puzzles.length > 0) {
            const todayIndex = getDayOfYear(new Date()) % puzzles.length;
            const dailyWord = puzzles[todayIndex]!.word;
            console.log(`[Supabase] Daily word pick: ${dailyWord}`);
          }
          return;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown Supabase error.";
        console.error("[Supabase] Failed to load words:", message);
        if (!isCancelled) {
          setWordFetchError(message);
        }
      }

      if (isCancelled) return;

      setWordFetchError((prev) =>
        prev
          ? `${prev} (using fallback list)`
          : packId
          ? "No words available for this pack right now."
          : "No words returned from Supabase."
      );

      const fallbackPool = getFallbackPuzzles(wordLength);
      fallbackPool.forEach((puzzle) =>
        addWordToDictionary(wordLength, puzzle.word.toUpperCase())
      );
      setWordPool(fallbackPool);
      setWordSource("fallback");

      if (fallbackPool.length === 0) {
        console.warn(
          `[Supabase] No fallback words available for length ${wordLength}.`
        );
      } else {
        console.warn(
          `[Supabase] Using fallback word list (${fallbackPool.length} words) for length ${wordLength}.`
        );
        const todayIndex = getDayOfYear(new Date()) % fallbackPool.length;
        const dailyWord = fallbackPool[todayIndex]!.word;
        console.warn(`[Supabase] Daily fallback word pick: ${dailyWord}`);
      }
    };

    void loadWords();

    return () => {
      isCancelled = true;
    };
  }, [packId, wordLength]);

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
  const shouldFlipMessage =
    statusMessage?.tone === "success" || statusMessage?.tone === "encouragement";
  const encouragementAccent = getEncouragementAccent(statusMessage?.speaker);
  useEffect(() => {
    if (!shouldFlipMessage || !statusMessage) {
      setIsMessageFlipped(false);
      return;
    }
    setIsMessageFlipped(true);
    const timeout = window.setTimeout(() => {
      setIsMessageFlipped(false);
      setStatusMessage(null);
    }, 4000);
    return () => window.clearTimeout(timeout);
  }, [shouldFlipMessage, statusMessage]);
  const renderHintHelp = (
    buttonClassName?: string,
    variant: "default" | "muted" = "default"
  ) => {
    const baseClasses =
      variant === "muted"
        ? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/85 text-muted-foreground shadow-[0_10px_20px_rgba(173,216,255,0.25)] transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
        : "flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-gradient-to-br from-[#ff87cf] via-[#ffb973] to-[#6bdff9] text-white shadow-[0_12px_26px_rgba(255,174,204,0.45)] transition hover:shadow-[0_14px_32px_rgba(109,211,249,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2";
    return (
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(baseClasses, buttonClassName)}
            aria-label="How to play"
          >
            <HelpCircle className="h-5 w-5" aria-hidden />
          </button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] w-full rounded-t-3xl border-t border-white/60 bg-white/90 px-4 pb-6 pt-5 shadow-[0_-20px_45px_rgba(173,216,255,0.25)] backdrop-blur"
        >
          <SheetHeader className="pb-2 text-center">
            <SheetTitle className="text-xl font-bold text-foreground">
              How to Play
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Guess the secret word in {MAX_GUESSES} tries. Use the colors after each guess to steer your next one!
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-5 overflow-y-auto pb-6">
            <section className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                The Goal
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Type a {wordLength}-letter word. Keep trying until every tile shines green!
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Lightbulb className="h-5 w-5 text-amber-500" aria-hidden />
                Color Detective Guide
              </h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">
                    😀
                  </span>
                  <span className="font-semibold text-emerald-700">
                    Green = Perfect spot
                  </span>
                </li>
                <li className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-xs font-bold text-white">
                  😮
                </span>
                <span className="font-semibold text-amber-700">
                  Yellow = Move me
                </span>
              </li>
              <li className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted-foreground/60 text-xs font-bold text-white">
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
              <Star className="h-5 w-5 text-rose-500" aria-hidden />
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
      </SheetContent>
    </Sheet>
  );
  };

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
        text: "Great job! Head home to try a new word.",
        tone: "success",
      });
      return;
    }
    if (currentGuess.length !== wordLength) {
      setStatusMessage({
        text: "That's not a real word yet. Tap erase and try again.",
        tone: "warning",
      });
      return;
    }

    setIsCheckingWord(true);
    setStatusMessage({
      text: "Checking that word...",
      tone: "info",
    });

    try {
      const isRealWord = await isValidWord(wordLength, currentGuess);

      if (!isRealWord) {
        setStatusMessage({
          text: "That's not a real word. Tap erase and try again.",
          tone: "error",
        });
        return;
      }

      const evaluation = evaluateGuess(currentGuess, targetWord);

      setGuesses((prev) => [...prev, currentGuess]);
      setResults((prev) => [...prev, evaluation]);
      updateKeyboard(currentGuess, evaluation);
      setCurrentGuess("");

      const nextIsSolved = currentGuess === targetWord;
      const nextGuessCount = guesses.length + 1;

      if (nextIsSolved) {
        setStatusMessage({
          text: "You solved it! High fives all around!",
          tone: "success",
        });
        setShowRetryPrompt(false);
      } else if (nextGuessCount >= allowedGuesses) {
        const baseMessage = `Nice try! The word was ${targetWord}.`;
        const hintReminder =
          !hasRetried && hasHintAvailable
            ? " You still have a hint waiting if you want another go."
            : "";

        setStatusMessage({
          text: `${baseMessage}${hintReminder}`,
          tone: "warning",
        });
        setShowRetryPrompt(!hasRetried);
      } else {
        setStatusMessage({
          text: getEncouragementMessage(avatar),
          tone: "encouragement",
          speaker: avatar,
        });
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
    avatar,
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
    router.push("/");
  }, [router]);

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
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[-15%] h-72 w-72 rounded-full bg-gradient-to-br from-rose-200/65 via-rose-100/50 to-transparent blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute bottom-[-18%] right-[-10%] h-80 w-80 rounded-full bg-gradient-to-br from-sky-200/60 via-sky-100/45 to-transparent blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute top-1/3 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-gradient-to-br from-amber-200/45 via-amber-100/35 to-transparent blur-3xl" />
      </div>
      <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0)+15rem)] lg:pb-12">
        <section className="mx-auto flex w-full flex-1 flex-col px-4 pb-4 pt-4 sm:px-6 lg:max-w-6xl lg:grid lg:grid-cols-[1fr_minmax(18rem,28rem)_1fr] lg:items-start lg:gap-6">
        <div className="hidden lg:block" aria-hidden />

        <div className="flex w-full max-w-xl flex-1 flex-col lg:col-start-2 lg:justify-self-center lg:max-w-3xl">
          <div
            className="mb-4 flex items-center gap-3"
            style={{ perspective: "1600px" }}
          >
            <Link
              href="/"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/85 text-muted-foreground shadow-[0_10px_20px_rgba(173,216,255,0.25)] transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
              aria-label="Back to puzzles"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </Link>
            <motion.div
              animate={{ rotateY: isMessageFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative h-full flex-1"
            >
              <div
                className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_18px_45px_rgba(173,216,255,0.3)] backdrop-blur"
                style={{ backfaceVisibility: "hidden" }}
                aria-live="polite"
                role="status"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full text-2xl shadow-[0_8px_18px_rgba(0,0,0,0.1)] sm:h-12 sm:w-12",
                      avatar.bg
                    )}
                    aria-hidden
                  >
                    {avatar.emoji}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Playing with
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {avatar.name}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "absolute inset-0 flex flex-col justify-center rounded-3xl border px-4 py-3 shadow-[0_18px_45px_rgba(173,216,255,0.3)] backdrop-blur",
                  statusMessage?.tone === "encouragement" && statusMessage?.speaker
                    ? encouragementAccent.border
                    : statusMessage?.tone === "success"
                    ? "border-emerald-300"
                    : "border-white/70",
                  statusMessage?.tone === "success" ? "bg-emerald-50" : "bg-white/90"
                )}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {statusMessage?.tone === "encouragement" && statusMessage?.speaker ? (
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-2xl shadow-[0_10px_24px_rgba(173,216,255,0.4)]">
                      {statusMessage.speaker.emoji}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-foreground/70">
                        {statusMessage.speaker.name} says
                      </span>
                      <span
                        className={cn(
                          "mt-1 text-sm font-semibold leading-snug sm:text-base",
                          encouragementAccent.message
                        )}
                      >
                        {statusMessage.text}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start justify-center gap-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                      Message
                    </p>
                    <p
                      className={cn(
                        "text-base font-semibold leading-snug sm:text-lg",
                        statusMessage?.tone === "success"
                          ? "text-emerald-900"
                          : "text-foreground"
                      )}
                    >
                      {statusMessage?.text ?? "You're doing great!"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
            {renderHintHelp(undefined, "muted")}
          </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-1 flex-col gap-4"
        >
          <div className="space-y-4 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_22px_55px_rgba(173,216,255,0.35)] backdrop-blur">
            <div className="grid gap-2">
              {Array.from({ length: allowedGuesses }).map((_, rowIndex) => {
                const guess = guesses[rowIndex] ?? "";
                const evaluation = results[rowIndex];
                const isCurrentRow =
                  rowIndex === guesses.length && !isGameOver;

                const display = isCurrentRow ? currentGuess : guess;

                return (
                  <div
                    key={`row-${rowIndex}`}
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: wordLength }).map((_, letterIndex) => {
                      const letter = display[letterIndex];
                      const status = evaluation?.[letterIndex];

                      return (
                        <div
                          key={`row-${rowIndex}-cell-${letterIndex}`}
                          className={cn(
                            "flex h-12 items-center justify-center rounded-lg border text-lg font-bold uppercase transition sm:h-14 sm:text-xl",
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
                        >
                          {letter ?? ""}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {statusMessage && !shouldFlipMessage && (
              statusMessage.tone === "encouragement" && statusMessage.speaker ? (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-md",
                    statusMessage.speaker.bg,
                    encouragementAccent.border
                  )}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-2xl">
                    {statusMessage.speaker.emoji}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-foreground/70">
                      {statusMessage.speaker.name} says
                    </span>
                    <span
                      className={cn(
                        "mt-1 text-sm font-semibold leading-snug sm:text-base",
                        encouragementAccent.message
                      )}
                    >
                      {statusMessage.text}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "rounded-lg border px-4 py-3 text-sm font-medium shadow-sm",
                    STATUS_TONE_STYLES[statusMessage.tone] ??
                      STATUS_TONE_STYLES.info
                  )}
                >
                  {statusMessage.text}
                </div>
              )
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
          </div>

          <div className="lg:hidden">
            <HintList
              hints={activeHints}
              revealed={revealedHints}
              onReveal={revealHint}
              highlight={shouldHighlightHints}
            />
          </div>
        </motion.section>

        <div className="hidden lg:block">
          <div className="sticky top-6">
            <HintList
              className="max-h-[calc(100dvh-3rem)] overflow-auto pr-16"
              hints={activeHints}
              revealed={revealedHints}
              onReveal={revealHint}
              highlight={shouldHighlightHints}
            />
          </div>
        </div>
      </div>
        </section>
      </div>

    <div className="fixed inset-x-0 bottom-0 z-30 w-full lg:static lg:mt-auto lg:bottom-auto">
      <div className="mx-auto w-full max-w-none">
        <div className="flex justify-center">
          <span className="inline-flex items-center rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[0.675rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground shadow-[0_10px_20px_rgba(173,216,255,0.25)]">
            Pack: {packLabel}
          </span>
        </div>
        <motion.nav
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
          className="mt-2 w-full border-t border-white/60 bg-white pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)] shadow-[0_-15px_40px_rgba(173,216,255,0.35)]"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-2 pt-3 sm:px-6 lg:px-8">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={`kb-row-${rowIndex}`} className="flex justify-center gap-1">
                {rowIndex === KEYBOARD_ROWS.length - 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        void handleSubmit();
                      }}
                      className="flex h-11 min-w-[3.4rem] items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-[#ff87cf] via-[#ffb973] to-[#6bdff9] text-xs font-semibold uppercase text-white shadow-[0_14px_32px_rgba(255,174,204,0.45)] transition active:scale-[0.98] sm:h-12 sm:text-sm"
                      disabled={isGameOver || !currentPuzzle || isCheckingWord}
                      aria-label="Submit guess"
                    >
                      Enter
                    </button>
                    {row.map((key) => {
                      const status = keyboardStatus[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleLetter(key)}
                          className={cn(
                            "flex h-11 min-w-[2.2rem] flex-1 items-center justify-center rounded-lg border border-white/70 bg-white/85 text-sm font-semibold text-foreground shadow-[0_10px_22px_rgba(173,216,255,0.35)] transition active:scale-[0.98] sm:h-12 sm:text-base sm:min-w-[2.4rem]",
                            status === "correct" &&
                              "border-emerald-500 bg-emerald-500 text-white",
                            status === "present" &&
                              "border-amber-400 bg-amber-400 text-white",
                            status === "absent" &&
                              "border-slate-300 bg-slate-200 text-slate-600",
                            (isGameOver || isCheckingWord) && "opacity-70"
                          )}
                          disabled={isGameOver || !currentPuzzle || isCheckingWord}
                          aria-label={`Letter ${key}`}
                        >
                          {key}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="flex h-11 min-w-[3.4rem] items-center justify-center rounded-lg border border-white/70 bg-white/85 text-sm font-semibold text-foreground shadow-[0_10px_22px_rgba(173,216,255,0.35)] transition active:scale-[0.98] sm:h-12 sm:text-base"
                      disabled={isGameOver || !currentPuzzle || isCheckingWord}
                      aria-label="Delete letter"
                    >
                      ⌫
                    </button>
                  </>
                ) : (
                  row.map((key) => {
                    const status = keyboardStatus[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleLetter(key)}
                        className={cn(
                          "flex h-11 min-w-[2.2rem] flex-1 items-center justify-center rounded-lg border border-white/70 bg-white/85 text-sm font-semibold text-foreground shadow-[0_10px_22px_rgba(173,216,255,0.35)] transition active:scale-[0.98] sm:h-12 sm:text-base sm:min-w-[2.4rem]",
                          status === "correct" &&
                            "border-emerald-500 bg-emerald-500 text-white",
                          status === "present" &&
                            "border-amber-400 bg-amber-400 text-white",
                          status === "absent" &&
                            "border-slate-300 bg-slate-200 text-slate-600",
                          (isGameOver || isCheckingWord) && "opacity-70"
                        )}
                        disabled={isGameOver || !currentPuzzle || isCheckingWord}
                        aria-label={`Letter ${key}`}
                      >
                        {key}
                      </button>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </motion.nav>
      </div>
    </div>
    </main>
  );
}
