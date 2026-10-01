"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, Sym, fade } from "@/components/blog/svg";
import { ATT, P, SWAPPED, SWAPPED_ATT, TOKENS, X, X_POS } from "../model";
import { K, Mat, Op } from "../svg";

const CODE = `X = token_emb(tokens) + pos_emb(positions)    # (T, D) + (T, D)`;
const FOCUS: Focus[][] = [[], [0], [0]];

const CELL = { w: 34, h: 22 };
const ROW = [56, 112, 168];
const COLS = [70, 290];
const AT = [0, 3];

/* Where "dog" sits in each word order. */
const DOG_AT = [TOKENS.indexOf("dog"), SWAPPED.indexOf("dog")];
const ORDERS = [
  { words: TOKENS, out: ATT.output[DOG_AT[0]] },
  { words: SWAPPED, out: SWAPPED_ATT.output[DOG_AT[1]] },
];

export default function PositionVisual() {
  const { step } = useStage();
  const order = step === 0;
  const second = step >= 2;

  return (
    <Figure
      viewBox="0 0 460 236"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Without positions, swapping dog and ball leaves the output for dog unchanged. A position vector of the same width is added to each token vector, so the word 'the' at position 0 and at position 3 gets two different vectors."
    >
      {/* word order is invisible to attention */}
      <motion.g {...fade(order)}>
        {ORDERS.map((o, k) => {
          const y = 40 + k * 96;
          return (
            <g key={k}>
              {o.words.map((w, i) => (
                <Label
                  key={i}
                  x={46 + i * 60}
                  y={y}
                  size={13}
                  fill={i === DOG_AT[k] ? K.x : K.muted}
                  weight={i === DOG_AT[k] ? 600 : undefined}
                >
                  {w}
                </Label>
              ))}
              <Label x={30} y={y + 34} size={11} anchor="start" fill={K.muted}>
                output for dog
              </Label>
              <Mat x={150} y={y + 23} cell={CELL} values={[o.out]} color={K.v} />
            </g>
          );
        })}
        <Label x={300} y={170} size={11} anchor="start" fill={K.v}>
          identical
        </Label>
      </motion.g>

      {/* token + position, the same width */}
      {AT.map((pos, c) => {
        const x = COLS[c];
        const show = !order && (c === 0 || second);
        return (
          <motion.g key={pos} {...fade(show, c * 0.2)}>
            <Label x={x - 10} y={ROW[0] + 11} size={11} anchor="end" fill={K.x}>
              the
            </Label>
            <Mat x={x} y={ROW[0]} cell={CELL} values={[X[pos]]} digits={1} />
            <Op x={x + 2 * CELL.w} y={ROW[0] + 39}>
              +
            </Op>
            <Label x={x - 10} y={ROW[1] + 11} size={11} anchor="end" fill={K.pos}>
              {`pos ${pos}`}
            </Label>
            <Mat x={x} y={ROW[1]} cell={CELL} values={[P[pos]]} digits={1} color={K.pos} />
            <Op x={x + 2 * CELL.w} y={ROW[1] + 39}>
              =
            </Op>
            <Mat x={x} y={ROW[2]} cell={CELL} values={[X_POS[pos]]} digits={1} />
            <Sym x={x + 2 * CELL.w} y={ROW[2] + 42} size={13} sub={String(pos)} fill={K.x}>
              x
            </Sym>
          </motion.g>
        );
      })}

      {/* not a fifth axis */}
      <motion.g {...fade(step === 1, 0.4)}>
        <rect
          x={COLS[0] + 4 * CELL.w + 6}
          y={ROW[2]}
          width={CELL.w}
          height={CELL.h}
          rx={2}
          fill="none"
          stroke={K.faint}
          strokeDasharray="3 3"
        />
        <Label x={COLS[0] + 4.5 * CELL.w + 6} y={ROW[2] + CELL.h / 2} size={12} fill={K.muted}>
          ×
        </Label>
        <Label x={COLS[0] + 5 * CELL.w + 16} y={ROW[2] + CELL.h / 2} size={11} anchor="start" fill={K.muted}>
          no extra dimension
        </Label>
      </motion.g>
    </Figure>
  );
}
