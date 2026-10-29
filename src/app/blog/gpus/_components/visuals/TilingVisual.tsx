"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { useLevel } from "@/components/blog/Level";
import type { Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { READS, TILE, fmt, range } from "../model";
import { Box, ExpertCode, K, Num, useClock } from "../svg";

const CODE = `@triton.jit
def matmul(A, B, C, n, T: tl.constexpr):
    rows = tl.program_id(0) * T + tl.arange(0, T)
    cols = tl.program_id(1) * T + tl.arange(0, T)
    acc = tl.zeros((T, T), dtype=tl.float32)
    for k in range(0, n, T):
        ks = k + tl.arange(0, T)
        a = tl.load(A + rows[:, None] * n + ks[None, :])
        b = tl.load(B + ks[:, None] * n + cols[None, :])
        acc += tl.dot(a, b)
    tl.store(C + rows[:, None] * n + cols[None, :], acc)`;

const FOCUS: Focus[][] = [[0, 1], [2, 3, 4], [5, 6, 7, 8, 9], [10], [9]];

const { n: N, t: T } = TILE;
const CELL = 13;
const SIZE = N * CELL;
const SPOT = { A: { x: 30, y: 150 }, B: { x: 152, y: 28 }, C: { x: 152, y: 150 } };
const SRAM = { x: 292, y: 150, w: 150, h: SIZE };
const MINI = 11;

type Lit = (r: number, c: number) => boolean;

function Matrix({
  at,
  name,
  lit,
  color,
  shade,
}: {
  at: { x: number; y: number };
  name: string;
  lit: Lit;
  color: string;
  shade?: (r: number, c: number) => string | null;
}) {
  return (
    <g>
      <Label x={at.x + SIZE / 2} y={at.y - 10} size={13} fill={K.ink} weight={600}>
        {name}
      </Label>
      {range(N * N).map((i) => {
        const r = Math.floor(i / N);
        const c = i % N;
        return (
          <rect
            key={i}
            x={at.x + c * CELL}
            y={at.y + r * CELL}
            width={CELL - 1.5}
            height={CELL - 1.5}
            rx={1.5}
            fill={lit(r, c) ? color : (shade?.(r, c) ?? K.cell)}
            style={{ transition: "fill 300ms" }}
          />
        );
      })}
    </g>
  );
}

function phase(step: number, tick: number) {
  if (step <= 1) return { tile: 0, k: 0 };
  if (step === 2) return { tile: 0, k: tick % 2 };
  return { tile: Math.floor(tick / 2), k: tick % 2 };
}

export default function TilingVisual() {
  const { step } = useStage();
  const { reaches } = useLevel();
  const detail = reaches("mechanics");
  const tick = useClock(step >= 2, step === 2 ? 1300 : 800, step === 2 ? 2 : 8);
  const naive = step === 0;
  const { tile, k } = phase(step, tick);
  const ti = Math.floor(tile / 2);
  const tj = tile % 2;
  const block = (v: number) => Math.floor(v / T);

  const litA: Lit = naive ? (r) => r === 1 : (r, c) => block(r) === ti && block(c) === k;
  const litB: Lit = naive ? (_, c) => c === 2 : (r, c) => block(r) === k && block(c) === tj;
  const shadeC = (r: number, c: number) => {
    if (naive) return r === 1 && c === 2 ? K.green : null;
    const t = block(r) * 2 + block(c);
    if (t < tile && step >= 3) return K.green;
    if (t === tile) return k === 0 ? K.greenSoft : "#6ee7b7";
    return null;
  };

  return (
    <Figure
      viewBox="0 0 460 290"
      top={<ExpertCode code={CODE} focus={FOCUS[step]} />}
      label={`Multiplying two ${N} by ${N} matrices. Computed naively, every output reads a full row and column from memory, ${fmt(READS.naive)} reads in total. With ${T} by ${T} tiles held in fast on-chip memory, the same product needs ${fmt(READS.tiled)} reads.`}
    >
      <Matrix at={SPOT.A} name="A" lit={litA} color={K.cpu} />
      <Matrix at={SPOT.B} name="B" lit={litB} color={K.gpu} />
      <Matrix at={SPOT.C} name="C" lit={() => false} color={K.green} shade={shadeC} />

      <motion.g {...fade(!naive)}>
        <rect x={SRAM.x} y={SRAM.y} width={SRAM.w} height={SRAM.h} rx={6} fill={K.memSoft} opacity={0.5} stroke={K.mem} strokeWidth={0.75} />
        <Label x={SRAM.x + SRAM.w / 2} y={SRAM.y - 10} size={12} fill={K.mem} weight={600}>
          {detail ? "shared memory" : "the counter"}
        </Label>
        {[
          { x: SRAM.x + 14, fill: K.cpu },
          { x: SRAM.x + SRAM.w - 14 - T * MINI, fill: K.gpu },
        ].map((m, t) =>
          range(T * T).map((i) => (
            <motion.rect
              key={`${tile}${k}${t}${i}`}
              x={m.x + (i % T) * MINI}
              y={SRAM.y + 22 + Math.floor(i / T) * MINI}
              width={MINI - 1.5}
              height={MINI - 1.5}
              rx={1}
              fill={m.fill}
              initial={{ opacity: 0.15 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: (i % T) * 0.04 }}
            />
          )),
        )}
        <Label x={SRAM.x + SRAM.w / 2} y={SRAM.y + 22 + (T * MINI) / 2} size={14} fill={K.ink}>
          ×
        </Label>
        <Label x={SRAM.x + SRAM.w / 2} y={SRAM.y + SRAM.h - 22} size={10} fill={K.ink}>
          {detail ? `tile ${tile + 1} of 4, k-step ${k + 1} of 2` : "reuse every number 4 times"}
        </Label>
      </motion.g>

      <g>
        <Label x={SRAM.x} y={40} size={11} anchor="start" fill={K.ink} weight={600}>
          {detail ? "reads from HBM" : "trips to the warehouse"}
        </Label>
        {[
          { name: "naive", value: READS.naive, y: 64, fill: K.slate, shown: true },
          { name: `tiled, T = ${T}`, value: READS.tiled, y: 100, fill: K.green, shown: step >= 3 },
        ].map((b) => (
          <motion.g key={b.name} {...fade(b.shown)}>
            <Label x={SRAM.x} y={b.y - 9} size={10} anchor="start">
              {b.name}
            </Label>
            <Box x={SRAM.x} y={b.y} width={(b.value / READS.naive) * SRAM.w} height={10} fill={b.fill} />
            <Num x={SRAM.x + SRAM.w} y={b.y - 9} value={b.value} format={(v) => fmt(v)} anchor="end" size={11} fill={K.ink} weight={600} />
          </motion.g>
        ))}
      </g>

      <motion.g {...fade(naive)}>
        <Label x={SPOT.C.x + SIZE / 2} y={SPOT.C.y + SIZE + 18} size={11} fill={K.ink}>
          {`one output reads ${2 * N} numbers`}
        </Label>
      </motion.g>
      <motion.g {...fade(step >= 3)}>
        <Label x={SPOT.C.x + SIZE / 2} y={SPOT.C.y + SIZE + 18} size={11} fill={K.ink}>
          {`${T}× fewer reads`}
        </Label>
      </motion.g>
    </Figure>
  );
}
