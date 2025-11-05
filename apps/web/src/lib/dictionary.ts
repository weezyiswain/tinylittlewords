const INITIAL_DICTIONARY: Record<number, string[]> = {
  3: ["SUN", "CAT", "PEN", "DOG", "FOX", "HAT", "BEE", "RUN"],
  4: ["FROG", "MOON", "MILK", "STAR", "BOOK", "TREE", "JUMP", "FISH"],
  5: ["APPLE", "SMILE", "TRAIN", "BREAD", "HEART", "PLANT", "LIGHT", "SWEET"],
};

const VALID_WORDS: Record<number, Set<string>> = Object.fromEntries(
  Object.entries(INITIAL_DICTIONARY).map(([length, words]) => [
    Number(length),
    new Set(words),
  ])
);

const REMOTE_LOOKUP_CACHE = new Map<string, boolean>();
const DICTIONARY_API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";

function normalizeWord(word: string): string {
  return word.trim().toUpperCase();
}

function getWordSet(length: number): Set<string> {
  if (!VALID_WORDS[length]) {
    VALID_WORDS[length] = new Set();
  }
  return VALID_WORDS[length]!;
}

export async function isValidWord(
  length: number,
  guess: string
): Promise<boolean> {
  const normalized = normalizeWord(guess);
  if (!normalized) return false;

  const wordSet = getWordSet(length);
  if (wordSet.has(normalized)) return true;

  if (REMOTE_LOOKUP_CACHE.has(normalized)) {
    const cached = REMOTE_LOOKUP_CACHE.get(normalized)!;
    if (cached) {
      wordSet.add(normalized);
    }
    return cached;
  }

  try {
    const response = await fetch(
      `${DICTIONARY_API_BASE}/${normalized.toLowerCase()}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        REMOTE_LOOKUP_CACHE.set(normalized, false);
        return false;
      }
      throw new Error(
        `Dictionary API responded with status ${response.status}`
      );
    }

    const payload = await response.json();
    const hasEntry = Array.isArray(payload) && payload.length > 0;

    REMOTE_LOOKUP_CACHE.set(normalized, hasEntry);
    if (hasEntry) {
      wordSet.add(normalized);
    }

    return hasEntry;
  } catch (error) {
    console.error(`[Dictionary] Failed to verify "${normalized}":`, error);
    // When the API fails, err on the side of allowing the guess.
    return true;
  }
}

export function addWordToDictionary(length: number, word: string) {
  const normalized = normalizeWord(word);
  getWordSet(length).add(normalized);
  REMOTE_LOOKUP_CACHE.set(normalized, true);
}
