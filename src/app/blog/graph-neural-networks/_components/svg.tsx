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
import { CLASS, EDGES, LAYOUT, fmt, range, type Edge, type Matrix, type Point, type Vec } from "./model";

export const K = {
  ink: C.ink,
  muted: C.muted,
  faint: C.faint,
  grid: "#eef0f3",
  axis: "#c4c9d1",
  warp: "#d5dae1",
  node: "#9ca3af",
  empty: "#f3f4f6",
  shape: "#9ca3af",
  c0: C.rep,
  c0Soft: C.repSoft,
  c1: C.human,
  c1Soft: C.humanSoft,
  out: C.transform,
  outInk: C.transformInk,
  outSoft: C.transformSoft,
  slate: C.spaceInk,
  slateSoft: C.spaceSoft,
  green: "#059669",
  greenSoft: "#d1fae5",
};

export const CLASS_COLOR = [K.c0, K.c1];
export const CLASS_SOFT = [K.c0Soft, K.c1Soft];
export const classOf = (i: number) => CLASS_COLOR[CLASS[i]];

export const WL_COLORS = ["#cbd5e1", K.c0, K.out, K.c1, K.green, "#7c3aed", "#0891b2"];

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

export const place = (left: number, top: number, unit: number, layout: Matrix = LAYOUT): Point[] =>
  layout.map((p) => [left + p[0] * unit, top + p[1] * unit]);

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
  unit: number;
  left?: number;
  top?: number;
}): Plane {
  const px = (v: number) => left + (v - x[0]) * unit;
  const py = (v: number) => top + (y[1] - v) * unit;
  return {
    x,
    y,
    left,
    top,
    width: (x[1] - x[0]) * unit,
    height: (y[1] - y[0]) * unit,
    px,
    py,
    at: (p) => [px(p[0]), py(p[1])],
  };
}

export function Grid({ plane: P, lines = true }: { plane: Plane; lines?: boolean }) {
  const xs = range(Math.ceil(P.x[0]), Math.floor(P.x[1]));
  const ys = range(Math.ceil(P.y[0]), Math.floor(P.y[1]));
  return (
    <g>
      <rect x={P.left} y={P.top} width={P.width} height={P.height} rx={6} fill="#fff" stroke={K.faint} />
      {lines && (
        <g stroke={K.grid}>
          {xs.map((v) => (
            <line key={`x${v}`} x1={P.px(v)} x2={P.px(v)} y1={P.top} y2={P.top + P.height} />
          ))}
          {ys.map((v) => (
            <line key={`y${v}`} y1={P.py(v)} y2={P.py(v)} x1={P.left} x2={P.left + P.width} />
          ))}
        </g>
      )}
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
  const wing = (s: number) => `${x2 - h * Math.cos(angle + s)} ${y2 - h * Math.sin(angle + s)}`;
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

export function Dot({
  at,
  color,
  label,
  opacity = 1,
  r = 5,
  hollow = false,
  side = "right",
  labelOpacity = 1,
}: {
  at: Point;
  color: string;
  label?: string;
  opacity?: number;
  r?: number;
  hollow?: boolean;
  side?: "left" | "right";
  labelOpacity?: number;
}) {
  const transition = useTween();
  return (
    <At x={at[0]} y={at[1]} opacity={opacity}>
      <motion.circle
        strokeWidth={hollow ? 1.75 : 1.25}
        initial={false}
        animate={{ r, fill: hollow ? "#fff" : color, stroke: color }}
        transition={transition}
      />
      {label !== undefined && (
        <motion.text
          x={side === "right" ? r + 3 : -r - 3}
          y={-r - 1}
          fontSize={10}
          textAnchor={side === "right" ? "start" : "end"}
          dominantBaseline="central"
          className="tabular-nums"
          initial={false}
          animate={{ fill: color, opacity: labelOpacity }}
          transition={transition}
        >
          {label}
        </motion.text>
      )}
    </At>
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

export interface NodeLook {
  fill?: string;
  stroke?: string;
  ink?: string;
  opacity?: number;
  ring?: string;
}

export interface EdgeLook {
  color?: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
}

export const classLook = (i: number): NodeLook => ({
  fill: CLASS_SOFT[CLASS[i]],
  stroke: CLASS_COLOR[CLASS[i]],
  ink: CLASS_COLOR[CLASS[i]],
});

export function GraphView({
  at,
  edges = EDGES,
  node = () => ({}),
  edge = () => ({}),
  label = (i) => String(i),
  r = 10,
}: {
  at: readonly Point[];
  edges?: readonly Edge[];
  node?: (i: number) => NodeLook;
  edge?: (e: Edge, k: number) => EdgeLook;
  label?: (i: number) => string | null;
  r?: number;
}) {
  const transition = useTween();
  return (
    <g>
      {edges.map((e, k) => {
        const look = edge(e, k);
        const [a, b] = [at[e[0]], at[e[1]]];
        return (
          <motion.line
            key={`${e[0]}-${e[1]}`}
            initial={false}
            animate={{
              x1: a[0],
              y1: a[1],
              x2: b[0],
              y2: b[1],
              stroke: look.color ?? K.faint,
              strokeWidth: look.width ?? 1.5,
              opacity: look.opacity ?? 1,
            }}
            strokeDasharray={look.dashed ? "3 4" : undefined}
            strokeLinecap="round"
            transition={transition}
          />
        );
      })}
      {at.map((p, i) => {
        const look = node(i);
        const text = label(i);
        return (
          <motion.g
            key={i}
            initial={false}
            animate={{ x: p[0], y: p[1], opacity: look.opacity ?? 1 }}
            transition={transition}
          >
            <motion.circle
              fill="none"
              strokeWidth={1.5}
              initial={false}
              animate={{ r: r + 4, stroke: look.ring ?? "#fff", opacity: look.ring ? 1 : 0 }}
              transition={transition}
            />
            <motion.circle
              strokeWidth={1.5}
              initial={false}
              animate={{ r, fill: look.fill ?? "#fff", stroke: look.stroke ?? K.node }}
              transition={transition}
            />
            {text !== null && (
              <motion.text
                key={text}
                fontSize={r * 1.05}
                textAnchor="middle"
                dominantBaseline="central"
                className="tabular-nums"
                fill={look.ink ?? K.ink}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {text}
              </motion.text>
            )}
          </motion.g>
        );
      })}
    </g>
  );
}

export function Cells({
  x,
  y,
  values,
  w = 16,
  h = 16,
  digits = 0,
  size = 9,
  fill = () => K.empty,
  ink = () => K.ink,
  lit,
  rows,
  cols,
  numbers = true,
  border = K.faint,
  colDelay = 0,
}: {
  x: number;
  y: number;
  values: Matrix;
  w?: number;
  h?: number;
  digits?: number;
  size?: number;
  fill?: (v: number, i: number, j: number) => string;
  ink?: (v: number, i: number, j: number) => string;
  lit?: (i: number, j: number) => boolean;
  rows?: readonly number[];
  cols?: readonly number[];
  numbers?: boolean;
  border?: string;
  colDelay?: number;
}) {
  const transition = useTween();
  const cellTransition = { ...transition, x: { ...transition, delay: transition.duration ? colDelay : 0 } };
  return (
    <motion.g initial={false} animate={{ x, y }} transition={transition}>
      {values.map((row, i) =>
        row.map((v, j) => {
          const on = lit ? lit(i, j) : true;
          return (
            <motion.g
              key={`${i}-${j}`}
              initial={false}
              animate={{ x: (cols?.[j] ?? j) * w, y: (rows?.[i] ?? i) * h, opacity: on ? 1 : 0.3 }}
              transition={cellTransition}
            >
              <motion.rect
                width={w}
                height={h}
                stroke="#fff"
                strokeWidth={1}
                initial={false}
                animate={{ fill: fill(v, i, j) }}
                transition={transition}
              />
              {numbers && (
                <Num x={w / 2} y={h / 2} value={v} digits={digits} size={size} fill={ink(v, i, j)} />
              )}
            </motion.g>
          );
        }),
      )}
      <rect
        x={-0.5}
        y={-0.5}
        width={values[0].length * w + 1}
        height={values.length * h + 1}
        fill="none"
        stroke={border}
        rx={2}
      />
    </motion.g>
  );
}

export function Tensor({
  x,
  y,
  rows,
  cols,
  u = 8,
  color = K.ink,
  fill = "#fff",
  name,
  shape,
  on = true,
}: {
  x: number;
  y: number;
  rows: number;
  cols: number;
  u?: number;
  color?: string;
  fill?: string;
  name: ReactNode;
  shape: string;
  on?: boolean;
}) {
  const transition = useTween();
  const w = cols * u;
  const h = rows * u;
  return (
    <motion.g initial={false} animate={{ opacity: on ? 1 : 0.3 }} transition={transition}>
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill={fill} stroke={color} strokeOpacity={0.7} />
      <g stroke={color} strokeOpacity={0.18}>
        {range(1, cols - 1).map((j) => (
          <line key={`c${j}`} x1={x + j * u} x2={x + j * u} y1={y} y2={y + h} />
        ))}
        {range(1, rows - 1).map((i) => (
          <line key={`r${i}`} y1={y + i * u} y2={y + i * u} x1={x} x2={x + w} />
        ))}
      </g>
      <text
        x={x + w / 2}
        y={y + h + 14}
        fontSize={12}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
      >
        {name}
      </text>
      <text
        x={x + w / 2}
        y={y + h + 29}
        fontSize={9.5}
        textAnchor="middle"
        dominantBaseline="central"
        fill={K.shape}
        className="font-mono"
      >
        {shape}
      </text>
    </motion.g>
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
          transition={s === step ? { duration: 0.4, delay: 0.25 } : { duration: 0.2 }}
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
