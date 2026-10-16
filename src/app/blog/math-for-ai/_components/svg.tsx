"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useId, useMemo, type ReactNode } from "react";
import { C } from "@/components/blog/palette";
import { fmt, range, type Point, type Vec } from "./model";

export const K = {
  ink: C.ink,
  muted: C.muted,
  faint: C.faint,
  grid: "#eef0f3",
  axis: "#c4c9d1",
  warp: "#cbd5e1",
  a: C.rep,
  aSoft: C.repSoft,
  b: C.human,
  bSoft: C.humanSoft,
  out: C.transform,
  outInk: C.transformInk,
  outSoft: C.transformSoft,
  slate: C.spaceInk,
  green: "#059669",
  greenSoft: "#d1fae5",
};

const TWEEN = { duration: 0.8, ease: [0.22, 1, 0.36, 1] } as const;
const INSTANT = { duration: 0 } as const;

export function useTween(duration: number = TWEEN.duration) {
  const reduce = useReducedMotion();
  return useMemo(() => (reduce ? INSTANT : { ...TWEEN, duration }), [reduce, duration]);
}

export function useTweened(target: Vec) {
  const transition = useTween();
  const key = target.join(" ");
  const value = useMotionValue<number[]>([...target]);
  useEffect(() => {
    const from = value.get();
    const to = key.split(" ").map(Number);
    const controls = animate(0, 1, {
      ...transition,
      onUpdate: (t) => value.set(to.map((v, i) => from[i] + (v - from[i]) * t)),
    });
    return () => controls.stop();
  }, [key, transition, value]);
  return value;
}

export interface Plane {
  x: [number, number];
  y: [number, number];
  left: number;
  top: number;
  width: number;
  height: number;
  px: (v: number) => number;
  py: (v: number) => number;
  at: (p: Vec) => Point;
}

export function plane({
  x,
  y,
  unit,
  left = 0,
  top = 0,
}: {
  x: [number, number];
  y: [number, number];
  unit: number | [number, number];
  left?: number;
  top?: number;
}): Plane {
  const [ux, uy] = typeof unit === "number" ? [unit, unit] : unit;
  const px = (v: number) => left + (v - x[0]) * ux;
  const py = (v: number) => top + (y[1] - v) * uy;
  return {
    x,
    y,
    left,
    top,
    width: (x[1] - x[0]) * ux,
    height: (y[1] - y[0]) * uy,
    px,
    py,
    at: (p) => [px(p[0]), py(p[1])],
  };
}

export function Grid({ plane: P }: { plane: Plane }) {
  const xs = range(Math.ceil(P.x[0]), Math.floor(P.x[1]));
  const ys = range(Math.ceil(P.y[0]), Math.floor(P.y[1]));
  return (
    <g>
      <rect x={P.left} y={P.top} width={P.width} height={P.height} rx={6} fill="#fff" stroke={K.faint} />
      <g stroke={K.grid}>
        {xs.map((v) => (
          <line key={`x${v}`} x1={P.px(v)} x2={P.px(v)} y1={P.top} y2={P.top + P.height} />
        ))}
        {ys.map((v) => (
          <line key={`y${v}`} y1={P.py(v)} y2={P.py(v)} x1={P.left} x2={P.left + P.width} />
        ))}
      </g>
      <g stroke={K.axis}>
        <line x1={P.left} x2={P.left + P.width} y1={P.py(0)} y2={P.py(0)} />
        <line x1={P.px(0)} x2={P.px(0)} y1={P.top} y2={P.top + P.height} />
      </g>
    </g>
  );
}

export function Clip({ plane: P, children }: { plane: Plane; children: ReactNode }) {
  const id = `clip${useId().replace(/[^\w-]/g, "")}`;
  return (
    <>
      <clipPath id={id}>
        <rect x={P.left} y={P.top} width={P.width} height={P.height} rx={6} />
      </clipPath>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
}

export function arrowPath([x1, y1, x2, y2]: Vec, head = 8) {
  const line = `M ${x1} ${y1} L ${x2} ${y2}`;
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (head === 0 || length < 1) return line;
  const h = Math.min(head, length / 2);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const wing = (s: number) =>
    `${x2 - h * Math.cos(angle + s)} ${y2 - h * Math.sin(angle + s)}`;
  return `${line} M ${wing(0.45)} L ${x2} ${y2} L ${wing(-0.45)}`;
}

export function Arrow({
  from,
  to,
  color = K.ink,
  width = 2,
  head = 8,
  opacity = 1,
  dashed = false,
}: {
  from: Point;
  to: Point;
  color?: string;
  width?: number;
  head?: number;
  opacity?: number;
  dashed?: boolean;
}) {
  const transition = useTween();
  const points = useTweened([...from, ...to]);
  const d = useTransform(points, (p) => arrowPath(p, head));
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? "4 4" : undefined}
      initial={false}
      animate={{ opacity }}
      transition={transition}
    />
  );
}

export function Bracket({
  x,
  top,
  bottom,
  width,
  color = K.ink,
}: {
  x: number;
  top: number;
  bottom: number;
  width: number;
  color?: string;
}) {
  const l = x - width / 2;
  const r = x + width / 2;
  return (
    <path
      d={`M ${l + 5} ${top} H ${l} V ${bottom} H ${l + 5} M ${r - 5} ${top} H ${r} V ${bottom} H ${r - 5}`}
      fill="none"
      stroke={color}
      strokeWidth={1.25}
    />
  );
}

export function At({
  x,
  y,
  opacity = 1,
  children,
}: {
  x: number;
  y: number;
  opacity?: number;
  children: ReactNode;
}) {
  const transition = useTween();
  return (
    <motion.g initial={false} animate={{ x, y, opacity }} transition={transition}>
      {children}
    </motion.g>
  );
}

export function Num({
  x,
  y,
  value,
  digits = 2,
  size = 12,
  fill = K.ink,
  weight,
  anchor = "middle",
}: {
  x: number;
  y: number;
  value: number;
  digits?: number;
  size?: number;
  fill?: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
}) {
  const tweened = useTweened([value]);
  const text = useTransform(tweened, ([v]) => fmt(v, digits));
  return (
    <motion.text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      dominantBaseline="central"
      className="tabular-nums"
    >
      {text}
    </motion.text>
  );
}

export function VBar({
  x,
  base,
  value,
  k,
  width,
  fill = K.ink,
  opacity = 1,
}: {
  x: number;
  base: number;
  value: number;
  k: number;
  width: number;
  fill?: string;
  opacity?: number;
}) {
  const transition = useTween();
  const h = Math.abs(value) * k;
  return (
    <motion.rect
      x={x}
      width={width}
      rx={2}
      initial={false}
      animate={{ y: value < 0 ? base : base - h, height: h, fill, opacity }}
      transition={transition}
    />
  );
}

export function HBar({
  y,
  base,
  value,
  k,
  height = 8,
  fill = K.ink,
}: {
  y: number;
  base: number;
  value: number;
  k: number;
  height?: number;
  fill?: string;
}) {
  const transition = useTween();
  const w = Math.abs(value) * k;
  return (
    <motion.rect
      y={y - height / 2}
      height={height}
      rx={2}
      initial={false}
      animate={{ x: value < 0 ? base - w : base, width: w, fill }}
      transition={transition}
    />
  );
}

export type Line = string | { text: string; color: string };

export function Calc({
  x = 16,
  y,
  steps,
  step,
  size = 12,
  gap = 20,
  anchor = "start",
}: {
  x?: number;
  y: number;
  steps: Line[][];
  step: number;
  size?: number;
  gap?: number;
  anchor?: "start" | "middle";
}) {
  return (
    <g>
      {steps.map((lines, s) => (
        <motion.g
          key={s}
          initial={false}
          animate={{ opacity: s === step ? 1 : 0 }}
          transition={{ duration: 0.5, delay: s === step ? 0.15 : 0 }}
        >
          {lines.map((l, k) => (
            <text
              key={k}
              x={x}
              y={y + k * gap}
              fontSize={size}
              textAnchor={anchor}
              dominantBaseline="central"
              fill={typeof l === "string" ? K.ink : l.color}
              xmlSpace="preserve"
              style={{ whiteSpace: "pre" }}
              className="font-mono"
            >
              {typeof l === "string" ? l : l.text}
            </text>
          ))}
        </motion.g>
      ))}
    </g>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  hidden = false,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  hidden?: boolean;
}) {
  return (
    <label
      className={`flex w-full max-w-xs items-center gap-3 text-sm text-ir-ink-muted transition-opacity duration-500 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={hidden || undefined}
    >
      <span className="shrink-0">{label}</span>
      <input
        type="range"
        className="ir-range min-w-0 flex-1"
        min={min}
        max={max}
        step={step}
        value={value}
        tabIndex={hidden ? -1 : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-ir-ink">
        {display}
      </span>
    </label>
  );
}
