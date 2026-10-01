"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { rand } from "@/components/blog/random";
import { snap, type Shape } from "../model";
import { Figure, Glyph, K, Label, Sym } from "../svg";

const N_UNITS = 16;
const COLS = 6;

const INPUTS: Shape[] = Array.from({ length: 18 }, (_, i) => ({
  a: (rand(i * 7 + 1) - 0.5) * 0.9,
  b:
    rand(i * 7 + 2) < 0.45
      ? 0.1 + rand(i * 7 + 3) * 0.12
      : rand(i * 7 + 3) * 0.04,
  turn: rand(i * 7 + 4) * Math.PI,
}));

const UNITS = [
  {
    index: 2,
    name: "long and thin",
    act: (s: Shape) => Math.max(0, Math.abs(s.a) * 5 - 0.8),
  },
  {
    index: 6,
    name: "three lobes",
    act: (s: Shape) => Math.max(0, s.b * 12 - 0.6),
  },
  {
    index: 11,
    name: null,
    act: (s: Shape) =>
      Math.max(0, Math.sin(9 * s.a + 17 * s.b + 2 * (s.turn ?? 0)) - 0.35) *
      1.4,
  },
];

const CODES = INPUTS.map((s, i) => {
  const z = new Array(N_UNITS).fill(0);
  for (const u of UNITS) z[u.index] = snap(u.act(s));
  const extra = [0, 1, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15];
  z[extra[Math.floor(rand(i * 13 + 5) * extra.length)]] =
    0.3 + rand(i * 13 + 6) * 0.8;
  if (rand(i * 13 + 7) < 0.4)
    z[extra[Math.floor(rand(i * 13 + 8) * extra.length)]] =
      0.2 + rand(i * 13 + 9) * 0.5;
  return z;
});
const MAX = Math.max(...CODES.flat());

const STEP_UNIT = [null, 0, 1, 2, null];

const cellAt = (i: number) => ({
  x: 38 + (i % COLS) * 73,
  y: 34 + Math.floor(i / COLS) * 112,
});

export default function FeaturesVisual() {
  const { step } = useStage();
  const [choice, setChoice] = useState<{
    unit: number | null;
    step: number;
  } | null>(null);
  const unit = choice && choice.step === step ? choice.unit : STEP_UNIT[step];
  const u = unit === null ? null : UNITS[unit];
  const acts = u ? CODES.map((z) => z[u.index]) : null;
  const top = acts ? [...acts].sort((p, q) => q - p)[4] : 0;

  const chips = (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      role="group"
      aria-label="Choose a latent unit"
    >
      <button
        type="button"
        onClick={() => setChoice({ unit: null, step })}
        aria-pressed={unit === null}
        className={`rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink ${
          unit === null
            ? "border-ir-ink text-ir-ink"
            : "border-gray-200 text-ir-ink-muted hover:border-gray-400"
        }`}
      >
        all units
      </button>
      {UNITS.map((v, k) => (
        <button
          key={v.index}
          type="button"
          onClick={() => setChoice({ unit: k, step })}
          aria-pressed={unit === k}
          className={`rounded-full border px-3 py-1 font-math text-sm italic transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink ${
            unit === k
              ? "border-ir-rep bg-ir-rep-soft text-ir-rep"
              : "border-gray-200 text-ir-ink-muted hover:border-gray-400"
          }`}
        >
          z<sub className="not-italic">{v.index + 1}</sub>
        </button>
      ))}
    </div>
  );

  return (
    <Figure
      viewBox="0 0 440 372"
      top={chips}
      label="Eighteen shapes, each with a sparse code of sixteen units. Selecting a unit highlights the shapes that activate it most. Two units correspond to properties we can name, and one does not."
    >
      {INPUTS.map((s, i) => {
        const { x, y } = cellAt(i);
        const a = acts ? acts[i] : 0;
        const strong = acts ? a >= top && a > 0 : false;
        return (
          <g key={i}>
            <motion.circle
              cx={x}
              cy={y}
              r={26}
              initial={false}
              animate={{
                fill: strong ? K.zSoft : "#ffffff",
                stroke: strong ? K.z : "#e5e7eb",
              }}
              transition={{ duration: 0.4 }}
            />
            <motion.g
              initial={false}
              animate={{
                opacity: acts ? 0.25 + 0.75 * Math.min(1, a / (top || 1)) : 1,
              }}
              transition={{ duration: 0.4 }}
            >
              <Glyph shape={s} x={x} y={y} r={17} width={1.4} />
            </motion.g>

            {CODES[i].map((v, j) => {
              const h = (v / MAX) * 18;
              const selected = u?.index === j;
              return (
                <rect
                  key={j}
                  x={x - 28 + j * 3.5}
                  y={y + 52 - Math.max(h, 1)}
                  width={2.5}
                  height={Math.max(h, 1)}
                  fill={v > 0 ? (selected ? K.z : "#9ca3af") : "#e5e7eb"}
                  opacity={u && !selected && v > 0 ? 0.45 : 1}
                />
              );
            })}
          </g>
        );
      })}

      <g>
        {u ? (
          <>
            <Sym
              x={24}
              y={360}
              size={14}
              sub={String(u.index + 1)}
              fill={K.z}
              anchor="start"
            >
              z
            </Sym>
            <Label
              x={50}
              y={360}
              size={12}
              fill={u.name ? K.x : K.muted}
              anchor="start"
            >
              {u.name
                ? `the five strongest responses look ${u.name}`
                : "no single property explains the strongest responses"}
            </Label>
          </>
        ) : (
          <Label x={24} y={360} size={12} fill={K.muted} anchor="start">
            under each shape: its 16 latent units, most of them zero
          </Label>
        )}
      </g>
    </Figure>
  );
}
