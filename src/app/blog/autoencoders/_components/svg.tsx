"use client";

import { motion } from "motion/react";
import {
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { C } from "@/components/blog/palette";
import { shapePath, snap, type Shape, type Vec2 } from "./model";
import { Label, SPRING, Sym } from "@/components/blog/svg";

export {
  Figure,
  Label,
  MathText,
  SPRING,
  Sym,
  fade,
  useMotion,
} from "@/components/blog/svg";

export const K = {
  x: C.ink,
  z: C.rep,
  zSoft: C.repSoft,
  op: C.transform,
  opInk: C.transformInk,
  opSoft: C.transformSoft,
  grad: C.human,
  gradSoft: C.humanSoft,
  muted: C.muted,
  faint: C.faint,
  grid: "#eef0f3",
};

export function Glyph({
  shape,
  x,
  y,
  r = 14,
  color = K.x,
  fill = "none",
  width = 1.5,
  opacity = 1,
}: {
  shape: Shape;
  x: number;
  y: number;
  r?: number;
  color?: string;
  fill?: string;
  width?: number;
  opacity?: number;
}) {
  return (
    <path
      d={shapePath(shape, r)}
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
      fill={fill}
      stroke={color}
      strokeWidth={width}
      strokeLinejoin="round"
      opacity={opacity}
    />
  );
}

export interface Plane {
  px: (v: number) => number;
  py: (v: number) => number;
  p: (v: Vec2) => Vec2;
  k: number;
  box: { x: number; y: number; w: number; h: number };
  dom: { x: Vec2; y: Vec2 };
}

export function plane(
  dom: { x: Vec2; y: Vec2 },
  left: number,
  top: number,
  k: number,
): Plane {
  const px = (v: number) => snap(left + (v - dom.x[0]) * k, 2);
  const py = (v: number) => snap(top + (dom.y[1] - v) * k, 2);
  return {
    px,
    py,
    p: (v) => [px(v[0]), py(v[1])],
    k,
    dom,
    box: {
      x: left,
      y: top,
      w: (dom.x[1] - dom.x[0]) * k,
      h: (dom.y[1] - dom.y[0]) * k,
    },
  };
}

const range = (a: number, b: number) => {
  const out: number[] = [];
  for (let v = Math.ceil(a); v <= Math.floor(b); v++) out.push(v);
  return out;
};

export function Axes({
  pl,
  names = ["x", "x"],
  ticks = true,
  opacity = 1,
}: {
  pl: Plane;
  names?: [string, string];
  ticks?: boolean;
  opacity?: number;
}) {
  const { box, dom } = pl;
  const x0 = Math.min(Math.max(0, dom.x[0]), dom.x[1]);
  const y0 = Math.min(Math.max(0, dom.y[0]), dom.y[1]);
  return (
    <g opacity={opacity}>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        fill="#fff"
        stroke={K.faint}
        rx={6}
      />
      <g stroke={K.grid}>
        {range(dom.x[0], dom.x[1]).map((v) => (
          <line
            key={`x${v}`}
            x1={pl.px(v)}
            x2={pl.px(v)}
            y1={box.y}
            y2={box.y + box.h}
          />
        ))}
        {range(dom.y[0], dom.y[1]).map((v) => (
          <line
            key={`y${v}`}
            y1={pl.py(v)}
            y2={pl.py(v)}
            x1={box.x}
            x2={box.x + box.w}
          />
        ))}
      </g>
      <g stroke="#c4c9d1">
        <line x1={box.x} x2={box.x + box.w} y1={pl.py(y0)} y2={pl.py(y0)} />
        <line y1={box.y} y2={box.y + box.h} x1={pl.px(x0)} x2={pl.px(x0)} />
      </g>
      {ticks && (
        <g>
          {range(dom.x[0], dom.x[1])
            .filter((v) => v !== 0 && pl.px(v) < box.x + box.w - 8)
            .map((v) => (
              <Label
                key={`tx${v}`}
                x={pl.px(v)}
                y={pl.py(y0) + 11}
                size={10}
                fill="#9ca3af"
              >
                {String(v).replace("-", "−")}
              </Label>
            ))}
          {range(dom.y[0], dom.y[1])
            .filter((v) => v !== 0 && pl.py(v) > box.y + 8)
            .map((v) => (
              <Label
                key={`ty${v}`}
                x={pl.px(x0) - 9}
                y={pl.py(v)}
                size={10}
                fill="#9ca3af"
              >
                {String(v).replace("-", "−")}
              </Label>
            ))}
        </g>
      )}
      <Sym
        x={box.x + box.w - 14}
        y={pl.py(y0) - 12}
        size={14}
        sub="1"
        fill={K.muted}
      >
        {names[0]}
      </Sym>
      <Sym x={pl.px(x0) + 16} y={box.y + 13} size={14} sub="2" fill={K.muted}>
        {names[1]}
      </Sym>
    </g>
  );
}

export function Vector({
  from,
  to,
  color = K.op,
  width = 1.75,
  head = 7,
  dashed = false,
  opacity = 1,
}: {
  from: Vec2;
  to: Vec2;
  color?: string;
  width?: number;
  head?: number;
  dashed?: boolean;
  opacity?: number;
}) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  if (len < 1) return null;
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const h = Math.min(head, len * 0.6);
  const wing = (s: number) =>
    `${snap(to[0] - h * Math.cos(a + s), 2)} ${snap(to[1] - h * Math.sin(a + s), 2)}`;
  return (
    <g
      stroke={color}
      strokeWidth={width}
      fill="none"
      strokeLinecap="round"
      opacity={opacity}
    >
      <line
        x1={from[0]}
        y1={from[1]}
        x2={snap(to[0] - Math.cos(a) * width * 0.6, 2)}
        y2={snap(to[1] - Math.sin(a) * width * 0.6, 2)}
        strokeDasharray={dashed ? "4 4" : undefined}
      />
      <path
        d={`M ${wing(0.45)} L ${to[0]} ${to[1]} L ${wing(-0.45)}`}
        strokeLinejoin="round"
      />
    </g>
  );
}

export function Dot({
  at,
  kind = "x",
  r = 5,
  color,
  opacity = 1,
  children,
}: {
  at: Vec2;
  kind?: "x" | "xhat" | "z";
  r?: number;
  color?: string;
  opacity?: number;
  children?: ReactNode;
}) {
  const c = color ?? (kind === "z" ? K.z : K.x);
  return (
    <motion.g
      initial={false}
      animate={{ x: at[0], y: at[1], opacity }}
      transition={SPRING}
    >
      {kind === "xhat" ? (
        <circle r={r} fill="#fff" stroke={c} strokeWidth={1.75} />
      ) : (
        <circle r={r} fill={c} />
      )}
      {children}
    </motion.g>
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
        className="ir-range ae-range min-w-0 flex-1"
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

export function Button({
  onClick,
  children,
  hidden = false,
}: {
  onClick: () => void;
  children: ReactNode;
  hidden?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden || undefined}
      className={`rounded-full border border-gray-300 px-3.5 py-1.5 text-sm text-ir-ink transition-[opacity,border-color] duration-500 hover:border-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {children}
    </button>
  );
}

function toSvg(svg: SVGSVGElement, clientX: number, clientY: number): Vec2 {
  const m = svg.getScreenCTM();
  if (!m) return [0, 0];
  const pt = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
  return [pt.x, pt.y];
}

const KEYS: Record<string, Vec2> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
};

export function useDragPoint({
  pl,
  enabled,
  value,
  onChange,
  label,
  keyStep = 0.05,
}: {
  pl: Plane;
  enabled: boolean;
  value: Vec2;
  onChange: (v: Vec2) => void;
  label: string;
  keyStep?: number;
}) {
  const dragging = useRef(false);
  const clamp = (v: Vec2): Vec2 => [
    Math.min(pl.dom.x[1], Math.max(pl.dom.x[0], v[0])),
    Math.min(pl.dom.y[1], Math.max(pl.dom.y[0], v[1])),
  ];
  const onPointer = (e: PointerEvent<SVGGElement>) => {
    if (!enabled || (e.type === "pointermove" && !dragging.current)) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    if (e.type === "pointerdown") {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const [sx, sy] = toSvg(svg, e.clientX, e.clientY);
    onChange(
      clamp([
        pl.dom.x[0] + (sx - pl.box.x) / pl.k,
        pl.dom.y[1] - (sy - pl.box.y) / pl.k,
      ]),
    );
  };
  const stop = () => {
    dragging.current = false;
  };
  const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    const d = KEYS[e.key];
    if (!enabled || !d) return;
    e.preventDefault();
    onChange(clamp([value[0] + d[0] * keyStep, value[1] + d[1] * keyStep]));
  };
  return enabled
    ? {
        onPointerDown: onPointer,
        onPointerMove: onPointer,
        onPointerUp: stop,
        onPointerCancel: stop,
        onKeyDown,
        tabIndex: 0,
        role: "application",
        "aria-roledescription": "draggable point",
        "aria-label": label,
        className:
          "cursor-grab touch-none outline-none active:cursor-grabbing [&:focus-visible_.drag-ring]:stroke-ir-ink",
      }
    : { tabIndex: -1 };
}

export function DragRing({ at, show }: { at: Vec2; show: boolean }) {
  return (
    <motion.circle
      className="drag-ring"
      cx={at[0]}
      cy={at[1]}
      r={14}
      fill="transparent"
      stroke={K.faint}
      strokeWidth={1.5}
      strokeDasharray="3 3"
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
    />
  );
}
