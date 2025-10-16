export type Puzzle = {
  word: string;
  hints: string[];
};

const THREE_LETTER: Puzzle[] = [
  {
    word: "SUN",
    hints: ["Look up on a bright day to see it."],
  },
  {
    word: "CAT",
    hints: ["This furry friend purrs when happy."],
  },
  {
    word: "PEN",
    hints: ["You use this to write your name."],
  },
];

const FOUR_LETTER: Puzzle[] = [
  {
    word: "FROG",
    hints: ["It loves to hop near a pond."],
  },
  {
    word: "MOON",
    hints: ["You spot it glowing at night."],
  },
  {
    word: "MILK",
    hints: ["You might pour it on cereal."],
  },
];

const FIVE_LETTER: Puzzle[] = [
  {
    word: "APPLE",
    hints: [
      "A crunchy fruit that can be red or green.",
      "Teachers sometimes get one as a gift.",
    ],
  },
  {
    word: "SMILE",
    hints: [
      "You do this when you're happy.",
      "It can brighten someone's day.",
    ],
  },
  {
    word: "TRAIN",
    hints: [
      "It chugs along on tracks.",
      "You can ride it to visit grandparents.",
    ],
  },
];

export const PUZZLES_BY_LENGTH: Record<number, Puzzle[]> = {
  3: THREE_LETTER,
  4: FOUR_LETTER,
  5: FIVE_LETTER,
};

export function getFallbackPuzzles(length: number): Puzzle[] {
  return PUZZLES_BY_LENGTH[length] ?? [];
}

export function getFallbackPuzzle(length: number): Puzzle {
  const pool = getFallbackPuzzles(length);
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function getAllFallbackWords(): string[] {
  return Object.values(PUZZLES_BY_LENGTH)
    .flat()
    .map((puzzle) => puzzle.word.toUpperCase());
}
