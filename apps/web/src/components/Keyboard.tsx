"use client";

import { Delete } from "lucide-react";

import { cn } from "@/lib/utils";

export type LetterStatus = "correct" | "present" | "absent";

const ROW1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const ROW2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const ROW3 = ["Z", "X", "C", "V", "B", "N", "M"];

/* iOS-like: square-ish keys, scale down on narrow screens */
const KEY_SIZE = "clamp(32px, 8vw, 48px)";
const KEY_GAP = "6px";
const KEY_RADIUS = "9px";

type KeyboardProps = {
  keyboardStatus: Record<string, LetterStatus>;
  onLetter: (letter: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled?: boolean;
};

function LetterKey({
  letter,
  status,
  onClick,
  disabled,
}: {
  letter: string;
  status?: LetterStatus;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: KEY_SIZE,
        height: KEY_SIZE,
        minWidth: KEY_SIZE,
        minHeight: KEY_SIZE,
        maxWidth: KEY_SIZE,
        maxHeight: KEY_SIZE,
        borderRadius: KEY_RADIUS,
      }}
      className={cn(
        "flex shrink-0 items-center justify-center border border-slate-200/80 font-semibold transition-transform duration-75 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed select-none touch-manipulation text-[clamp(14px,3vw,17px)]",
        !status &&
          "border-slate-200 bg-slate-100 text-slate-800 active:bg-slate-200",
        status === "correct" &&
          "border-emerald-500 bg-emerald-500 text-white",
        status === "present" &&
          "border-amber-400 bg-amber-400 text-white",
        status === "absent" &&
          "border-slate-400 bg-slate-500 text-white"
      )}
      aria-label={`Letter ${letter}`}
    >
      {letter}
    </button>
  );
}

function ActionKey({
  children,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: KEY_SIZE,
        minHeight: KEY_SIZE,
        minWidth: "56px",
        maxWidth: "90px",
        borderRadius: KEY_RADIUS,
      }}
      className={cn(
        "flex min-w-0 flex-1 items-center justify-center border border-slate-200/80 font-semibold transition-transform duration-75 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed select-none touch-manipulation text-[clamp(12px,2.8vw,15px)]",
        "border-slate-200 bg-slate-400 text-white active:bg-slate-500"
      )}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export function Keyboard({
  keyboardStatus,
  onLetter,
  onBackspace,
  onSubmit,
  disabled = false,
}: KeyboardProps) {
  return (
    <div
      className="box-border w-full min-w-0 overflow-x-hidden bg-transparent"
      style={{
        paddingLeft: "max(1.25rem, calc(env(safe-area-inset-left, 0px) + 1rem))",
        paddingRight: "max(1.25rem, calc(env(safe-area-inset-right, 0px) + 1rem))",
        paddingTop: "8px",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
    >
      <div
        className="mx-auto box-border flex w-full max-w-[min(460px,calc(100vw-3rem))] min-w-0 flex-col items-center justify-center"
        style={{ gap: KEY_GAP }}
      >
        {/* Row 1: QWERTYUIOP - 10 keys */}
        <div
          className="flex justify-center"
          style={{ gap: KEY_GAP }}
        >
          {ROW1.map((letter) => (
            <LetterKey
              key={letter}
              letter={letter}
              status={keyboardStatus[letter]}
              onClick={() => onLetter(letter)}
              disabled={disabled}
            />
          ))}
        </div>

        {/* Row 2: ASDFGHJKL - 9 keys with inset (iOS-style) */}
        <div
          className="flex w-full justify-center"
          style={{ gap: KEY_GAP, paddingLeft: "clamp(12px, 4vw, 24px)", paddingRight: "clamp(12px, 4vw, 24px)" }}
        >
          {ROW2.map((letter) => (
            <LetterKey
              key={letter}
              letter={letter}
              status={keyboardStatus[letter]}
              onClick={() => onLetter(letter)}
              disabled={disabled}
            />
          ))}
        </div>

        {/* Row 3: Enter + ZXCVBNM + Backspace (Enter/Backspace wider, same height) */}
        <div
          className="grid w-full min-w-0 items-center"
          style={{
            gap: KEY_GAP,
            gridTemplateColumns: "1.5fr repeat(7, minmax(0, 1fr)) 1.5fr",
          }}
        >
          <div className="flex items-center justify-start pr-0.5">
            <ActionKey
              onClick={onSubmit}
              disabled={disabled}
              aria-label="Submit guess"
            >
              Enter
            </ActionKey>
          </div>
          {ROW3.map((letter) => (
            <div key={letter} className="flex items-center justify-center">
              <LetterKey
                letter={letter}
                status={keyboardStatus[letter]}
                onClick={() => onLetter(letter)}
                disabled={disabled}
              />
            </div>
          ))}
          <div className="flex items-center justify-end pl-0.5">
            <ActionKey
              onClick={onBackspace}
              disabled={disabled}
              aria-label="Delete letter"
            >
              <Delete className="h-5 w-5" aria-hidden />
            </ActionKey>
          </div>
        </div>
      </div>
    </div>
  );
}
