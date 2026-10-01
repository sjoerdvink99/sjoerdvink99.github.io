"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, fade, useMotion } from "@/components/blog/svg";
import { DOG, VECS, WORDS, fmt } from "../model";
import { Calc, K, Num, type Line } from "../svg";

const CODE = `x = X[0]                    # dog
scores = X @ x
weights = softmax(scores)
output = weights @ X`;

const FOCUS: Focus[][] = [[0], [1], [1], [2], [2], [3]];

/* The plane on the left. */
const DOM = { x: [-0.5, 1.2], y: [-0.1, 1.1] };
const S = 108;
const LEFT = 16;
const TOP = 38;
const px = (v: number) => LEFT + (v - DOM.x[0]) * S;
const py = (v: number) => TOP + (DOM.y[1] - v) * S;
const O: [number, number] = [px(0), py(0)];
const at = (v: number[]): [number, number] => [px(v[0]), py(v[1])];

/* The table on the right. */
const ROW_Y = [74, 108, 142];
const COL = { word: 238, vec: 322, val: 392, bar: 414 };
const BAR = 38;

function Arrow({
  from,
  to,
  color,
  width = 1.75,
  opacity = 1,
}: {
  from: [number, number];
  to: [number, number];
  color: string;
  width?: number;
  opacity?: number;
}) {
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const wing = (s: number) =>
    `${(to[0] - 7 * Math.cos(a + s)).toFixed(1)} ${(to[1] - 7 * Math.sin(a + s)).toFixed(1)}`;
  return (
    <motion.g
      initial={false}
      animate={{ opacity }}
      transition={{ duration: 0.5 }}
      stroke={color}
      strokeWidth={width}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} />
      <path d={`M ${wing(0.42)} L ${to[0]} ${to[1]} L ${wing(-0.42)}`} />
    </motion.g>
  );
}

const vec = (v: number[]) => `[${v.map((x) => fmt(x, 1)).join(", ")}]`;
const term = (a: number, b: number) =>
  `${fmt(a, 1)}×${b < 0 ? `(${fmt(b, 1)})` : fmt(b, 1)}`;

const LINES: Line[][] = [
  [],
  [`dog · dog = ${term(1, 1)} + ${term(0.5, 0.5)} = ${fmt(DOG.scores[0])}`],
  WORDS.map(
    (w, i) =>
      `dog · ${w} = ${term(VECS[0][0], VECS[i][0])} + ${term(VECS[0][1], VECS[i][1])} = ${fmt(DOG.scores[i])}`,
  ),
  [
    ...DOG.scores.map((s, i) => `exp(${fmt(s)}) = ${fmt(DOG.exps[i])}`),
  ],
  [
    ...DOG.exps.map(
      (e, i) => `${fmt(e)} / ${fmt(DOG.total)} = ${fmt(DOG.weights[i])}`,
    ),
  ],
  [
    `${DOG.weights.map((w, i) => `${fmt(w)}·${WORDS[i]}`).join(" + ")}`,
    `= ${DOG.weights.map((w, i) => `${fmt(w)}×${vec(VECS[i])}`).join(" + ")}`,
    { text: `= [${DOG.out.map((v) => fmt(v)).join(", ")}]`, color: K.v },
  ],
];

const HEADER = ["", "dog · x", "dog · x", "exp", "weight", "weight"];

export default function SimilarityVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const selected = step >= 1;
  const mixing = step >= 5;

  const column =
    step >= 4 ? DOG.weights : step === 3 ? DOG.exps : DOG.scores;
  const max = Math.max(...column);
  const shown = (i: number) => step >= 2 || (step === 1 && i === 0);

  /* Tip-to-tail path of the weighted sum. */
  const tips: [number, number][] = [[0, 0]];
  DOG.weights.forEach((w, i) => {
    const [x, y] = tips[i];
    tips.push([x + w * VECS[i][0], y + w * VECS[i][1]]);
  });

  return (
    <Figure
      viewBox="0 0 460 286"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Three vectors, dog, puppy and car. Their dot products with dog are turned into weights by softmax, and the weighted sum of the three vectors is a new vector for dog."
    >
      {/* plane */}
      <rect
        x={px(DOM.x[0])}
        y={py(DOM.y[1])}
        width={(DOM.x[1] - DOM.x[0]) * S}
        height={(DOM.y[1] - DOM.y[0]) * S}
        rx={6}
        fill="#fff"
        stroke={K.faint}
      />
      <g stroke="#c4c9d1">
        <line x1={px(DOM.x[0])} x2={px(DOM.x[1])} y1={O[1]} y2={O[1]} />
        <line x1={O[0]} x2={O[0]} y1={py(DOM.y[0])} y2={py(DOM.y[1])} />
      </g>

      {VECS.map((v, i) => {
        const tip = at(v);
        const faded = mixing ? 0.25 : selected && i !== 0 ? 0.55 : 1;
        return (
          <g key={i}>
            <Arrow from={O} to={tip} color={K.x} opacity={faded} />
            <motion.g
              initial={false}
              animate={{ opacity: mixing ? 0 : faded }}
              transition={{ duration: 0.5 }}
            >
              <Label
                x={tip[0] + 8}
                y={tip[1] - 9}
                size={12}
                anchor="start"
                fill={K.x}
                weight={i === 0 && selected ? 600 : undefined}
              >
                {WORDS[i]}
              </Label>
            </motion.g>
          </g>
        );
      })}

      {DOG.weights.map((_, i) => (
        <motion.g key={i} {...fade(mixing, 0.25 + i * 0.25)}>
          <Arrow from={at(tips[i])} to={at(tips[i + 1])} color={K.v} width={1.25} opacity={0.6} />
        </motion.g>
      ))}
      <motion.g {...fade(mixing, 1.1)}>
        <Arrow from={O} to={at(DOG.out)} color={K.v} width={2} />
        <circle cx={at(DOG.out)[0]} cy={at(DOG.out)[1]} r={3} fill={K.v} />
        <Label x={at(DOG.out)[0] - 8} y={at(DOG.out)[1] - 12} size={12} anchor="end" fill={K.v}>
          new dog
        </Label>
      </motion.g>

      {/* table */}
      <motion.g {...fade(step >= 1)}>
        <Label x={COL.val} y={ROW_Y[0] - 28} size={10} fill={K.muted}>
          {HEADER[step]}
        </Label>
      </motion.g>
      {WORDS.map((w, i) => (
        <g key={w}>
          <Label x={COL.word} y={ROW_Y[i]} size={12} anchor="start" fill={K.x} weight={i === 0 && selected ? 600 : undefined}>
            {w}
          </Label>
          <Label x={COL.vec} y={ROW_Y[i]} size={12} mono fill={K.muted}>
            {vec(VECS[i])}
          </Label>
          <motion.g {...fade(shown(i))}>
            <Num
              x={COL.val}
              y={ROW_Y[i]}
              value={column[i]}
              size={12}
              fill={step >= 4 ? K.v : K.x}
              weight={500}
            />
            <motion.rect
              x={COL.bar}
              y={ROW_Y[i] - 3}
              height={6}
              rx={1.5}
              initial={false}
              animate={{
                width: Math.max(0, (column[i] / max) * BAR),
                fill: step >= 4 ? K.v : K.muted,
              }}
              transition={motionFor.ease()}
            />
          </motion.g>
        </g>
      ))}
      <motion.g {...fade(step === 3 || step === 4)}>
        <line x1={COL.val - 22} x2={COL.val + 22} y1={ROW_Y[2] + 17} y2={ROW_Y[2] + 17} stroke={K.faint} />
        <Label x={COL.word} y={ROW_Y[2] + 32} size={11} anchor="start" fill={K.muted}>
          sum
        </Label>
        <Num
          x={COL.val}
          y={ROW_Y[2] + 32}
          value={step === 4 ? 1 : DOG.total}
          size={12}
          fill={K.x}
        />
      </motion.g>

      {/* the calculation behind the current step */}
      <Calc y={214} steps={LINES} step={step} gap={22} size={12} />
    </Figure>
  );
}
