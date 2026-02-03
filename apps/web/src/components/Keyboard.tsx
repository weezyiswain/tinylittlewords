"use client";

import { Delete } from "lucide-react";

import { cn } from "@/lib/utils";

export type LetterStatus = "correct" | "present" | "absent";

const ROW1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const ROW2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const ROW3 = ["Z", "X", "C", "V", "B", "N", "M"];

type KeyboardProps = {
  keyboardStatus: Record<string, LetterStatus>;
  onLetter: (letter: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const keyBase =
  "flex min-h-[44px] min-w-0 items-center justify-center rounded-lg border-0 font-medium transition-[transform,box-shadow] duration-75 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed select-none touch-manipulation";
const keyHeight = "h-[clamp(44px,7vh,56px)]";
const keyFont = "text-[clamp(14px,3.2vw,18px)]";

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
      className={cn(
        keyBase,
        keyHeight,
        keyFont,
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
  className,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        keyBase,
        keyHeight,
        keyFont,
        "bg-[#9ca3af] text-white shadow-[0_2px_0_0_rgba(0,0,0,0.2)] active:bg-[#8b92a0]",
        className
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
        paddingTop: "12px",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
    >
      <div className="mx-auto w-full max-w-[560px] px-4 sm:px-5">
        <div className="grid grid-cols-1 gap-2">
          {/* Row 1: QWERTYUIOP - 10 columns */}
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "repeat(10, 1fr)" }}
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

          {/* Row 2: ASDFGHJKL - 9 keys centered with side gutters */}
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: "minmax(0,0.5fr) repeat(9, 1fr) minmax(0,0.5fr)",
            }}
          >
            <div aria-hidden />
            {ROW2.map((letter) => (
              <LetterKey
                key={letter}
                letter={letter}
                status={keyboardStatus[letter]}
                onClick={() => onLetter(letter)}
                disabled={disabled}
              />
            ))}
            <div aria-hidden />
          </div>

          {/* Row 3: Enter + ZXCVBNM + Backspace */}
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: "1.5fr repeat(7, 1fr) 1.5fr",
            }}
          >
            <ActionKey
              onClick={onSubmit}
              disabled={disabled}
              aria-label="Submit guess"
            >
              Enter
            </ActionKey>
            {ROW3.map((letter) => (
              <LetterKey
                key={letter}
                letter={letter}
                status={keyboardStatus[letter]}
                onClick={() => onLetter(letter)}
                disabled={disabled}
              />
            ))}
            <ActionKey
              onClick={onBackspace}
              disabled={disabled}
              aria-label="Delete letter"
            >
              <Delete className="h-6 w-6" aria-hidden />
            </ActionKey>
          </div>
        </div>
      </div>
    </div>
  );
}
