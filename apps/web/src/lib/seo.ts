const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://tinylittlewords.com";

export const seoConfig = {
  siteName: "Tiny Little Words",
  siteUrl: DEFAULT_SITE_URL,
  defaultTitle: "Tiny Little Words – Kid-Friendly Word Puzzle",
  defaultDescription:
    "Pick a buddy, choose your word length, and play a gentle Wordle-inspired puzzle designed for readers ages 6-10.",
  keywords: [
    "kids word game",
    "wordle for kids",
    "educational games",
    "reading games",
    "family friendly puzzles",
    "tiny little words",
  ],
} as const;

export function canonicalUrl(pathname: string = "/"): string {
  const normalizedPath = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;
  return `${seoConfig.siteUrl}${normalizedPath}`;
}
