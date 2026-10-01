"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, fade, useMotion } from "@/components/blog/svg";
import { ATT, TOKENS, W_K, W_Q, W_V, X, fmt, vec } from "../model";
import { Calc, K, Mat, Name, Op, RowLabels, type Line } from "../svg";

const CODE = `Q = X @ W_Q
K = X @ W_K
V = X @ W_V`;

const FOCUS: Focus[][] = [
  [
    [0, "X"],
    [1, "X"],
    [2, "X"],
  ],
  [0],
  [1, 2],
  [0, 1, 2],
];

const CELL = { w: 24, h: 16 };
const X_AT = { x: 54, y: 125 };
const W_X = 196;
const R_X = 322;
const ROW_MID = [60, 165, 270];
const CHASED = 2;

const DOG = 1;

/** x @ W adds up the rows of W, each scaled by an entry of x. */
function rowsUsed(x: number[]) {
  return x
    .map((v, i) => (v === 0 ? null : `${v === 1 ? "" : `${fmt(v, 1)} × `}row ${i + 1}`))
    .filter(Boolean)
    .join(" + ");
}

const LINES: Line[][] = [
  [`x @ W adds up rows of W, each scaled by an entry of x`],
  [
    `x_chased = ${vec(X[CHASED])}  →  ${rowsUsed(X[CHASED])} of W_Q`,
    { text: `q_chased = ${vec(ATT.Q[CHASED])}`, color: K.q },
  ],
  [
    `x_dog = ${vec(X[DOG])}  →  ${rowsUsed(X[DOG])} of W_V`,
    `v_dog = ${vec(W_V[0])} + ${vec(W_V[3])}`,
    { text: `      = ${vec(ATT.V[DOG])}`, color: K.v },
  ],
  [
    `chased:  q ${vec(ATT.Q[CHASED])}   k ${vec(ATT.K[CHASED])}`,
    `         v ${vec(ATT.V[CHASED])}`,
  ],
];

const ROLES = [
  { name: "Q", w: W_Q, out: ATT.Q, color: K.q, ink: K.q },
  { name: "K", w: W_K, out: ATT.K, color: K.k, ink: K.kInk },
  { name: "V", w: W_V, out: ATT.V, color: K.v, ink: K.v },
];

export default function ProjectionVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const shown = (r: number) => (r === 0 ? step >= 1 : step >= 2);
  const row = step === 1 || step === 3 ? CHASED : step === 2 ? DOG : null;
  const wRows = (i: number) =>
    step === 1 && i === 0 ? 1 : step === 2 && i === 2 ? [0, 3] : null;
  const outRow = (i: number) => (step === 2 ? (i === 2 ? DOG : null) : row);
  const xMid = X_AT.y + (5 * CELL.h) / 2;

  return (
    <Figure
      viewBox="0 0 460 396"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The token matrix X is multiplied by three weight matrices, giving queries Q, keys K and values V. Each token keeps its own row in all three."
    >
      <RowLabels x={X_AT.x - 8} y={X_AT.y} labels={TOKENS} h={CELL.h} on={row} />
      <Mat x={X_AT.x} y={X_AT.y} cell={CELL} values={X} digits={1} size={10} rowOn={row} />
      <Name x={X_AT.x + 2 * CELL.w} y={X_AT.y + 5 * CELL.h + 18} shape="(T, D)">
        X
      </Name>

      {ROLES.map((r, i) => {
        const mid = ROW_MID[i];
        const show = shown(i);
        return (
          <g key={r.name}>
            <motion.path
              d={`M ${X_AT.x + 4 * CELL.w + 6} ${xMid} C ${X_AT.x + 4 * CELL.w + 30} ${xMid}, ${W_X - 30} ${mid}, ${W_X - 8} ${mid}`}
              fill="none"
              stroke={r.color}
              strokeWidth={1.25}
              initial={false}
              animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
              transition={motionFor.draw()}
            />
            <motion.g {...fade(show, 0.25)}>
              <Mat
                x={W_X}
                y={mid - 2 * CELL.h}
                cell={CELL}
                values={r.w}
                digits={1}
                size={10}
                color={r.color}
                rowOn={wRows(i)}
              />
              <Name x={W_X + 2 * CELL.w} y={mid + 2 * CELL.h + 13} sub={r.name} fill={r.ink}>
                W
              </Name>
              <Op x={W_X + 4 * CELL.w + 13} y={mid}>
                =
              </Op>
              <Mat
                x={R_X}
                y={mid - 2.5 * CELL.h}
                cell={CELL}
                values={r.out}
                digits={1}
                size={10}
                color={r.color}
                rowOn={outRow(i)}
              />
              <Name x={R_X + 4 * CELL.w + 20} y={mid - 4} shape="(T, D)" fill={r.ink}>
                {r.name}
              </Name>
            </motion.g>
          </g>
        );
      })}
      <Calc y={342} steps={LINES} step={step} />
    </Figure>
  );
}
