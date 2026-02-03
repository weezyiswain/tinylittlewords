"use client";

import { Delete } from "lucide-react";

import { cn } from "@/lib/utils";

export type LetterStatus = "correct" | "present" | "absent";

const ROW1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const ROW2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const ROW3 = ["Z", "X", "C", "V", "B", "N", "M"];

/* iOS-like keyboard: keyHeight 48px (clamp 44–52), keyRadius 14–16px, keyGap 6–8px */
const KEY_SIZE = "clamp(40px, 8.5vw, 48px)";
const KEY_GAP = "6px";
const KEY_RADIUS = "14px";

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
        "flex shrink-0 items-center justify-center border-0 font-medium transition-[transform,box-shadow] duration-75 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed select-none touch-manipulation text-[clamp(14px,3vw,17px)]",
        !status &&
          "bg-[#d1d5db] text-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.8)_inset,0_2px_0_0_rgba(0,0,0,0.1)] active:bg-[#c4c8cc]",
        status === "correct" &&
          "bg-emerald-500 text-white shadow-[0_2px_0_0_rgba(0,0,0,0.2)]",
        status === "present" &&
          "bg-amber-400 text-white shadow-[0_2px_0_0_rgba(0,0,0,0.2)]",
        status === "absent" &&
          "bg-slate-400 text-white shadow-[0_2px_0_0_rgba(0,0,0,0.2)]"
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
        "flex min-w-0 flex-1 items-center justify-center border-0 font-medium transition-[transform,box-shadow] duration-75 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed select-none touch-manipulation text-[clamp(12px,2.8vw,15px)]",
        "bg-[#9ca3af] text-white shadow-[0_2px_0_0_rgba(0,0,0,0.2)] active:bg-[#8b92a0]"
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
      className="w-full bg-transparent"
      style={{
        paddingLeft: "max(1rem, env(safe-area-inset-left, 0px))",
        paddingRight: "max(1rem, env(safe-area-inset-right, 0px))",
        paddingTop: "8px",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
    >
      <div
        className="mx-auto flex w-full max-w-[540px] flex-col items-center"
        style={{ gap: KEY_GAP, paddingLeft: "12px", paddingRight: "12px" }}
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
          className="flex justify-center"
          style={{ gap: KEY_GAP, paddingLeft: "24px", paddingRight: "24px" }}
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
          className="grid w-full max-w-[540px] items-center"
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
