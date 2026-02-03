"use client";

import { Delete } from "lucide-react";

import { cn } from "@/lib/utils";

export type LetterStatus = "correct" | "present" | "absent";

const ROW1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const ROW2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const ROW3 = ["Z", "X", "C", "V", "B", "N", "M"];

/* iOS-style rounded rectangles, subtle radius */
const KEY_SIZE = "clamp(34px, 8vw, 50px)";
const KEY_GAP = "5px";
const KEY_RADIUS = "6px";

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
        "flex shrink-0 items-center justify-center border font-semibold transition-transform duration-75 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed select-none touch-manipulation text-[clamp(14px,3vw,17px)]",
        !status &&
          "border-slate-300/80 bg-slate-100 text-slate-800 active:bg-slate-200",
        status === "correct" &&
          "border-emerald-500/90 bg-emerald-500 text-white",
        status === "present" &&
          "border-amber-400/90 bg-amber-400 text-white",
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
        minWidth: "52px",
        maxWidth: "88px",
        borderRadius: KEY_RADIUS,
      }}
      className={cn(
        "flex min-w-0 flex-1 items-center justify-center border border-slate-300/80 bg-slate-400 font-semibold text-white transition-transform duration-75 active:scale-[0.97] active:bg-slate-500 disabled:opacity-70 disabled:cursor-not-allowed select-none touch-manipulation text-[clamp(12px,2.8vw,15px)]"
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
        paddingBottom: "max(12px, var(--safe-bottom, 0px))",
      }}
    >
      <div
        className="mx-auto box-border flex w-full max-w-[min(480px,calc(100vw-2.5rem))] min-w-0 flex-col items-center justify-center"
        style={{ gap: KEY_GAP }}
      >
        {/* Row 1: QWERTYUIOP */}
        <div className="flex justify-center" style={{ gap: KEY_GAP }}>
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

        {/* Row 2: ASDFGHJKL */}
        <div
          className="flex w-full justify-center"
          style={{
            gap: KEY_GAP,
            paddingLeft: "clamp(14px, 4vw, 28px)",
            paddingRight: "clamp(14px, 4vw, 28px)",
          }}
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

        {/* Row 3: Enter + ZXCVBNM + Backspace */}
        <div
          className="grid w-full min-w-0 items-center"
          style={{
            gap: KEY_GAP,
            gridTemplateColumns: "1.5fr repeat(7, minmax(0, 1fr)) 1.5fr",
          }}
        >
          <div className="flex justify-start pr-0.5">
            <ActionKey
              onClick={onSubmit}
              disabled={disabled}
              aria-label="Submit guess"
            >
              Enter
            </ActionKey>
          </div>
          {ROW3.map((letter) => (
            <div key={letter} className="flex justify-center">
              <LetterKey
                letter={letter}
                status={keyboardStatus[letter]}
                onClick={() => onLetter(letter)}
                disabled={disabled}
              />
            </div>
          ))}
          <div className="flex justify-end pl-0.5">
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
