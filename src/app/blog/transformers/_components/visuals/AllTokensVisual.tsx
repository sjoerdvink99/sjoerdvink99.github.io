"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, SPRING, fade } from "@/components/blog/svg";
import { SIM, SIM_OUT, SIM_W, VECS, WORDS, fmt, products, vec } from "../model";
import { Calc, ColLabels, K, Mat, Name, Op, RowLabels, WEIGHT_MAX, type Line } from "../svg";

const CODE = `scores = X @ X.T
weights = softmax(scores, axis=-1)
output = weights @ X`;

const FOCUS: Focus[][] = [[0], [0], [1], [2]];

const CELL = { w: 40, h: 26 };
const CAR = 2;
const carExps = SIM[CAR].map(Math.exp);
const carTotal = carExps.reduce((a, b) => a + b, 0);
const list = (v: number[]) => v.map((x) => fmt(x)).join(", ");

const LINES: Line[][] = [
  [`dog · puppy = ${products(VECS[0], VECS[1])} = ${fmt(SIM[0][1])}`],
  [`S[dog, car] = S[car, dog] = ${fmt(SIM[0][CAR])}`],
  [
    `car: exp(${SIM[CAR].map((v) => fmt(v)).join("), exp(")})`,
    `   = ${list(carExps)}`,
    `   ÷ ${fmt(carTotal)} = ${list(SIM_W[CAR])}`,
  ],
  [
    `car: ${SIM_W[CAR].map((w, j) => `${fmt(w)}×${vec(VECS[j])}`).join(" + ")}`,
    { text: `   = ${vec(SIM_OUT[CAR], 2)}`, color: K.v },
  ],
];
const TOP = 70;
const N = WORDS.length;

export default function AllTokensVisual() {
  const { step } = useStage();
  const all = step >= 1;
  const soft = step >= 2;
  const product = step >= 3;
  const left = product ? 64 : 170;

  return (
    <Figure
      viewBox="0 0 460 300"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The dot products of every token with every token form a three by three matrix. Softmax turns each row into weights that sum to one. Multiplying the weights by X gives a new vector for every token."
    >
      <motion.g
        initial={false}
        animate={{ x: left }}
        transition={SPRING}
      >
        <ColLabels x={0} y={TOP - 12} labels={WORDS} w={CELL.w} />
        <motion.g {...fade(!product)}>
          <Label x={(N * CELL.w) / 2} y={TOP - 34} size={10} fill={K.shape}>
            looked at →
          </Label>
          <Label x={-8} y={TOP - 12} size={10} anchor="end" fill={K.shape}>
            asking ↓
          </Label>
        </motion.g>
        <RowLabels x={-8} y={TOP} labels={WORDS} h={CELL.h} on={all ? (soft ? CAR : null) : 0} />
        <Mat
          x={0}
          y={TOP}
          cell={CELL}
          values={soft ? SIM_W : SIM}
          heat={soft}
          heatMax={WEIGHT_MAX}
          color={K.x}
          rowsShown={all ? N : 1}
          size={12}
        />
        <Name x={N * CELL.w / 2} y={TOP + N * CELL.h + 20} shape="(T, T)">
          {soft ? "A" : "S"}
        </Name>

        <motion.g {...fade(soft && !product, 0.3)}>
          {SIM_W.map((_, i) => (
            <Label
              key={i}
              x={N * CELL.w + 26}
              y={TOP + i * CELL.h + CELL.h / 2}
              size={11}
              fill={K.muted}
            >
              Σ 1.00
            </Label>
          ))}
        </motion.g>

        {/* the mirror pair: S is symmetric */}
        <motion.g {...fade(step === 1, 0.4)}>
          {[
            [0, 2],
            [2, 0],
          ].map(([i, j]) => (
            <rect
              key={`${i}${j}`}
              x={j * CELL.w + 1.5}
              y={TOP + i * CELL.h + 1.5}
              width={CELL.w - 3}
              height={CELL.h - 3}
              rx={2}
              fill="none"
              stroke={K.x}
              strokeWidth={1.5}
            />
          ))}
        </motion.g>
      </motion.g>


      <motion.g {...fade(product, 0.35)}>
        <Op x={204} y={TOP + (N * CELL.h) / 2}>@</Op>
        <Mat x={222} y={TOP} cell={CELL} values={VECS} digits={1} size={12} />
        <Name x={222 + CELL.w} y={TOP + N * CELL.h + 20} shape="(T, D)">
          X
        </Name>
        <Op x={322} y={TOP + (N * CELL.h) / 2}>=</Op>
        <Mat
          x={340}
          y={TOP}
          cell={CELL}
          values={SIM_OUT}
          color={K.v}
          rowOn={CAR}
          size={12}
        />
        <Name x={340 + CELL.w} y={TOP + N * CELL.h + 20} shape="(T, D)" fill={K.v}>
          output
        </Name>
      </motion.g>
      <Calc y={232} steps={LINES} step={step} />
    </Figure>
  );
}
