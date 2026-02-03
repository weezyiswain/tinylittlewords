/**
 * Returns 3–4 subtle example emoji/icons for a pack based on its name.
 * Used for the Word Pack carousel card. Returns [] if no match.
 */
export function getPackExampleIcons(packLabel: string | null): string[] {
  if (!packLabel || typeof packLabel !== "string") return [];
  const lower = packLabel.toLowerCase().replace(/\s+pack$/i, "").trim();
  if (!lower) return [];

  const maps: Record<string, string[]> = {
    shapes: ["⬜", "⭕", "🔺", "⭐"],
    shape: ["⬜", "⭕", "🔺", "⭐"],
    food: ["🍔", "🍕", "🍎", "🥗"],
    foods: ["🍔", "🍕", "🍎", "🥗"],
    animals: ["🐕", "🐈", "🐼", "🦉"],
    animal: ["🐕", "🐈", "🐼", "🦉"],
    toys: ["🧸", "🪀", "🪆", "🎨"],
    toy: ["🧸", "🪀", "🪆", "🎨"],
    sports: ["⚽", "🏀", "🏈", "🎾"],
    sport: ["⚽", "🏀", "🏈", "🎾"],
    nature: ["🌳", "🌸", "☀️", "🌙"],
    weather: ["☀️", "🌧️", "❄️", "🌈"],
    space: ["🚀", "🌙", "⭐", "🪐"],
    ocean: ["🐠", "🐋", "🌊", "🐚"],
    colors: ["🔴", "🟢", "🔵", "🟡"],
    color: ["🔴", "🟢", "🔵", "🟡"],
    verbs: ["🏃", "💤", "🍽️", "📖"],
    nouns: ["📦", "🏠", "📚", "✏️"],
  };

  for (const [key, icons] of Object.entries(maps)) {
    if (lower.includes(key)) return icons;
  }
  return [];
}
