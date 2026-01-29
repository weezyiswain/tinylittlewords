export type BuddyTheme = {
  /** Subtle full-bleed base gradient; use with absolute inset-0. */
  bgBase: string;
  blurLeft: string;
  blurRight: string;
  blurCenter: string;
  loadingCard: string;
  cardShadow: string;
  cardShadowAlt: string;
  wordLengthBase: string;
  wordLengthHover: string;
  wordLengthSelected: string;
  buddySelected: string;
  buddySelectedBorder: string;
  buddyUnselected: string;
  ctaGradient: string;
  ctaShadow: string;
  ctaShadowHover: string;
  backButton: string;
  statusCard: string;
  statusCardFlip: string;
  enterKey: string;
  enterKeyHover: string;
  keyBase: string;
  sheetShadow: string;
  resultModal: string;
  hintHighlight: string;
  bottomBarShadow: string;
  hintSection: string;
  hintSectionHighlight: string;
  revealButton: string;
  revealButtonHighlight: string;
  hintHeadingHighlight: string;
};

const bear: BuddyTheme = {
  bgBase:
    "bg-[linear-gradient(160deg,#fffbeb_0%,#fef9c3_40%,#ffedd5_70%,#ffffff_100%)]",
  blurLeft: "bg-gradient-to-br from-amber-200/60 via-amber-100/40 to-transparent",
  blurRight: "bg-gradient-to-br from-orange-200/55 via-orange-100/35 to-transparent",
  blurCenter: "bg-gradient-to-br from-amber-200/40 via-amber-100/25 to-transparent",
  loadingCard:
    "from-white/95 via-amber-50/80 to-orange-50/80 shadow-[0_25px_60px_rgba(251,191,36,0.2)]",
  cardShadow: "shadow-[0_18px_45px_rgba(251,191,36,0.15)]",
  cardShadowAlt: "shadow-[0_18px_45px_rgba(249,115,22,0.15)]",
  wordLengthBase: "shadow-[0_12px_28px_rgba(251,191,36,0.12)]",
  wordLengthHover: "hover:shadow-[0_16px_36px_rgba(251,191,36,0.2)]",
  wordLengthSelected:
    "border-amber-400 bg-amber-500/10 shadow-[0_10px_24px_rgba(251,191,36,0.2)]",
  buddySelected: "border-amber-400 bg-amber-500/10 shadow-[0_10px_24px_rgba(251,191,36,0.2)]",
  buddySelectedBorder: "border-amber-400",
  buddyUnselected: "border-transparent bg-white/85 hover:border-amber-400/30 hover:bg-amber-500/5",
  ctaGradient: "from-amber-500 via-amber-400 to-orange-400",
  ctaShadow: "shadow-[0_18px_45px_rgba(251,191,36,0.4)]",
  ctaShadowHover: "hover:shadow-[0_20px_55px_rgba(251,191,36,0.5)]",
  backButton: "shadow-[0_10px_20px_rgba(251,191,36,0.15)]",
  statusCard: "shadow-[0_18px_45px_rgba(251,191,36,0.2)]",
  statusCardFlip:
    "border-amber-300 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/80 shadow-[0_0_40px_rgba(251,191,36,0.35)]",
  enterKey:
    "bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 shadow-[0_18px_45px_rgba(251,191,36,0.4)]",
  enterKeyHover: "hover:shadow-[0_20px_55px_rgba(251,191,36,0.5)]",
  keyBase: "shadow-[0_10px_22px_rgba(251,191,36,0.15)]",
  sheetShadow: "shadow-[0_-20px_45px_rgba(251,191,36,0.15)]",
  resultModal: "shadow-[0_22px_55px_rgba(251,191,36,0.2)]",
  hintHighlight:
    "border-amber-400 text-amber-700 shadow-[0_16px_28px_rgba(251,191,36,0.3)]",
  bottomBarShadow: "shadow-[0_-15px_40px_rgba(251,191,36,0.18)]",
  hintSection: "shadow-[0_15px_35px_rgba(251,191,36,0.15)]",
  hintSectionHighlight:
    "border-amber-300 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/80 shadow-[0_0_40px_rgba(251,191,36,0.35)]",
  revealButton:
    "bg-gradient-to-r from-amber-200/70 via-amber-100/60 to-orange-200/70 shadow-[0_10px_22px_rgba(251,191,36,0.2)] hover:shadow-[0_12px_30px_rgba(251,191,36,0.3)]",
  revealButtonHighlight: "border-amber-400 bg-amber-100 text-amber-700",
  hintHeadingHighlight: "text-amber-700",
};

const dog: BuddyTheme = {
  bgBase:
    "bg-[linear-gradient(160deg,#f0f9ff_0%,#e0f2fe_40%,#e0e7ff_70%,#ffffff_100%)]",
  blurLeft: "bg-gradient-to-br from-blue-200/60 via-blue-100/40 to-transparent",
  blurRight: "bg-gradient-to-br from-sky-200/55 via-sky-100/35 to-transparent",
  blurCenter: "bg-gradient-to-br from-indigo-200/40 via-indigo-100/25 to-transparent",
  loadingCard:
    "from-white/95 via-blue-50/80 to-sky-50/80 shadow-[0_25px_60px_rgba(59,130,246,0.2)]",
  cardShadow: "shadow-[0_18px_45px_rgba(59,130,246,0.15)]",
  cardShadowAlt: "shadow-[0_18px_45px_rgba(14,165,233,0.15)]",
  wordLengthBase: "shadow-[0_12px_28px_rgba(59,130,246,0.12)]",
  wordLengthHover: "hover:shadow-[0_16px_36px_rgba(59,130,246,0.2)]",
  wordLengthSelected:
    "border-blue-400 bg-blue-500/10 shadow-[0_10px_24px_rgba(59,130,246,0.2)]",
  buddySelected: "border-blue-400 bg-blue-500/10 shadow-[0_10px_24px_rgba(59,130,246,0.2)]",
  buddySelectedBorder: "border-blue-400",
  buddyUnselected: "border-transparent bg-white/85 hover:border-blue-400/30 hover:bg-blue-500/5",
  ctaGradient: "from-blue-500 via-blue-400 to-sky-400",
  ctaShadow: "shadow-[0_18px_45px_rgba(59,130,246,0.4)]",
  ctaShadowHover: "hover:shadow-[0_20px_55px_rgba(59,130,246,0.5)]",
  backButton: "shadow-[0_10px_20px_rgba(59,130,246,0.15)]",
  statusCard: "shadow-[0_18px_45px_rgba(59,130,246,0.2)]",
  statusCardFlip:
    "border-blue-300 bg-gradient-to-br from-blue-50/95 via-white to-sky-50/80 shadow-[0_0_40px_rgba(59,130,246,0.35)]",
  enterKey:
    "bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400 shadow-[0_18px_45px_rgba(59,130,246,0.4)]",
  enterKeyHover: "hover:shadow-[0_20px_55px_rgba(59,130,246,0.5)]",
  keyBase: "shadow-[0_10px_22px_rgba(59,130,246,0.15)]",
  sheetShadow: "shadow-[0_-20px_45px_rgba(59,130,246,0.15)]",
  resultModal: "shadow-[0_22px_55px_rgba(59,130,246,0.2)]",
  hintHighlight:
    "border-blue-400 text-blue-700 shadow-[0_16px_28px_rgba(59,130,246,0.3)]",
  bottomBarShadow: "shadow-[0_-15px_40px_rgba(59,130,246,0.18)]",
  hintSection: "shadow-[0_15px_35px_rgba(59,130,246,0.15)]",
  hintSectionHighlight:
    "border-blue-300 bg-gradient-to-br from-blue-50/95 via-white to-sky-50/80 shadow-[0_0_40px_rgba(59,130,246,0.35)]",
  revealButton:
    "bg-gradient-to-r from-blue-200/70 via-blue-100/60 to-sky-200/70 shadow-[0_10px_22px_rgba(59,130,246,0.2)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.3)]",
  revealButtonHighlight: "border-blue-400 bg-blue-100 text-blue-700",
  hintHeadingHighlight: "text-blue-700",
};

const fox: BuddyTheme = {
  bgBase:
    "bg-[linear-gradient(130deg,#fff7ed_0%,#ffedd5_45%,#fef3c7_100%)]",
  blurLeft: "bg-gradient-to-br from-orange-200/60 via-orange-100/40 to-transparent",
  blurRight: "bg-gradient-to-br from-amber-200/55 via-amber-100/35 to-transparent",
  blurCenter: "bg-gradient-to-br from-red-200/40 via-red-100/25 to-transparent",
  loadingCard:
    "from-white/95 via-orange-50/80 to-amber-50/80 shadow-[0_25px_60px_rgba(249,115,22,0.2)]",
  cardShadow: "shadow-[0_18px_45px_rgba(249,115,22,0.15)]",
  cardShadowAlt: "shadow-[0_18px_45px_rgba(245,158,11,0.15)]",
  wordLengthBase: "shadow-[0_12px_28px_rgba(249,115,22,0.12)]",
  wordLengthHover: "hover:shadow-[0_16px_36px_rgba(249,115,22,0.2)]",
  wordLengthSelected:
    "border-orange-400 bg-orange-500/10 shadow-[0_10px_24px_rgba(249,115,22,0.2)]",
  buddySelected: "border-orange-400 bg-orange-500/10 shadow-[0_10px_24px_rgba(249,115,22,0.2)]",
  buddySelectedBorder: "border-orange-400",
  buddyUnselected:
    "border-transparent bg-white/85 hover:border-orange-400/30 hover:bg-orange-500/5",
  ctaGradient: "from-orange-500 via-orange-400 to-amber-400",
  ctaShadow: "shadow-[0_18px_45px_rgba(249,115,22,0.4)]",
  ctaShadowHover: "hover:shadow-[0_20px_55px_rgba(249,115,22,0.5)]",
  backButton: "shadow-[0_10px_20px_rgba(249,115,22,0.15)]",
  statusCard: "shadow-[0_18px_45px_rgba(249,115,22,0.2)]",
  statusCardFlip:
    "border-orange-300 bg-gradient-to-br from-orange-50/95 via-white to-amber-50/80 shadow-[0_0_40px_rgba(249,115,22,0.35)]",
  enterKey:
    "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 shadow-[0_18px_45px_rgba(249,115,22,0.4)]",
  enterKeyHover: "hover:shadow-[0_20px_55px_rgba(249,115,22,0.5)]",
  keyBase: "shadow-[0_10px_22px_rgba(249,115,22,0.15)]",
  sheetShadow: "shadow-[0_-20px_45px_rgba(249,115,22,0.15)]",
  resultModal: "shadow-[0_22px_55px_rgba(249,115,22,0.2)]",
  hintHighlight:
    "border-orange-400 text-orange-700 shadow-[0_16px_28px_rgba(249,115,22,0.3)]",
  bottomBarShadow: "shadow-[0_-15px_40px_rgba(249,115,22,0.18)]",
  hintSection: "shadow-[0_15px_35px_rgba(249,115,22,0.15)]",
  hintSectionHighlight:
    "border-orange-300 bg-gradient-to-br from-orange-50/95 via-white to-amber-50/80 shadow-[0_0_40px_rgba(249,115,22,0.35)]",
  revealButton:
    "bg-gradient-to-r from-orange-200/70 via-orange-100/60 to-amber-200/70 shadow-[0_10px_22px_rgba(249,115,22,0.2)] hover:shadow-[0_12px_30px_rgba(249,115,22,0.3)]",
  revealButtonHighlight: "border-orange-400 bg-orange-100 text-orange-700",
  hintHeadingHighlight: "text-orange-700",
};

const owl: BuddyTheme = {
  bgBase:
    "bg-[linear-gradient(160deg,#faf5ff_0%,#ede9fe_40%,#fae8ff_70%,#ffffff_100%)]",
  blurLeft: "bg-gradient-to-br from-purple-200/60 via-purple-100/40 to-transparent",
  blurRight: "bg-gradient-to-br from-violet-200/55 via-violet-100/35 to-transparent",
  blurCenter: "bg-gradient-to-br from-fuchsia-200/40 via-fuchsia-100/25 to-transparent",
  loadingCard:
    "from-white/95 via-purple-50/80 to-violet-50/80 shadow-[0_25px_60px_rgba(168,85,247,0.2)]",
  cardShadow: "shadow-[0_18px_45px_rgba(168,85,247,0.15)]",
  cardShadowAlt: "shadow-[0_18px_45px_rgba(139,92,246,0.15)]",
  wordLengthBase: "shadow-[0_12px_28px_rgba(168,85,247,0.12)]",
  wordLengthHover: "hover:shadow-[0_16px_36px_rgba(168,85,247,0.2)]",
  wordLengthSelected:
    "border-purple-400 bg-purple-500/10 shadow-[0_10px_24px_rgba(168,85,247,0.2)]",
  buddySelected: "border-purple-400 bg-purple-500/10 shadow-[0_10px_24px_rgba(168,85,247,0.2)]",
  buddySelectedBorder: "border-purple-400",
  buddyUnselected:
    "border-transparent bg-white/85 hover:border-purple-400/30 hover:bg-purple-500/5",
  ctaGradient: "from-purple-500 via-purple-400 to-violet-400",
  ctaShadow: "shadow-[0_18px_45px_rgba(168,85,247,0.4)]",
  ctaShadowHover: "hover:shadow-[0_20px_55px_rgba(168,85,247,0.5)]",
  backButton: "shadow-[0_10px_20px_rgba(168,85,247,0.15)]",
  statusCard: "shadow-[0_18px_45px_rgba(168,85,247,0.2)]",
  statusCardFlip:
    "border-purple-300 bg-gradient-to-br from-purple-50/95 via-white to-violet-50/80 shadow-[0_0_40px_rgba(168,85,247,0.35)]",
  enterKey:
    "bg-gradient-to-r from-purple-500 via-purple-400 to-violet-400 shadow-[0_18px_45px_rgba(168,85,247,0.4)]",
  enterKeyHover: "hover:shadow-[0_20px_55px_rgba(168,85,247,0.5)]",
  keyBase: "shadow-[0_10px_22px_rgba(168,85,247,0.15)]",
  sheetShadow: "shadow-[0_-20px_45px_rgba(168,85,247,0.15)]",
  resultModal: "shadow-[0_22px_55px_rgba(168,85,247,0.2)]",
  hintHighlight:
    "border-purple-400 text-purple-700 shadow-[0_16px_28px_rgba(168,85,247,0.3)]",
  bottomBarShadow: "shadow-[0_-15px_40px_rgba(168,85,247,0.18)]",
  hintSection: "shadow-[0_15px_35px_rgba(168,85,247,0.15)]",
  hintSectionHighlight:
    "border-purple-300 bg-gradient-to-br from-purple-50/95 via-white to-violet-50/80 shadow-[0_0_40px_rgba(168,85,247,0.35)]",
  revealButton:
    "bg-gradient-to-r from-purple-200/70 via-purple-100/60 to-violet-200/70 shadow-[0_10px_22px_rgba(168,85,247,0.2)] hover:shadow-[0_12px_30px_rgba(168,85,247,0.3)]",
  revealButtonHighlight: "border-purple-400 bg-purple-100 text-purple-700",
  hintHeadingHighlight: "text-purple-700",
};

const panda: BuddyTheme = {
  bgBase:
    "bg-[linear-gradient(160deg,#f0fdf4_0%,#ecfdf5_40%,#ffffff_100%)]",
  blurLeft: "bg-gradient-to-br from-emerald-200/60 via-emerald-100/40 to-transparent",
  blurRight: "bg-gradient-to-br from-teal-200/55 via-teal-100/35 to-transparent",
  blurCenter: "bg-gradient-to-br from-green-200/40 via-green-100/25 to-transparent",
  loadingCard:
    "from-white/95 via-emerald-50/80 to-teal-50/80 shadow-[0_25px_60px_rgba(16,185,129,0.2)]",
  cardShadow: "shadow-[0_18px_45px_rgba(16,185,129,0.15)]",
  cardShadowAlt: "shadow-[0_18px_45px_rgba(20,184,166,0.15)]",
  wordLengthBase: "shadow-[0_12px_28px_rgba(16,185,129,0.12)]",
  wordLengthHover: "hover:shadow-[0_16px_36px_rgba(16,185,129,0.2)]",
  wordLengthSelected:
    "border-emerald-400 bg-emerald-500/10 shadow-[0_10px_24px_rgba(16,185,129,0.2)]",
  buddySelected:
    "border-emerald-400 bg-emerald-500/10 shadow-[0_10px_24px_rgba(16,185,129,0.2)]",
  buddySelectedBorder: "border-emerald-400",
  buddyUnselected:
    "border-transparent bg-white/85 hover:border-emerald-400/30 hover:bg-emerald-500/5",
  ctaGradient: "from-emerald-500 via-emerald-400 to-teal-400",
  ctaShadow: "shadow-[0_18px_45px_rgba(16,185,129,0.4)]",
  ctaShadowHover: "hover:shadow-[0_20px_55px_rgba(16,185,129,0.5)]",
  backButton: "shadow-[0_10px_20px_rgba(16,185,129,0.15)]",
  statusCard: "shadow-[0_18px_45px_rgba(16,185,129,0.2)]",
  statusCardFlip:
    "border-emerald-300 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/80 shadow-[0_0_40px_rgba(16,185,129,0.35)]",
  enterKey:
    "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 shadow-[0_18px_45px_rgba(16,185,129,0.4)]",
  enterKeyHover: "hover:shadow-[0_20px_55px_rgba(16,185,129,0.5)]",
  keyBase: "shadow-[0_10px_22px_rgba(16,185,129,0.15)]",
  sheetShadow: "shadow-[0_-20px_45px_rgba(16,185,129,0.15)]",
  resultModal: "shadow-[0_22px_55px_rgba(16,185,129,0.2)]",
  hintHighlight:
    "border-emerald-400 text-emerald-700 shadow-[0_16px_28px_rgba(16,185,129,0.3)]",
  bottomBarShadow: "shadow-[0_-15px_40px_rgba(16,185,129,0.18)]",
  hintSection: "shadow-[0_15px_35px_rgba(16,185,129,0.15)]",
  hintSectionHighlight:
    "border-emerald-300 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/80 shadow-[0_0_40px_rgba(16,185,129,0.35)]",
  revealButton:
    "bg-gradient-to-r from-emerald-200/70 via-emerald-100/60 to-teal-200/70 shadow-[0_10px_22px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.3)]",
  revealButtonHighlight: "border-emerald-400 bg-emerald-100 text-emerald-700",
  hintHeadingHighlight: "text-emerald-700",
};

const loveyCat: BuddyTheme = {
  bgBase:
    "bg-[linear-gradient(160deg,#fdf2f8_0%,#ffe4e6_40%,#fce7f3_70%,#ffffff_100%)]",
  blurLeft: "bg-gradient-to-br from-pink-200/60 via-pink-100/40 to-transparent",
  blurRight: "bg-gradient-to-br from-rose-200/55 via-rose-100/35 to-transparent",
  blurCenter: "bg-gradient-to-br from-fuchsia-200/40 via-fuchsia-100/25 to-transparent",
  loadingCard:
    "from-white/95 via-pink-50/80 to-rose-50/80 shadow-[0_25px_60px_rgba(236,72,153,0.2)]",
  cardShadow: "shadow-[0_18px_45px_rgba(236,72,153,0.15)]",
  cardShadowAlt: "shadow-[0_18px_45px_rgba(244,63,94,0.15)]",
  wordLengthBase: "shadow-[0_12px_28px_rgba(236,72,153,0.12)]",
  wordLengthHover: "hover:shadow-[0_16px_36px_rgba(236,72,153,0.2)]",
  wordLengthSelected:
    "border-pink-400 bg-pink-500/10 shadow-[0_10px_24px_rgba(236,72,153,0.2)]",
  buddySelected: "border-pink-400 bg-pink-500/10 shadow-[0_10px_24px_rgba(236,72,153,0.2)]",
  buddySelectedBorder: "border-pink-400",
  buddyUnselected:
    "border-transparent bg-white/85 hover:border-pink-400/30 hover:bg-pink-500/5",
  ctaGradient: "from-pink-500 via-pink-400 to-rose-400",
  ctaShadow: "shadow-[0_18px_45px_rgba(236,72,153,0.4)]",
  ctaShadowHover: "hover:shadow-[0_20px_55px_rgba(236,72,153,0.5)]",
  backButton: "shadow-[0_10px_20px_rgba(236,72,153,0.15)]",
  statusCard: "shadow-[0_18px_45px_rgba(236,72,153,0.2)]",
  statusCardFlip:
    "border-pink-300 bg-gradient-to-br from-pink-50/95 via-white to-rose-50/80 shadow-[0_0_40px_rgba(236,72,153,0.35)]",
  enterKey:
    "bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 shadow-[0_18px_45px_rgba(236,72,153,0.4)]",
  enterKeyHover: "hover:shadow-[0_20px_55px_rgba(236,72,153,0.5)]",
  keyBase: "shadow-[0_10px_22px_rgba(236,72,153,0.15)]",
  sheetShadow: "shadow-[0_-20px_45px_rgba(236,72,153,0.15)]",
  resultModal: "shadow-[0_22px_55px_rgba(236,72,153,0.2)]",
  hintHighlight:
    "border-pink-400 text-pink-700 shadow-[0_16px_28px_rgba(236,72,153,0.3)]",
  bottomBarShadow: "shadow-[0_-15px_40px_rgba(236,72,153,0.18)]",
  hintSection: "shadow-[0_15px_35px_rgba(236,72,153,0.15)]",
  hintSectionHighlight:
    "border-pink-300 bg-gradient-to-br from-pink-50/95 via-white to-rose-50/80 shadow-[0_0_40px_rgba(236,72,153,0.35)]",
  revealButton:
    "bg-gradient-to-r from-pink-200/70 via-pink-100/60 to-rose-200/70 shadow-[0_10px_22px_rgba(236,72,153,0.2)] hover:shadow-[0_12px_30px_rgba(236,72,153,0.3)]",
  revealButtonHighlight: "border-pink-400 bg-pink-100 text-pink-700",
  hintHeadingHighlight: "text-pink-700",
};

const THEMES: Record<string, BuddyTheme> = {
  bear,
  dog,
  fox,
  owl,
  panda,
  "lovey-cat": loveyCat,
};

export function getBuddyTheme(avatarId: string): BuddyTheme {
  return THEMES[avatarId] ?? bear;
}
