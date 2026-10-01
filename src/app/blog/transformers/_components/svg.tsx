"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect } from "react";
import { C } from "@/components/blog/palette";
import { Label, Sym, SPRING } from "@/components/blog/svg";
import { fmt, type Matrix } from "./model";

/**
 * One colour per role, used the same way in every figure.
 * Token vectors are ink, queries rose, keys amber, values and everything
 * built from them blue. Attention weights are grey, because they come from
 * queries and keys together.
 */
export const K = {
  x: C.ink,
  q: C.human,
  qSoft: C.humanSoft,
  k: C.transform,
  kInk: C.transformInk,
  kSoft: C.transformSoft,
  v: C.rep,
  vSoft: C.repSoft,
  pos: C.spaceInk,
  posSoft: C.spaceSoft,
  muted: C.muted,
  faint: C.faint,
  shape: "#9ca3af",
  /** Two neutral tints that tell heads apart without borrowing Q, K or V. */
  head: ["#cbd5e1", "#eef2f6"],
};

/** One shade scale for all attention weights: 0.5 and above is the darkest. */
export const WEIGHT_MAX = 0.5;

export const EASE = { duration: 0.6, ease: [0.22, 1, 0.36, 1] } as const;

/** A number that tweens to its new value instead of being replaced. */
export function Num({
  x,
  y,
  value,
  digits = 2,
  size = 11,
  fill = K.x,
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
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => fmt(v, digits));
  useEffect(() => {
    const a = animate(mv, value, reduce ? { duration: 0 } : EASE);
    return () => a.stop();
  }, [mv, value, reduce]);
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

export interface Cell {
  w: number;
  h: number;
}

/**
 * A matrix drawn cell by cell. Its position animates, so a matrix can move
 * to a new role (scores becoming the left operand of the next product).
 */
export function Mat({
  x,
  y,
  values,
  cell = { w: 30, h: 20 },
  digits = 2,
  color = K.x,
  heat,
  heatMax = 1,
  numbers = true,
  rowOn,
  colOn,
  cellOn,
  show = true,
  rowsShown,
  size = 11,
}: {
  x: number;
  y: number;
  values: Matrix;
  cell?: Cell;
  digits?: number;
  color?: string;
  /** Shade each cell by its value, 0 to 1. */
  heat?: boolean;
  /** The value that gets the darkest shade. */
  heatMax?: number;
  numbers?: boolean;
  rowOn?: number | number[] | null;
  colOn?: number | null;
  cellOn?: [number, number] | null;
  show?: boolean;
  /** Reveal only the first n rows. */
  rowsShown?: number;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const lit = (i: number, j: number) =>
    (rowOn == null && colOn == null && cellOn == null) ||
    (Array.isArray(rowOn) ? rowOn.includes(i) : rowOn === i) ||
    colOn === j ||
    (cellOn != null && cellOn[0] === i && cellOn[1] === j);
  return (
    <motion.g
      initial={false}
      animate={{ x, y, opacity: show ? 1 : 0 }}
      transition={reduce ? { duration: 0 } : SPRING}
    >
      {values.map((row, i) =>
        row.map((v, j) => {
          const on = lit(i, j);
          const hidden = rowsShown !== undefined && i >= rowsShown;
          return (
            <motion.g
              key={`${i}-${j}`}
              initial={false}
              animate={{ opacity: hidden ? 0 : 1 }}
              transition={{ duration: reduce ? 0 : 0.5, delay: hidden ? 0 : i * 0.08 }}
            >
              <motion.rect
                x={j * cell.w}
                y={i * cell.h}
                width={cell.w}
                height={cell.h}
                stroke="#fff"
                strokeWidth={1}
                initial={false}
                animate={{
                  fill: heat ? color : "#f3f4f6",
                  fillOpacity: heat ? 0.06 + 0.8 * Math.min(1, Math.max(0, v / heatMax)) : 1,
                  opacity: on ? 1 : 0.35,
                }}
                transition={{ duration: reduce ? 0 : 0.5 }}
              />
              {numbers && (
                <motion.g
                  initial={false}
                  animate={{ opacity: on ? 1 : 0.35 }}
                  transition={{ duration: reduce ? 0 : 0.5 }}
                >
                  <Num
                    x={j * cell.w + cell.w / 2}
                    y={i * cell.h + cell.h / 2}
                    value={v}
                    digits={digits}
                    size={size}
                    fill={heat && on && v / heatMax > 0.6 ? "#fff" : K.x}
                  />
                </motion.g>
              )}
            </motion.g>
          );
        }),
      )}
      <motion.rect
        x={-0.5}
        y={-0.5}
        width={values[0].length * cell.w + 1}
        initial={false}
        animate={{ height: (rowsShown ?? values.length) * cell.h + 1 }}
        transition={{ duration: reduce ? 0 : 0.5 }}
        fill="none"
        stroke={color}
        strokeOpacity={0.55}
        rx={2}
      />
    </motion.g>
  );
}

/** Row labels to the left of a matrix: the token each row belongs to. */
export function RowLabels({
  x,
  y,
  labels,
  h = 20,
  on,
  fill = K.muted,
}: {
  x: number;
  y: number;
  labels: readonly string[];
  h?: number;
  on?: number | null;
  fill?: string;
}) {
  return (
    <g>
      {labels.map((t, i) => (
        <Label
          key={i}
          x={x}
          y={y + i * h + h / 2}
          size={11}
          anchor="end"
          fill={on === i ? K.x : fill}
          weight={on === i ? 600 : undefined}
        >
          {t}
        </Label>
      ))}
    </g>
  );
}

export function ColLabels({
  x,
  y,
  labels,
  w = 30,
  on,
  fill = K.muted,
}: {
  x: number;
  y: number;
  labels: readonly string[];
  w?: number;
  on?: number | null;
  fill?: string;
}) {
  return (
    <g>
      {labels.map((t, j) => (
        <Label
          key={j}
          x={x + j * w + w / 2}
          y={y}
          size={10}
          fill={on === j ? K.x : fill}
          weight={on === j ? 600 : undefined}
        >
          {t}
        </Label>
      ))}
    </g>
  );
}

/** A matrix name with its shape underneath, e.g. Q over (T, D). */
export function Name({
  x,
  y,
  children,
  sub,
  sup,
  shape,
  fill = K.x,
}: {
  x: number;
  y: number;
  children: string;
  sub?: string;
  sup?: string;
  shape?: string;
  fill?: string;
}) {
  return (
    <g>
      <Sym
        x={x}
        y={y}
        size={children.length > 2 ? 13 : 16}
        sub={sub}
        sup={sup}
        fill={fill}
        upright={children.length > 2}
      >
        {children}
      </Sym>
      {shape && (
        <Label x={x} y={y + 16} size={10} mono fill={K.shape}>
          {shape}
        </Label>
      )}
    </g>
  );
}

export function Op({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <Label x={x} y={y} size={15} fill={K.muted}>
      {children}
    </Label>
  );
}

/**
 * A tensor drawn by its shape: rows by columns of small squares, with
 * a stack of copies behind it when there is a batch dimension.
 */
export function Block({
  x,
  y,
  rows,
  cols,
  u = 8,
  color = K.x,
  fill = "#fff",
  batch = false,
  colFill,
  show = true,
}: {
  x: number;
  y: number;
  rows: number;
  cols: number;
  u?: number;
  color?: string;
  fill?: string;
  batch?: boolean;
  /** Optional fill per column, for showing which head a column belongs to. */
  colFill?: (j: number) => string;
  show?: boolean;
}) {
  const reduce = useReducedMotion();
  const w = cols * u;
  const h = rows * u;
  return (
    <motion.g
      initial={false}
      animate={{ x, y, opacity: show ? 1 : 0 }}
      transition={reduce ? { duration: 0 } : SPRING}
    >
      {[2, 1].map((k) => (
        <motion.rect
          key={k}
          width={w}
          height={h}
          rx={1.5}
          fill="#fff"
          stroke={color}
          strokeOpacity={0.35}
          initial={false}
          animate={{
            x: batch ? k * 4 : 0,
            y: batch ? -k * 4 : 0,
            opacity: batch ? 1 : 0,
          }}
          transition={reduce ? { duration: 0 } : EASE}
        />
      ))}
      <rect width={w} height={h} rx={1.5} fill={fill} stroke={color} strokeOpacity={0.7} />
      {colFill &&
        Array.from({ length: cols }, (_, j) => (
          <motion.rect
            key={j}
            x={j * u + 0.5}
            y={0.5}
            width={u - 1}
            height={h - 1}
            initial={false}
            animate={{ fill: colFill(j) }}
            transition={{ duration: reduce ? 0 : 0.5 }}
          />
        ))}
      <g stroke={color} strokeOpacity={0.18}>
        {Array.from({ length: cols - 1 }, (_, j) => (
          <line key={`c${j}`} x1={(j + 1) * u} x2={(j + 1) * u} y1={0} y2={h} />
        ))}
        {Array.from({ length: rows - 1 }, (_, i) => (
          <line key={`r${i}`} y1={(i + 1) * u} y2={(i + 1) * u} x1={0} x2={w} />
        ))}
      </g>
    </motion.g>
  );
}

export type Line = string | { text: string; color: string };

/**
 * The worked arithmetic behind the current step, in monospace under a
 * figure. Each step has its own lines; only the current step is shown.
 */
export function Calc({
  x = 16,
  y,
  steps,
  step,
  size = 11.5,
  gap = 19,
}: {
  x?: number;
  y: number;
  steps: Line[][];
  step: number;
  size?: number;
  gap?: number;
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
              dominantBaseline="central"
              fill={typeof l === "string" ? K.x : l.color}
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
