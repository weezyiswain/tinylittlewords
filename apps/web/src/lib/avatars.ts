export type AvatarOption = {
  id: string;
  name: string;
  emoji: string;
  /** Card background when not selected (full card fill). */
  bg: string;
  /** Slightly darker card background when selected. */
  bgSelected: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "bear", name: "Brave Bear", emoji: "🐻", bg: "bg-amber-100", bgSelected: "bg-amber-200" },
  { id: "dog", name: "Daring Dog", emoji: "🐶", bg: "bg-blue-100", bgSelected: "bg-blue-200" },
  { id: "fox", name: "Swift Fox", emoji: "🦊", bg: "bg-orange-100", bgSelected: "bg-orange-200" },
  { id: "owl", name: "Wise Owl", emoji: "🦉", bg: "bg-purple-100", bgSelected: "bg-purple-200" },
  { id: "panda", name: "Playful Panda", emoji: "🐼", bg: "bg-emerald-100", bgSelected: "bg-emerald-200" },
  { id: "lovey-cat", name: "Lovey the Cat", emoji: "🐱", bg: "bg-pink-100", bgSelected: "bg-pink-200" },
];

export function getRandomAvatar(excludeId?: string): AvatarOption {
  const choices = excludeId
    ? AVATAR_OPTIONS.filter((option) => option.id !== excludeId)
    : AVATAR_OPTIONS;

  return choices[Math.floor(Math.random() * choices.length)]!;
}
