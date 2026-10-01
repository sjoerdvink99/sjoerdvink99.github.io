"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { C } from "./palette";

export const SPRING = { type: "spring", stiffness: 90, damping: 18 } as const;
const EASE = { duration: 0.6, ease: [0.22, 1, 0.36, 1] } as const;
const DRAW_EASE = [0.65, 0, 0.35, 1] as const;
const INSTANT = { duration: 0 } as const;

export function useMotion() {
  const reduce = useReducedMotion();
  return {
    spring: (delay = 0) => (reduce ? INSTANT : { ...SPRING, delay }),
    ease: (delay = 0) => (reduce ? INSTANT : { ...EASE, delay }),
    draw: (delay = 0, duration = 0.7) =>
      reduce ? INSTANT : { duration, delay, ease: DRAW_EASE },
  };
}

export const fade = (show: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: show ? 1 : 0 },
  transition: { duration: 0.5, delay: show ? delay : 0 },
});

const MATH_FONT = "KaTeX_Math, 'Times New Roman', serif";
const MAIN_FONT = "KaTeX_Main, 'Times New Roman', serif";

const isLetter = (s: string) => /^[A-Za-zα-ωΑ-Ω]+$/.test(s);
const isVariable = (s: string) => isLetter(s) && [...s].length === 1;

export function Sym({
  x,
  y,
  children,
  sub,
  sup,
  hat = false,
  size = 16,
  fill = C.ink,
  anchor = "middle",
  upright = false,
}: {
  x: number;
  y: number;
  children: string;
  sub?: string;
  sup?: string;
  hat?: boolean;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  upright?: boolean;
}) {
  const italic = !upright && isLetter(children);
  const letter = size * 0.56 * children.length;
  const extra =
    (sub ? sub.length * size * 0.4 : 0) + (sup ? sup.length * size * 0.4 : 0);
  const left =
    anchor === "start"
      ? x
      : anchor === "middle"
        ? x - (letter + extra) / 2
        : x - letter - extra;
  const cx = left + letter / 2 + (italic ? size * 0.06 : 0);
  return (
    <g>
      <text
        x={x}
        y={y}
        fill={fill}
        fontSize={size}
        textAnchor={anchor}
        dominantBaseline="central"
        fontFamily={italic ? MATH_FONT : MAIN_FONT}
        fontStyle={italic ? "italic" : "normal"}
      >
        {children}
        {sub && (
          <tspan
            dy={size * 0.28}
            fontSize={size * 0.7}
            fontFamily={isVariable(sub) ? MATH_FONT : MAIN_FONT}
            fontStyle={isVariable(sub) ? "italic" : "normal"}
          >
            {sub}
          </tspan>
        )}
        {sup && (
          <tspan
            dy={sub ? -size * 0.7 : -size * 0.38}
            fontSize={size * 0.7}
            fontFamily={MAIN_FONT}
          >
            {sup}
          </tspan>
        )}
      </text>
      {hat && (
        <path
          d={`M ${cx - size * 0.2} ${y - size * 0.3} L ${cx} ${y - size * 0.46} L ${cx + size * 0.2} ${y - size * 0.3}`}
          fill="none"
          stroke={fill}
          strokeWidth={size * 0.065}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

export function MathText({
  x,
  y,
  children,
  size = 14,
  fill = C.ink,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: string;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
}) {
  const parts = children.match(/[A-Za-zα-ω]+|[^A-Za-zα-ω]+/g) ?? [];
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      textAnchor={anchor}
      dominantBaseline="central"
      fontFamily={MAIN_FONT}
    >
      {parts.map((p, i) =>
        isVariable(p) ? (
          <tspan key={i} fontFamily={MATH_FONT} fontStyle="italic">
            {p}
          </tspan>
        ) : (
          <tspan key={i}>{p}</tspan>
        ),
      )}
    </text>
  );
}

export function Label({
  x,
  y,
  children,
  size = 12,
  fill = C.muted,
  anchor = "middle",
  mono = false,
  weight,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  mono?: boolean;
  weight?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      dominantBaseline="central"
      className={mono ? "font-mono" : "tabular-nums"}
    >
      {children}
    </text>
  );
}

export function Figure({
  top,
  children,
  controls,
  label,
  viewBox,
  interactive = false,
}: {
  top?: ReactNode;
  children: ReactNode;
  controls?: ReactNode;
  label: string;
  viewBox: string;
  interactive?: boolean;
}) {
  return (
    <figure className="mx-auto w-full max-w-[36rem]">
      {top && <div className="mb-4">{top}</div>}
      <svg
        viewBox={viewBox}
        className="block w-full overflow-visible"
        role={interactive ? "group" : "img"}
        aria-label={label}
      >
        {children}
      </svg>
      {controls && (
        <div className="mt-3 flex min-h-9 items-center justify-center gap-4">
          {controls}
        </div>
      )}
    </figure>
  );
}

