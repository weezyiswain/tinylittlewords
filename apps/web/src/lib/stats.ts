const STORAGE_KEY = "tlw-stats";
const ANON_ID_PREFIX = "tlw_anon_";

export type GameRecord = {
  date: string;
  win: boolean;
};

export type StatsStorage = {
  anonId: string;
  games: GameRecord[];
};

function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "";
  const key = "tlw-anon-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${ANON_ID_PREFIX}${crypto.randomUUID()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function load(): StatsStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "anonId" in parsed &&
      "games" in parsed &&
      Array.isArray((parsed as StatsStorage).games)
    ) {
      return parsed as StatsStorage;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function save(data: StatsStorage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function ensureStats(): StatsStorage {
  const anonId = getOrCreateAnonId();
  const existing = load();
  if (existing && existing.anonId) {
    return existing;
  }
  const next: StatsStorage = { anonId, games: [] };
  save(next);
  return next;
}

export function recordGame(win: boolean): void {
  const data = ensureStats();
  const date = today();
  data.games.push({ date, win });
  save(data);
}

export type Stats = {
  winsToday: number;
  streak: number;
  totalGames: number;
};

export function getStats(): Stats {
  const data = load() ?? ensureStats();
  const date = today();
  const games = data.games;

  const winsToday = games.filter((g) => g.date === date && g.win).length;
  const totalGames = games.length;

  const winDates = Array.from(
    new Set(games.filter((g) => g.win).map((g) => g.date))
  ).sort();
  if (winDates.length === 0) {
    return { winsToday, streak: 0, totalGames };
  }

  let streak = 0;
  const hasWinToday = winDates.includes(date);
  if (!hasWinToday) {
    return { winsToday, streak: 0, totalGames };
  }
  const d = new Date(date + "T12:00:00");
  while (true) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dStr = `${y}-${m}-${day}`;
    if (!winDates.includes(dStr)) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }

  return { winsToday, streak, totalGames };
}
