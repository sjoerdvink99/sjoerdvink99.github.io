"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  useEffect,
  useId,
  useMemo,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { C } from "@/components/blog/palette";
import { clamp, fmt, range, type Look, type Point, type Vec } from "./model";

export const K = {
  ink: C.ink,
  muted: C.muted,
  faint: C.faint,
  grid: "#eef0f3",
  axis: "#c4c9d1",
  blue: C.rep,
  blueSoft: C.repSoft,
  rose: C.human,
  roseSoft: C.humanSoft,
  amber: C.transform,
  amberInk: C.transformInk,
  amberSoft: C.transformSoft,
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
  return useMemo(
    () => (reduce || duration === 0 ? INSTANT : { ...TWEEN, duration }),
    [reduce, duration],
  );
}

export function useTweened(target: Vec, duration?: number) {
  const transition = useTween(duration);
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

interface Plane {
  x: [number, number];
  y: [number, number];
  left: number;
  top: number;
  unit: number;
  width: number;
  height: number;
  px: (v: number) => number;
  py: (v: number) => number;
  at: (p: Vec) => Point;
  from: (p: Point) => Vec;
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
    unit,
    width: (x[1] - x[0]) * unit,
    height: (y[1] - y[0]) * unit,
    px,
    py,
    at: (p) => [px(p[0]), py(p[1])],
    from: ([sx, sy]) => [x[0] + (sx - left) / unit, y[1] - (sy - top) / unit],
  };
}

export function Grid({ plane: P, axes = true }: { plane: Plane; axes?: boolean }) {
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
      {axes && (
        <g stroke={K.axis}>
          <line x1={P.left} x2={P.left + P.width} y1={P.py(0)} y2={P.py(0)} />
          <line x1={P.px(0)} x2={P.px(0)} y1={P.top} y2={P.top + P.height} />
        </g>
      )}
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

function arrowPath([x1, y1, x2, y2]: Vec, head = 8) {
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
  duration,
}: {
  from: Point;
  to: Point;
  color?: string;
  width?: number;
  head?: number;
  opacity?: number;
  dashed?: boolean;
  duration?: number;
}) {
  const transition = useTween();
  const points = useTweened([...from, ...to], duration);
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
  duration,
  children,
}: {
  x: number;
  y: number;
  opacity?: number;
  duration?: number;
  children: ReactNode;
}) {
  const transition = useTween(duration);
  return (
    <motion.g initial={false} animate={{ x, y, opacity }} transition={transition}>
      {children}
    </motion.g>
  );
}

export function Dot({
  at,
  color,
  r = 4,
  hollow = false,
  opacity = 1,
  duration,
}: {
  at: Point;
  color: string;
  r?: number;
  hollow?: boolean;
  opacity?: number;
  duration?: number;
}) {
  return (
    <At x={at[0]} y={at[1]} opacity={opacity} duration={duration}>
      <circle r={r} fill={hollow ? "#fff" : color} stroke={color} strokeWidth={hollow ? 1.5 : 1} />
    </At>
  );
}

export function Cross({ at, color, size = 6 }: { at: Point; color: string; size?: number }) {
  return (
    <At x={at[0]} y={at[1]}>
      <path
        d={`M ${-size} ${-size} L ${size} ${size} M ${-size} ${size} L ${size} ${-size}`}
        stroke={color}
        strokeWidth={2.25}
        strokeLinecap="round"
      />
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
  anchor = "middle",
  prefix = "",
  suffix = "",
  duration,
}: {
  x: number;
  y: number;
  value: number;
  digits?: number;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const tweened = useTweened([value], duration);
  const text = useTransform(tweened, ([v]) => `${prefix}${fmt(v, digits)}${suffix}`);
  return (
    <motion.text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      textAnchor={anchor}
      dominantBaseline="central"
      className="tabular-nums"
    >
      {text}
    </motion.text>
  );
}

const mouth = (smile: number, r: number) =>
  `M ${(-0.4 * r).toFixed(2)} ${(0.3 * r).toFixed(2)} Q 0 ${((0.3 + 0.45 * smile) * r).toFixed(2)} ${(0.4 * r).toFixed(2)} ${(0.3 * r).toFixed(2)}`;

export function Face({
  look,
  x = 0,
  y = 0,
  r = 24,
  opacity = 1,
  ring,
  duration,
}: {
  look: Look;
  x?: number;
  y?: number;
  r?: number;
  opacity?: number;
  ring?: string;
  duration?: number;
}) {
  const transition = useTween(duration);
  const eye = Math.max(0.05, look.eyes) * 0.17 * r;
  const stroke = Math.max(1, r * 0.06);
  return (
    <motion.g initial={false} animate={{ x, y, opacity }} transition={transition}>
      <motion.circle
        r={r + 4}
        fill="none"
        strokeWidth={2}
        initial={false}
        animate={{ stroke: ring ?? "#fff", opacity: ring ? 1 : 0 }}
        transition={transition}
      />
      <circle r={r} fill="#fff" stroke={K.ink} strokeWidth={stroke} />
      {[-1, 1].map((side) => (
        <motion.ellipse
          key={side}
          cx={side * 0.36 * r}
          cy={-0.14 * r}
          rx={0.11 * r}
          fill={K.ink}
          initial={false}
          animate={{ ry: eye }}
          transition={transition}
        />
      ))}
      <motion.path
        fill="none"
        stroke={K.ink}
        strokeWidth={stroke * 1.2}
        strokeLinecap="round"
        initial={false}
        animate={{ d: mouth(look.smile, r) }}
        transition={transition}
      />
    </motion.g>
  );
}

export function Pad({
  plane: P,
  value,
  onChange,
  active,
  label,
}: {
  plane: Plane;
  value: Vec;
  onChange: (z: Vec) => void;
  active: boolean;
  label: string;
}) {
  const set = (z: Vec) =>
    onChange([clamp(z[0], P.x[0], P.x[1]), clamp(z[1], P.y[0], P.y[1])]);
  const move = (e: PointerEvent<SVGRectElement>) => {
    const m = e.currentTarget.ownerSVGElement?.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    set(P.from([p.x, p.y]));
  };
  const keys: Record<string, Vec> = {
    ArrowLeft: [-0.2, 0],
    ArrowRight: [0.2, 0],
    ArrowUp: [0, 0.2],
    ArrowDown: [0, -0.2],
  };
  const key = (e: KeyboardEvent<SVGRectElement>) => {
    const delta = keys[e.key];
    if (!delta) return;
    e.preventDefault();
    set([value[0] + delta[0], value[1] + delta[1]]);
  };
  return (
    <rect
      x={P.left}
      y={P.top}
      width={P.width}
      height={P.height}
      rx={6}
      fill="transparent"
      role="slider"
      aria-label={label}
      aria-valuemin={P.x[0]}
      aria-valuemax={P.x[1]}
      aria-valuenow={Number(value[0].toFixed(2))}
      aria-valuetext={`z = [${fmt(value[0])}, ${fmt(value[1])}]`}
      tabIndex={active ? 0 : -1}
      pointerEvents={active ? "all" : "none"}
      className="cursor-crosshair touch-none outline-none focus-visible:stroke-ir-human focus-visible:[stroke-width:2]"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e);
      }}
      onKeyDown={key}
    />
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

export function Hint({ children, hidden = false }: { children: ReactNode; hidden?: boolean }) {
  return (
    <p
      className={`text-sm text-ir-ink-muted transition-opacity duration-500 ${hidden ? "opacity-0" : "opacity-100"}`}
      aria-hidden={hidden || undefined}
    >
      {children}
    </p>
  );
}

export function Button({
  children,
  onClick,
  hidden = false,
}: {
  children: ReactNode;
  onClick: () => void;
  hidden?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden || undefined}
      className={`rounded-full border border-gray-300 px-4 py-1.5 text-sm text-ir-ink transition-[opacity,background-color] duration-500 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink ${
        hidden ? "pointer-events-none opacity-0" : ""
      }`}
    >
      {children}
    </button>
  );
}
