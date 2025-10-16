export type AvatarOption = {
  id: string;
  name: string;
  emoji: string;
  bg: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "bear", name: "Brave Bear", emoji: "🐻", bg: "bg-amber-100" },
  { id: "cat", name: "Clever Cat", emoji: "🐱", bg: "bg-pink-100" },
  { id: "dog", name: "Daring Dog", emoji: "🐶", bg: "bg-blue-100" },
  { id: "fox", name: "Swift Fox", emoji: "🦊", bg: "bg-orange-100" },
  { id: "owl", name: "Wise Owl", emoji: "🦉", bg: "bg-purple-100" },
  { id: "panda", name: "Playful Panda", emoji: "🐼", bg: "bg-emerald-100" },
];

export function getRandomAvatar(excludeId?: string): AvatarOption {
  const choices = excludeId
    ? AVATAR_OPTIONS.filter((option) => option.id !== excludeId)
    : AVATAR_OPTIONS;

  return choices[Math.floor(Math.random() * choices.length)]!;
}
