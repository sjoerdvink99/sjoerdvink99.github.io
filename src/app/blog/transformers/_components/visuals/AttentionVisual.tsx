"use client";

import { motion, useReducedMotion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, SPRING, Sym, fade } from "@/components/blog/svg";
import { ATT, D, TOKENS, fmt, products, vec, weightedSum } from "../model";
import { Calc, ColLabels, K, Mat, Name, Num, RowLabels, WEIGHT_MAX, type Line } from "../svg";

const CODE = `Q = X @ W_Q
K = X @ W_K
V = X @ W_V
scores = Q @ K.T / np.sqrt(d_k)
weights = softmax(scores, axis=-1)
output = weights @ V`;

const FOCUS: Focus[][] = [
  [0, 1],
  [[3, "Q @ K.T"]],
  [[3, "/ np.sqrt(d_k)"]],
  [4],
  [5],
  [5],
  [3, 4, 5],
];

const CELL = { w: 30, h: 20 };
const BOTTOM = 136;
const LEFT = 58;
const GAP = 26;
const CHASED = 2;
const DOG = 1;

const exps = ATT.scaled[CHASED].map(Math.exp);
const total = exps.reduce((a, b) => a + b, 0);
const list = (v: number[], digits = 2) => v.map((x) => fmt(x, digits)).join(", ");
const q = ATT.Q[CHASED];
const k = ATT.K[DOG];

const LINES: Line[][] = [
  [`q_chased = ${vec(q)}    k_dog = ${vec(k)}`],
  [
    `q_chased · k_dog = ${products(q, k)}`,
    { text: `                 = ${fmt(ATT.scores[CHASED][DOG], 1)}`, color: K.x },
  ],
  [`${fmt(ATT.scores[CHASED][DOG], 1)} / √d_k = ${fmt(ATT.scores[CHASED][DOG], 1)} / √${D} = ${fmt(ATT.scores[CHASED][DOG], 1)} / ${Math.sqrt(D)} = ${fmt(ATT.scaled[CHASED][DOG])}`],
  [
    `chased: exp(${list(ATT.scaled[CHASED], 0)})`,
    `      = ${list(exps)}`,
    `      ÷ ${fmt(total)} = ${list(ATT.weights[CHASED])}`,
  ],
  [`weights @ V:  (T, T) @ (T, D) = (T, D)`],
  [
    `chased: ${weightedSum(ATT.weights[CHASED], TOKENS)}`,
    { text: `      = ${vec(ATT.output[CHASED], 2)}`, color: K.v },
  ],
  [`each row: softmax over its scores, then a mix of value rows`],
];

/** K drawn cell by cell, so it can turn into Kᵀ in place. */
function Keys({
  at,
  transposed,
  show,
  hl,
}: {
  at: { x: number; y: number };
  transposed: boolean;
  show: boolean;
  hl: number | null;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.g {...fade(show)}>
      {ATT.K.map((row, i) =>
        row.map((v, j) => {
          const [cx, cy] = transposed ? [i, j] : [j, i];
          const on = hl === null || hl === i;
          return (
            <motion.g
              key={`${i}${j}`}
              initial={false}
              animate={{
                x: at.x + cx * CELL.w,
                y: at.y + cy * CELL.h,
                opacity: on ? 1 : 0.35,
              }}
              transition={reduce ? { duration: 0 } : { ...SPRING, delay: (i + j) * 0.03 }}
            >
              <rect width={CELL.w} height={CELL.h} fill="#f3f4f6" stroke="#fff" />
              <Label x={CELL.w / 2} y={CELL.h / 2} size={11} fill={K.x}>
                {fmt(v, 1)}
              </Label>
            </motion.g>
          );
        }),
      )}
    </motion.g>
  );
}

export default function AttentionVisual() {
  const { step } = useStage();
  const scored = step >= 1;
  const scaled = step >= 2;
  const soft = step >= 3;
  const valued = step >= 4;
  const rowFocus = step === 5 ? CHASED : null;

  /* Once the weights become the left operand, everything shifts right. */
  const leftW = valued ? 5 * CELL.w : 4 * CELL.w;
  const right = LEFT + leftW + GAP;
  const kTop = BOTTOM - 10 - 4 * CELL.h;
  const vTop = BOTTOM - 10 - 5 * CELL.h;

  const middle = soft ? ATT.weights : scaled ? ATT.scaled : ATT.scores;
  const middleName = soft ? "weights" : scaled ? "scores" : "QK";

  return (
    <Figure
      viewBox="0 0 460 350"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Scaled dot-product attention. Q times K transposed gives a five by five score matrix, which is divided by the square root of d_k and passed through a row-wise softmax. The resulting weights multiply V to give the output."
    >
      <RowLabels
        x={LEFT - 8}
        y={BOTTOM}
        labels={TOKENS}
        h={CELL.h}
        on={step === 1 || step === 5 ? CHASED : null}
      />

      {/* Q, then the weights take its place */}
      <Mat
        x={LEFT}
        y={BOTTOM}
        cell={CELL}
        values={ATT.Q}
        digits={1}
        color={K.q}
        show={!valued}
        rowOn={step === 1 ? CHASED : null}
      />
      <motion.g {...fade(!valued)}>
        <Name x={LEFT + 2 * CELL.w} y={BOTTOM + 5 * CELL.h + 18} shape="(T, D)" fill={K.q}>
          Q
        </Name>
      </motion.g>

      {/* K, turned into Kᵀ above the product */}
      <Keys
        at={scored ? { x: right, y: kTop } : { x: right, y: BOTTOM }}
        transposed={scored}
        show={!valued}
        hl={step === 1 ? DOG : null}
      />
      <motion.g {...fade(!valued)}>
        <motion.g
          initial={false}
          animate={{ x: scored ? right - 18 : right + 2 * CELL.w, y: scored ? kTop + 2 * CELL.h : BOTTOM + 5 * CELL.h + 18 }}
          transition={SPRING}
        >
          <Sym x={0} y={0} size={16} sup={scored ? "T" : undefined} fill={K.kInk}>
            K
          </Sym>
        </motion.g>
        <motion.g {...fade(scored)}>
          <ColLabels x={right} y={kTop - 10} labels={TOKENS} w={CELL.w} on={step === 1 ? DOG : null} />
        </motion.g>
      </motion.g>

      {/* QKᵀ → scaled → softmax, all in the same cells */}
      <Mat
        x={valued ? LEFT : right}
        y={BOTTOM}
        cell={CELL}
        values={middle}
        heat={soft}
        heatMax={WEIGHT_MAX}
        show={scored}
        cellOn={step === 1 || step === 2 ? [CHASED, DOG] : null}
        rowOn={step === 3 ? CHASED : rowFocus}
      />
      <motion.g {...fade(scored)}>
        <motion.g
          initial={false}
          animate={{ x: valued ? LEFT : right }}
          transition={SPRING}
        >
          <Name
            x={2.5 * CELL.w}
            y={BOTTOM + 5 * CELL.h + 18}
            sup={middleName === "QK" ? "T" : undefined}
            shape="(T, T)"
          >
            {middleName}
          </Name>
        </motion.g>
      </motion.g>

      {/* the one highlighted dot product */}
      <motion.g {...fade(step === 1, 0.5)}>
        <Label x={right + 5 * CELL.w + 12} y={BOTTOM + 2.5 * CELL.h} size={11} anchor="start" fill={K.x}>
          q·k = {fmt(ATT.scores[CHASED][DOG], 1)}
        </Label>
      </motion.g>
      <motion.g {...fade(step === 2, 0.3)}>
        <Label x={right + 5 * CELL.w + 12} y={BOTTOM + 2.5 * CELL.h} size={11} anchor="start" fill={K.x}>
          ÷ √d_k
        </Label>
      </motion.g>
      <motion.g {...fade(step === 3, 0.3)}>
        {TOKENS.map((_, i) => (
          <Label key={i} x={right + 5 * CELL.w + 24} y={BOTTOM + i * CELL.h + CELL.h / 2} size={10} fill={K.muted}>
            Σ 1.00
          </Label>
        ))}
      </motion.g>

      {/* V above, output below it */}
      <motion.g {...fade(valued, 0.3)}>
        <RowLabels x={right - 8} y={vTop} labels={TOKENS} h={CELL.h} />
        <Mat x={right} y={vTop} cell={CELL} values={ATT.V} digits={1} color={K.v} rowOn={null} />
        <Sym x={right + 4 * CELL.w + 16} y={vTop + 2.5 * CELL.h} size={16} fill={K.v}>
          V
        </Sym>
        <Mat
          x={right}
          y={BOTTOM}
          cell={CELL}
          values={ATT.output}
          color={K.v}
          rowOn={rowFocus}
        />
        <Name x={right + 2 * CELL.w} y={BOTTOM + 5 * CELL.h + 18} shape="(T, D)" fill={K.v}>
          output
        </Name>
      </motion.g>

      {/* the chased row as a weighted sum of value rows */}
      <motion.g {...fade(step === 5, 0.4)}>
        {ATT.weights[CHASED].map((w, j) => (
          <g key={j}>
            <rect
              x={right - 3}
              y={vTop + j * CELL.h + 1}
              width={2}
              height={CELL.h - 2}
              fill={K.v}
              opacity={0.2 + w * 2.4}
            />
            <Num x={right + 4 * CELL.w + 52} y={vTop + j * CELL.h + CELL.h / 2} value={w} size={10} fill={K.muted} />
          </g>
        ))}
        <Label x={right + 4 * CELL.w + 52} y={vTop - 8} size={9} fill={K.shape}>
          weight
        </Label>
      </motion.g>
      <Calc y={296} steps={LINES} step={step} />
    </Figure>
  );
}
