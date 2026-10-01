"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import {
  BATCHES,
  DATA,
  EPOCHS,
  INIT,
  N_ROWS,
  TRAINING,
  encode,
  fmt,
} from "../model";
import { Axes, Figure, K, Label, Sym, fade, plane, useMotion } from "../svg";

const CODE = `Z = X @ W_encoder + b_encoder
X_hat = Z @ W_decoder + b_decoder

for epoch in range(${EPOCHS}):
    idx = rng.permutation(len(X))
    for rows in np.split(idx, ${BATCHES}):
        grads = gradients(X[rows])
        for p, g in zip(params, grads):
            p -= lr * g`;

const FOCUS: Focus[][] = [
  [[0, "X"]],
  [0, 1],
  [3, 4],
  [5],
  [6, 7, 8],
  [3, 4, 5, 6, 7, 8],
];

const TOP = 40;
const RH = 2.7;
const GAP = 9;
const PER_BATCH = N_ROWS / BATCHES;
const COL = { x0: 14, x1: 34, z: 74, w: 18 };

const PL = plane({ x: [0.2, 3.8], y: [0, 2.4] }, 162, 30, 74);
const CURVE = { x: 162, y: 252, w: PL.box.w, h: 92 };

const range = (vals: number[]) => [Math.min(...vals), Math.max(...vals)];
const [a0, a1] = range(DATA.map((d) => d[0]));
const [b0, b1] = range(DATA.map((d) => d[1]));
const Z = DATA.map((x) => encode(INIT, x));
const [z0, z1] = range(Z);
const shade = (v: number, lo: number, hi: number) =>
  0.12 + (0.78 * (v - lo)) / (hi - lo);

const POSITION = new Map(TRAINING.firstOrder.map((row, pos) => [row, pos]));

const curveY = (l: number) =>
  CURVE.y + CURVE.h * (-Math.log10(Math.max(l, 0.01)) / 2);
const CURVE_PATH = TRAINING.losses
  .map(
    (l, i) =>
      `${i ? "L" : "M"} ${(CURVE.x + (i / (TRAINING.losses.length - 1)) * CURVE.w).toFixed(1)} ${curveY(l).toFixed(1)}`,
  )
  .join(" ");

export default function BatchVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const shuffled = step >= 2;
  const split = step >= 3;
  const oneBatch = step === 4;
  const trained = step >= 5;

  const rowY = (i: number) => {
    if (!shuffled) return TOP + i * RH;
    const pos = POSITION.get(i)!;
    return TOP + pos * RH + (split ? Math.floor(pos / PER_BATCH) * GAP : 0);
  };
  const inFirstBatch = (i: number) => POSITION.get(i)! < PER_BATCH;
  const batchTop = (b: number) => TOP + b * PER_BATCH * RH + b * GAP;

  return (
    <Figure
      viewBox="0 0 440 372"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A dataset of 100 rows shown as a matrix and as points. The rows are shuffled, divided into five batches, and each batch produces one update of the weights."
    >
      <Sym x={COL.x1 - 1} y={12} size={15}>
        X
      </Sym>
      <Label x={COL.x1 - 1} y={27} size={9} mono fill="#9ca3af">
        (100, 2)
      </Label>
      <motion.g {...fade(step >= 1)}>
        <Sym x={COL.z + COL.w / 2} y={12} size={15} fill={K.z}>
          Z
        </Sym>
        <Label x={COL.z + COL.w / 2 + 4} y={27} size={9} mono fill="#9ca3af">
          (100, 1)
        </Label>
      </motion.g>

      {DATA.map((x, i) => (
        <motion.g
          key={i}
          initial={false}
          animate={{
            y: rowY(i),
            opacity: oneBatch && !inFirstBatch(i) ? 0.22 : 1,
          }}
          transition={motionFor.spring(
            shuffled && !split ? (i % 25) * 0.008 : 0,
          )}
        >
          <rect
            x={COL.x0}
            width={COL.w}
            height={RH - 0.5}
            fill={K.x}
            opacity={shade(x[0], a0, a1)}
          />
          <rect
            x={COL.x1 + 2}
            width={COL.w}
            height={RH - 0.5}
            fill={K.x}
            opacity={shade(x[1], b0, b1)}
          />
          <motion.rect
            x={COL.z}
            width={COL.w}
            height={RH - 0.5}
            fill={K.z}
            initial={false}
            animate={{ opacity: step >= 1 ? shade(Z[i], z0, z1) : 0 }}
            transition={{ duration: 0.4, delay: step >= 1 ? i * 0.004 : 0 }}
          />
        </motion.g>
      ))}

      <motion.g {...fade(step <= 1)}>
        <rect
          x={COL.x0 - 3}
          y={TOP - 2}
          width={COL.z + COL.w - COL.x0 + 6}
          height={RH + 3}
          fill="none"
          stroke={K.x}
          rx={1.5}
        />
        <Label
          x={COL.z + COL.w + 8}
          y={TOP + 1}
          size={10}
          fill={K.x}
          anchor="start"
        >
          ←
        </Label>
        <Sym x={COL.z + COL.w + 26} y={TOP + 1} size={14}>
          x
        </Sym>
      </motion.g>

      {Array.from({ length: BATCHES }, (_, b) => (
        <motion.g key={b} {...fade(split, 0.3 + b * 0.06)}>
          <path
            d={`M ${COL.z + COL.w + 6} ${batchTop(b)} h 4 V ${batchTop(b) + PER_BATCH * RH - 0.5} h -4`}
            fill="none"
            stroke={oneBatch && b === 0 ? K.x : K.faint}
          />
          <Label
            x={COL.z + COL.w + 16}
            y={batchTop(b) + (PER_BATCH * RH) / 2}
            size={10}
            fill={oneBatch && b > 0 ? "#c4c9d1" : K.muted}
            anchor="start"
          >
            {`batch ${b + 1}`}
          </Label>
        </motion.g>
      ))}

      <Axes pl={PL} />
      {DATA.map((x, i) => {
        const [cx, cy] = PL.p(x);
        const faded = oneBatch && !inFirstBatch(i);
        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={i === 0 && step <= 1 ? 4.5 : 3}
            fill={K.x}
            initial={false}
            animate={{
              opacity: faded ? 0.12 : i === 0 && step <= 1 ? 1 : 0.55,
            }}
            transition={{ duration: 0.4 }}
          />
        );
      })}
      <motion.g {...fade(step <= 1)}>
        <circle
          cx={PL.p(DATA[0])[0]}
          cy={PL.p(DATA[0])[1]}
          r={9}
          fill="none"
          stroke={K.x}
          strokeOpacity={0.5}
        />
      </motion.g>

      <motion.g {...fade(oneBatch)}>
        <Label x={CURVE.x} y={CURVE.y + 8} size={12} fill={K.x} anchor="start">
          20 rows → gradients averaged over the batch
        </Label>
        <Label
          x={CURVE.x}
          y={CURVE.y + 28}
          size={12}
          fill={K.opInk}
          anchor="start"
        >
          → one update of every weight
        </Label>
        <Label
          x={CURVE.x}
          y={CURVE.y + 58}
          size={11}
          fill={K.muted}
          anchor="start"
        >
          {`${BATCHES} batches = ${BATCHES} updates = 1 epoch`}
        </Label>
      </motion.g>

      <motion.g {...fade(trained)}>
        <line
          x1={CURVE.x}
          x2={CURVE.x}
          y1={CURVE.y}
          y2={CURVE.y + CURVE.h}
          stroke={K.faint}
        />
        <line
          x1={CURVE.x}
          x2={CURVE.x + CURVE.w}
          y1={CURVE.y + CURVE.h}
          y2={CURVE.y + CURVE.h}
          stroke={K.faint}
        />
        {[0, 10, 20, 30, 40].map((e) => (
          <Label
            key={e}
            x={CURVE.x + (e / EPOCHS) * CURVE.w}
            y={CURVE.y + CURVE.h + 11}
            size={9}
            fill="#9ca3af"
          >
            {e}
          </Label>
        ))}
        <Label
          x={CURVE.x + CURVE.w}
          y={CURVE.y + CURVE.h + 24}
          size={10}
          fill={K.muted}
          anchor="end"
        >
          epochs
        </Label>
        <Label
          x={CURVE.x + 6}
          y={CURVE.y - 4}
          size={10}
          fill={K.grad}
          anchor="start"
        >
          {fmt(TRAINING.losses[0], 2)}
        </Label>
        <Label
          x={CURVE.x + CURVE.w}
          y={CURVE.y + 4}
          size={10}
          fill={K.muted}
          anchor="end"
        >
          dataset loss, log scale
        </Label>
        <Label
          x={CURVE.x + CURVE.w}
          y={curveY(TRAINING.losses[TRAINING.losses.length - 1]) - 10}
          size={10}
          fill={K.grad}
          anchor="end"
        >
          {fmt(TRAINING.losses[TRAINING.losses.length - 1], 3)}
        </Label>
        <motion.path
          d={CURVE_PATH}
          fill="none"
          stroke={K.grad}
          strokeWidth={1.5}
          initial={false}
          animate={{ pathLength: trained ? 1 : 0 }}
          transition={motionFor.draw(0, 1.4)}
        />
      </motion.g>
    </Figure>
  );
}
