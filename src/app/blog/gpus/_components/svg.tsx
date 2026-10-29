"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { C } from "@/components/blog/palette";
import { Code, type Focus } from "@/components/blog/Code";
import { useLevel } from "@/components/blog/Level";

export const K = {
  ink: C.ink,
  muted: C.muted,
  faint: C.faint,
  grid: "#eef0f3",
  axis: "#c4c9d1",
  cell: "#f3f4f6",
  cpu: C.rep,
  cpuSoft: C.repSoft,
  gpu: C.transform,
  gpuInk: C.transformInk,
  gpuSoft: C.transformSoft,
  mem: C.human,
  memSoft: C.humanSoft,
  slate: C.spaceInk,
  slateSoft: C.spaceSoft,
  green: "#059669",
  greenSoft: "#d1fae5",
  violet: "#7c3aed",
  violetSoft: "#ede9fe",
};

const TWEEN = { duration: 0.8, ease: [0.22, 1, 0.36, 1] } as const;
const INSTANT = { duration: 0 } as const;

export function useTween(duration: number = TWEEN.duration) {
  const reduce = useReducedMotion();
  return useMemo(() => (reduce ? INSTANT : { ...TWEEN, duration }), [reduce, duration]);
}

export function useClock(running: boolean, period: number, length: number) {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running || reduce) return;
    const id = setInterval(() => setTick((t) => (t + 1) % length), period);
    return () => clearInterval(id);
  }, [running, reduce, period, length]);
  return running && !reduce ? tick : length - 1;
}

export function Num({
  x,
  y,
  value,
  format,
  size = 12,
  fill = K.ink,
  weight,
  anchor = "middle",
}: {
  x: number;
  y: number;
  value: number;
  format: (v: number) => string;
  size?: number;
  fill?: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
}) {
  const transition = useTween();
  const tweened = useMotionValue(value);
  useEffect(() => {
    const controls = animate(tweened, value, transition);
    return () => controls.stop();
  }, [value, transition, tweened]);
  const text = useTransform(tweened, format);
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

export function Box({
  x,
  y,
  width,
  height,
  fill,
  opacity = 1,
  rx = 2,
  stroke,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity?: number;
  rx?: number;
  stroke?: string;
}) {
  const transition = useTween();
  return (
    <motion.rect
      rx={rx}
      stroke={stroke}
      initial={false}
      animate={{ x, y, width: Math.max(0, width), height: Math.max(0, height), fill, opacity }}
      transition={transition}
    />
  );
}

export function Calc({
  x,
  y,
  steps,
  step,
  size = 12,
  gap = 20,
  anchor = "middle",
}: {
  x: number;
  y: number;
  steps: string[][];
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
              fill={K.ink}
              style={{ whiteSpace: "pre" }}
              className="font-mono"
            >
              {l}
            </text>
          ))}
        </motion.g>
      ))}
    </g>
  );
}

export function ExpertCode({ code, focus }: { code: string; focus?: Focus[] }) {
  const { reaches } = useLevel();
  if (!reaches("expert")) return null;
  return <Code code={code} focus={focus} />;
}

export function Choice<T extends string | number>({
  label,
  options,
  value,
  onChange,
  hidden = false,
}: {
  label: ReactNode;
  options: readonly { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  hidden?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-ir-ink-muted transition-opacity duration-500 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={hidden || undefined}
      role="radiogroup"
    >
      <span>{label}</span>
      <span className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            tabIndex={hidden ? -1 : undefined}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-2.5 py-0.5 font-mono text-xs tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink ${
              o.value === value ? "bg-ir-ink text-white" : "bg-gray-100 text-ir-ink hover:bg-gray-200"
            }`}
          >
            {o.label}
          </button>
        ))}
      </span>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  onChange,
  display,
  hidden = false,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
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
        step={1}
        value={value}
        tabIndex={hidden ? -1 : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-ir-ink">
        {display}
      </span>
    </label>
  );
}
