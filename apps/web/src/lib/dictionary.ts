const VALID_WORDS: Record<number, string[]> = {
  3: ["SUN", "CAT", "PEN", "DOG", "FOX", "HAT", "BEE", "RUN"],
  4: ["FROG", "MOON", "MILK", "STAR", "BOOK", "TREE", "JUMP", "FISH"],
  5: ["APPLE", "SMILE", "TRAIN", "BREAD", "HEART", "PLANT", "LIGHT", "SWEET"],
};

export function isValidWord(length: number, guess: string): boolean {
  const list = VALID_WORDS[length];
  if (!list) return false;
  return list.includes(guess.toUpperCase());
}

export function addWordToDictionary(length: number, word: string) {
  const upper = word.toUpperCase();
  if (!VALID_WORDS[length]) {
    VALID_WORDS[length] = [upper];
    return;
  }
  if (!VALID_WORDS[length].includes(upper)) {
    VALID_WORDS[length].push(upper);
  }
}
