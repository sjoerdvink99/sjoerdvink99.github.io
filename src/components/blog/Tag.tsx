import type { ReactNode } from "react";
import type { Tone } from "./palette";

const TONES: Record<Tone, string> = {
  space: "text-ir-space-ink",
  rep: "text-ir-rep",
  transform: "text-ir-transform-ink",
  human: "text-ir-human",
  ink: "text-ir-ink-muted",
};

export function Tag({
  tone = "ink",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[0.7rem] font-medium uppercase tracking-[0.16em] ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
