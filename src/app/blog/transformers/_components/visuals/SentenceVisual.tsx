"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Figure, Label, fade, useMotion } from "@/components/blog/svg";
import { ATT, TOKENS, X, fmt } from "../model";
import { K, Mat } from "../svg";

const CX = TOKENS.map((_, i) => 50 + i * 90);
const CELL = { w: 22, h: 16 };
const TOP = 128;
const ARC_Y = TOP - 10;
const FOCUS = 2;

const column = (v: number[]) => v.map((x) => [x]);

function arc(from: number, to: number) {
  const x1 = CX[from];
  const x2 = CX[to];
  const lift = 22 + Math.abs(x2 - x1) * 0.32;
  return `M ${x1} ${ARC_Y} Q ${(x1 + x2) / 2} ${ARC_Y - lift} ${x2} ${ARC_Y}`;
}

export default function SentenceVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const asking = step >= 1;
  const mixed = step >= 2;
  const weights = ATT.weights[FOCUS];

  return (
    <Figure
      viewBox="0 0 460 260"
      label="The sentence 'the dog chased the ball'. Each word has its own vector. The word 'chased' draws on the other words, most strongly on 'dog' and 'ball', and its vector becomes a mix of what it gathered."
    >
      {TOKENS.map((t, i) => {
        const focus = i === FOCUS;
        const dim = asking && !focus;
        return (
          <g key={i}>
            <Mat
              x={CX[i] - CELL.w / 2}
              y={TOP}
              cell={CELL}
              values={column(focus && mixed ? ATT.output[FOCUS] : X[i])}
              heat
              numbers={false}
              color={focus && mixed ? K.v : K.x}
            />
            <Label
              x={CX[i]}
              y={TOP + 4 * CELL.h + 20}
              size={14}
              fill={dim ? K.muted : K.x}
              weight={focus && asking ? 600 : undefined}
            >
              {t}
            </Label>
          </g>
        );
      })}

      {TOKENS.map((_, j) =>
        j === FOCUS ? null : (
          <g key={j}>
            <motion.path
              d={arc(FOCUS, j)}
              fill="none"
              stroke={mixed ? K.v : K.faint}
              strokeLinecap="round"
              strokeDasharray={mixed ? undefined : "3 4"}
              initial={false}
              animate={{
                pathLength: asking ? 1 : 0,
                opacity: asking ? 1 : 0,
                strokeWidth: mixed ? 0.75 + weights[j] * 9 : 1.25,
              }}
              transition={motionFor.draw(0.08 * Math.abs(j - FOCUS))}
            />
            <motion.g {...fade(mixed, 0.3)}>
              <Label x={CX[j]} y={TOP + 4 * CELL.h + 40} size={11} fill={K.v}>
                {fmt(weights[j])}
              </Label>
            </motion.g>
          </g>
        ),
      )}

      <motion.g {...fade(asking && !mixed, 0.4)}>
        <Label x={CX[FOCUS]} y={30} size={18} fill={K.muted}>
          ?
        </Label>
      </motion.g>
    </Figure>
  );
}
