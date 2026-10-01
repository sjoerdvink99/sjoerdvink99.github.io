"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { ATT, CAUSAL, MASKED, TOKENS, fmt } from "../model";
import { Calc, ColLabels, K, Mat, RowLabels, WEIGHT_MAX, type Line } from "../svg";

const CODE = `T = scores.size(-1)
ones = torch.ones(T, T, dtype=torch.bool, device=scores.device)
mask = torch.triu(ones, diagonal=1)
scores = scores.masked_fill(mask, float("-inf"))
weights = torch.softmax(scores, dim=-1)`;

const FOCUS: Focus[][] = [[], [1, 2, 3], [4], []];

const CELL = { w: 40, h: 24 };
const AT = { x: 150, y: 46 };
const CHASED = TOKENS.indexOf("chased");
const LAST = TOKENS.length - 1;

const visible = ATT.scaled[CHASED].slice(0, CHASED + 1);
const exps = visible.map(Math.exp);
const total = exps.reduce((a, b) => a + b, 0);
const list = (v: number[], digits = 2) => v.map((x) => fmt(x, digits)).join(", ");

const LINES: Line[][] = [
  [
    "the scaled scores from before",
    `chased (position ${CHASED}) still sees "the ball" after it`,
  ],
  ["every score above the diagonal is a later position", "→ set to −∞"],
  [
    "exp(−∞) = 0, so later positions get weight 0",
    `chased: exp(${list(visible, 0)}) = ${list(exps)}`,
    { text: `        ÷ ${fmt(total)} = ${list(MASKED[CHASED].slice(0, CHASED + 1))}`, color: K.x },
  ],
  [
    `first token: only itself, weight ${fmt(MASKED[0][0])}`,
    "last token: every position, as without the mask",
  ],
];

export default function MaskVisual() {
  const { step } = useStage();
  const masked = step >= 1;
  const soft = step >= 2;
  const rows = step === 2 ? CHASED : step === 3 ? [0, LAST] : null;

  return (
    <Figure
      viewBox="0 0 460 250"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Causal masking. Scores above the diagonal, where a token would look at a later position, are set to minus infinity. After softmax they get weight zero, and each row spreads its weight over the current and earlier positions only."
    >
      <ColLabels x={AT.x} y={AT.y - 12} labels={TOKENS} w={CELL.w} />
      <RowLabels x={AT.x - 8} y={AT.y} labels={TOKENS} h={CELL.h} on={step === 2 ? CHASED : null} />
      <Mat
        x={AT.x}
        y={AT.y}
        cell={CELL}
        values={soft ? MASKED : ATT.scaled}
        heat={soft}
        heatMax={WEIGHT_MAX}
        numbers={!soft}
        rowOn={rows}
      />

      {/* the masked cells */}
      {CAUSAL.map((row, i) =>
        row.map((m, j) =>
          m ? (
            <motion.g key={`${i}${j}`} {...fade(masked && !soft, (i + j) * 0.03)}>
              <rect
                x={AT.x + j * CELL.w + 1}
                y={AT.y + i * CELL.h + 1}
                width={CELL.w - 2}
                height={CELL.h - 2}
                fill="#fff"
              />
              <Label x={AT.x + (j + 0.5) * CELL.w} y={AT.y + (i + 0.5) * CELL.h} size={11} fill={K.muted}>
                −∞
              </Label>
            </motion.g>
          ) : null,
        ),
      )}

      {/* numbers for the rows being discussed */}
      <motion.g {...fade(step === 2, 0.3)}>
        {MASKED[CHASED].map((w, j) => (
          <Label
            key={j}
            x={AT.x + (j + 0.5) * CELL.w}
            y={AT.y + (CHASED + 0.5) * CELL.h}
            size={11}
            fill={w / WEIGHT_MAX > 0.6 ? "#fff" : K.x}
          >
            {fmt(w)}
          </Label>
        ))}
      </motion.g>
      <motion.g {...fade(step === 3, 0.3)}>
        <Label x={AT.x + 0.5 * CELL.w} y={AT.y + 0.5 * CELL.h} size={11} fill="#fff">
          {fmt(MASKED[0][0])}
        </Label>
      </motion.g>

      <Calc y={196} steps={LINES} step={step} />
    </Figure>
  );
}
