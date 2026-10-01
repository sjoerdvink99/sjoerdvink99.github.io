"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { C } from "@/components/blog/palette";

export type Held = "stick" | "ball" | "bone";

export const SCENE_W = 240;
export const SCENE_H = 200;

const FUR = "#9ca3af";
const OBJECT = "#374151";

export const STICK = { x1: 170, y1: 103, x2: 232, y2: 85 };

function HeldObject({ kind }: { kind: Held }) {
  if (kind === "ball") return <circle cx={205} cy={97} r={10} fill={OBJECT} />;
  if (kind === "bone")
    return (
      <g fill={OBJECT}>
        <rect x={184} y={93} width={34} height={7} rx={3.5} />
        <circle cx={184} cy={93} r={5} />
        <circle cx={184} cy={101} r={5} />
        <circle cx={218} cy={93} r={5} />
        <circle cx={218} cy={101} r={5} />
      </g>
    );
  return (
    <g stroke={OBJECT} strokeLinecap="round" fill="none">
      <line {...STICK} strokeWidth={6} />
      <path d="M216 90 L224 78" strokeWidth={3.5} />
    </g>
  );
}

export function DogScene({
  held = "stick",
  framed = true,
  className = "",
  children,
  ...placement
}: {
  held?: Held;
  framed?: boolean;
  className?: string;
  children?: ReactNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      {...placement}
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      className={`block ${className}`}
      role="img"
      aria-label={`A dog holding a ${held}`}
    >
      {framed && (
        <rect
          x={0.5}
          y={0.5}
          width={SCENE_W - 1}
          height={SCENE_H - 1}
          rx={10}
          fill="#f9fafb"
          stroke={C.faint}
        />
      )}
      <g stroke={C.faint} strokeWidth={1.5} strokeLinecap="round" fill="none">
        <line x1={16} x2={224} y1={172} y2={172} />
        <path d="M34 172 l-3 -7 M38 172 l1 -8 M196 172 l-2 -7 M200 172 l2 -8 M112 172 l-2 -6 M116 172 l2 -7" />
      </g>
      <g fill={FUR} stroke={FUR} strokeLinecap="round">
        <path d="M58 108 Q38 96 42 72" fill="none" strokeWidth={6} />
        <line x1={76} y1={128} x2={72} y2={169} strokeWidth={8} />
        <line x1={92} y1={132} x2={94} y2={169} strokeWidth={8} />
        <line x1={124} y1={132} x2={122} y2={169} strokeWidth={8} />
        <line x1={140} y1={126} x2={146} y2={169} strokeWidth={8} />
        <ellipse cx={106} cy={114} rx={52} ry={24} stroke="none" />
        <line x1={138} y1={108} x2={160} y2={86} strokeWidth={24} />
        <circle cx={166} cy={80} r={21} stroke="none" />
        <ellipse cx={188} cy={90} rx={15} ry={9} stroke="none" />
        <ellipse
          cx={154}
          cy={78}
          rx={7}
          ry={15}
          transform="rotate(18 154 78)"
          stroke="none"
          fill="#6b7280"
        />
      </g>
      <circle cx={172} cy={75} r={2.6} fill={C.ink} />
      <circle cx={201} cy={87} r={3} fill={C.ink} />
      <AnimatePresence initial={false}>
        <motion.g
          key={held}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.45 }}
          style={{ transformOrigin: "200px 95px" }}
        >
          <HeldObject kind={held} />
        </motion.g>
      </AnimatePresence>
      {children}
    </svg>
  );
}
