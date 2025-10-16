"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  AVATAR_OPTIONS,
  AvatarOption,
  getRandomAvatar,
} from "@/lib/avatars";
import { getFallbackPuzzles, Puzzle } from "@/lib/game-data";
import { addWordToDictionary, isValidWord } from "@/lib/dictionary";
import { supabase } from "@/lib/supabaseClient";

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

function buildHints(word: string): string[] {
  const upper = word.toUpperCase();
  const baseHints = [
    `This word has ${upper.length} letters.`,
    `It starts with "${upper[0]}".`,
    `It ends with "${upper[upper.length - 1]}".`,
  ];

  const hintCount = upper.length >= 5 ? 2 : 1;
  return baseHints.slice(0, hintCount);
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
  hintsLeft: number;
  onReveal: (index: number) => void;
  className?: string;
  highlight?: boolean;
};

function HintList({
  hints,
  revealed,
  hintsLeft,
  onReveal,
  className,
  highlight = false,
}: HintListProps) {
  const firstHiddenIndex = revealed.findIndex((flag) => !flag);
  const showButtonHighlight = highlight && firstHiddenIndex !== -1;

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-background/90 px-4 py-4 shadow-inner transition",
        highlight &&
          "border-amber-300 bg-amber-50/90 shadow-[0_0_24px_rgba(251,191,36,0.25)]",
        className
      )}
    >
      <h2
        className={cn(
          "text-base font-semibold text-foreground",
          highlight && "text-amber-700"
        )}
      >
        Helpful hints
      </h2>
      <p
        className={cn(
          "mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground",
          highlight && "text-amber-600"
        )}
      >
        Tap to reveal.{" "}
        {hintsLeft > 0
          ? `${hintsLeft} hint${hintsLeft === 1 ? "" : "s"} left.`
          : "All hints unlocked!"}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {hints.length === 0 ? (
          <li className="rounded-lg border border-dashed border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            No hints just yet—trust your instincts!
          </li>
        ) : (
          hints.map((hint, index) => {
            const isRevealed = revealed[index];
            return (
              <li
                key={hint}
                className={cn(
                  "flex items-start gap-2 rounded-lg border border-transparent px-2 py-1 transition",
                  isRevealed
                    ? "border-primary/20 bg-primary/5"
                    : "hover:border-primary/20 hover:bg-primary/5"
                )}
              >
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                {isRevealed ? (
                  <span className="text-foreground">{hint}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReveal(index)}
                    className={cn(
                      "inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm transition hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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

type PackWordRow = {
  words: {
    text: string | null;
    length?: number | null;
  } | null;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const lengthFromParams = Number(searchParams.get("length"));
  const wordLength =
    WORD_LENGTHS.find((option) => option === lengthFromParams) ?? 5;

  const avatarId = searchParams.get("avatar");
  const packId = searchParams.get("pack");
  const packName = searchParams.get("packName");
  const seed = searchParams.get("seed");
  const avatar = useMemo(() => chooseAvatar(avatarId), [avatarId]);

  const [wordPool, setWordPool] = useState<Puzzle[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [wordSource, setWordSource] = useState<"supabase" | "fallback">(
    "fallback"
  );
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [wordFetchError, setWordFetchError] = useState<string | null>(null);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<LetterStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyboardStatus, setKeyboardStatus] = useState<
    Record<string, LetterStatus>
  >({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<boolean[]>([]);
  const [hasRetried, setHasRetried] = useState(false);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);

  const targetWord = currentPuzzle?.word ?? "";
  const activeHints = currentPuzzle?.hints ?? [];

  useEffect(() => {
    let isCancelled = false;

    const loadWords = async () => {
      setIsLoadingWords(true);
      setWordFetchError(null);

      try {
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
              .map((item: PackWordRow) =>
                item?.words?.text ? item.words.text.toUpperCase() : null
              )
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
          setIsLoadingWords(false);

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
      setIsLoadingWords(false);

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
  const highlightFinalChance =
    Boolean(currentPuzzle) && isFinalChanceWithHint;

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
      if (isGameOver || !currentPuzzle) return;
      setStatusMessage(null);
      setCurrentGuess((prev) => {
        if (prev.length >= wordLength) return prev;
        return `${prev}${letter}`;
      });
    },
    [currentPuzzle, isGameOver, wordLength]
  );

  const handleBackspace = useCallback(() => {
    if (isGameOver || !currentPuzzle) return;
    setStatusMessage(null);
    setCurrentGuess((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  }, [currentPuzzle, isGameOver]);

  const handleSubmit = useCallback(() => {
    if (!currentPuzzle) return;
    if (isGameOver) {
      setStatusMessage("Great job! Head home to try a new word.");
      return;
    }
    if (currentGuess.length !== wordLength) {
      setStatusMessage("That's not a real word yet. Tap erase and try again.");
      return;
    }

    if (!isValidWord(wordLength, currentGuess)) {
      setStatusMessage("That's not a real word. Tap erase and try again.");
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
      setStatusMessage("You solved it! High fives all around!");
      setShowRetryPrompt(false);
    } else if (nextGuessCount >= allowedGuesses) {
      const baseMessage = `Nice try! The word was ${targetWord}.`;
      const hintReminder =
        !hasRetried && hasHintAvailable
          ? " You still have a hint waiting if you want another go."
          : "";

      setStatusMessage(`${baseMessage}${hintReminder}`);
      setShowRetryPrompt(!hasRetried);
    } else {
      setStatusMessage("Keep guessing—you've got this!");
    }
  }, [
    currentGuess,
    currentPuzzle,
    guesses.length,
    allowedGuesses,
    hasHintAvailable,
    hasRetried,
    isGameOver,
    targetWord,
    updateKeyboard,
    wordLength,
  ]);

  const handleRestart = useCallback(() => {
    const nextAvatar = getRandomAvatar(avatar.id);
    const nextSeed = Date.now();
    const packQuery = packId ? `&pack=${packId}` : "";
    const packNameQuery = packName
      ? `&packName=${encodeURIComponent(packName)}`
      : "";
    router.replace(
      `/play?length=${wordLength}&avatar=${nextAvatar.id}&seed=${nextSeed}${packQuery}${packNameQuery}`
    );
  }, [avatar.id, packId, packName, router, wordLength]);

  const handleRetryRound = useCallback(() => {
    setCurrentGuess("");
    setStatusMessage(
      hasHintAvailable
        ? "Final guess unlocked! Peek at your hint if you need a boost."
        : "Final guess unlocked! You can do this!"
    );
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
        handleSubmit();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleBackspace, handleLetter, handleSubmit]);

  return (
    <main className="flex min-h-dvh flex-col bg-secondary/40">
      <div className="mx-auto flex w-full flex-1 flex-col px-4 pb-4 pt-4 sm:px-6 lg:max-w-6xl lg:grid lg:grid-cols-[1fr_minmax(18rem,28rem)_1fr] lg:items-start lg:gap-6">
        <div className="hidden lg:block" aria-hidden />

        <div className="flex w-full max-w-xl flex-1 flex-col lg:col-start-2 lg:justify-self-center">
          <header className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/80 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full text-2xl shadow-inner sm:h-12 sm:w-12",
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
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {wordLength} letter word
              </p>
              <p className="text-sm font-medium text-foreground">
                {triesLeft} tries left
              </p>
              {packName ? (
                <p className="text-xs text-muted-foreground">Pack: {packName}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Pack: Surprise mix</p>
              )}
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wide",
                  wordSource === "supabase"
                    ? "text-emerald-600"
                    : "text-amber-600"
                )}
              >
                {wordSource === "supabase"
                  ? isLoadingWords
                    ? "Loading live words…"
                    : "Live Supabase words"
                  : "Offline backup words"}
              </p>
            </div>
          </header>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-4"
          >
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
                    style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
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
                              "border-border bg-muted text-muted-foreground",
                            !status && letter &&
                              "border-primary/60 bg-primary/10 text-primary",
                            !letter && "border-border bg-background text-muted-foreground/40"
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

            {statusMessage ? (
              <div className="rounded-lg border border-border bg-white/90 px-4 py-3 text-sm font-medium text-foreground shadow-sm">
                {statusMessage}
              </div>
            ) : (
              <div
                className={cn(
                  "rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground",
                  highlightFinalChance &&
                    "border-amber-400 bg-amber-50 text-amber-700 font-semibold"
                )}
              >
                {!currentPuzzle ? (
                  isLoadingWords
                    ? "Loading a fresh word—one moment!"
                    : "We couldn't find a word right now. Try another pack or length."
                ) : highlightFinalChance ? (
                  <>Last guess! Your hint is still waiting if you need it.</>
                ) : (
                  "Type the word, tap enter, and use the colors to guide you."
                )}
              </div>
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

            <HintList
              className="lg:hidden"
              hints={activeHints}
              revealed={revealedHints}
              hintsLeft={hintsLeft}
              onReveal={revealHint}
              highlight={shouldHighlightHints}
            />
          </motion.section>
        </div>

        <div className="hidden lg:block">
          <HintList
            className="sticky top-6 max-h-[calc(100dvh-3rem)] overflow-auto"
            hints={activeHints}
            revealed={revealedHints}
            hintsLeft={hintsLeft}
            onReveal={revealHint}
            highlight={shouldHighlightHints}
          />
        </div>
      </div>

      <motion.nav
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
        className="mt-auto w-full border-t border-border bg-background/95 px-2 py-3 shadow-lg backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-2">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={`kb-row-${rowIndex}`} className="flex justify-center gap-1">
              {row.map((key) => {
                const status = keyboardStatus[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleLetter(key)}
                    className={cn(
                      "flex h-11 min-w-[2.2rem] flex-1 items-center justify-center rounded-lg border border-border bg-white text-sm font-semibold text-foreground shadow-sm transition active:scale-[0.98] sm:h-12 sm:text-base sm:min-w-[2.4rem]",
                      status === "correct" &&
                        "border-emerald-500 bg-emerald-500 text-white",
                      status === "present" &&
                        "border-amber-400 bg-amber-400 text-white",
                      status === "absent" &&
                        "border-border bg-muted text-muted-foreground",
                      isGameOver && "opacity-70"
                    )}
                    disabled={isGameOver || !currentPuzzle}
                  >
                    {key}
                  </button>
                );
              })}
              {rowIndex === KEYBOARD_ROWS.length - 1 && (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex h-11 min-w-[3.4rem] items-center justify-center rounded-lg border border-primary bg-primary text-xs font-semibold uppercase text-primary-foreground shadow-sm transition active:scale-[0.98] sm:h-12 sm:text-sm"
                    disabled={isGameOver || !currentPuzzle}
                  >
                    Enter
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="flex h-11 min-w-[3.4rem] items-center justify-center rounded-lg border border-border bg-white text-sm font-semibold text-foreground shadow-sm transition active:scale-[0.98] sm:h-12 sm:text-base"
                    disabled={isGameOver || !currentPuzzle}
                  >
                    ⌫
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <Link
            href="/"
            className="rounded-full border border-border bg-white px-3 py-1.5 font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            Choose a new puzzle
          </Link>
          <button
            type="button"
            onClick={handleRestart}
            className="rounded-full border border-border bg-white px-3 py-1.5 font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            Restart
          </button>
        </div>
      </motion.nav>
    </main>
  );
}
