"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { number } from "@/components/blog/Chapters";
import { Figure, Label, fade } from "@/components/blog/svg";
import { TRAINING, fmt } from "../model";
import { CHAPTERS } from "../chapters";
import { K, plane, useTween } from "../svg";

const CODE = `for step in range(${TRAINING.steps}):
    logits = X @ W + b
    P = softmax(logits)
    loss = -np.log(P[np.arange(n), y]).mean()
    g = (P - Y) / n
    dW, db = X.T @ g, g.sum(axis=0)
    W -= lr * dW
    b -= lr * db`;

const FOCUS: Focus[][] = [[1], [2], [3], [4, 5], [6, 7], [0]];
const USES = [[0, 1, 2], [5], [5], [4, 2], [3], [0, 1, 2, 3, 4, 5]];

const P = plane({ x: [0, TRAINING.steps], y: [0, 1.2], unit: [6, 110], left: 60, top: 14 });
const { losses } = TRAINING;
const first = P.at([0, losses[0]]);
const last = P.at([losses.length - 1, losses[losses.length - 1]]);
const CURVE = losses
  .map((v, i) => `${i ? "L" : "M"} ${P.px(i).toFixed(1)} ${P.py(v).toFixed(1)}`)
  .join(" ");

function Uses({ step }: { step: number }) {
  return (
    <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em]">
      {CHAPTERS.map((c, i) => {
        const on = USES[step].includes(i);
        return (
          <li
            key={c.id}
            className={`flex items-center gap-1.5 transition-colors duration-500 ${on ? c.ink : "text-gray-300"}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${on ? c.dot : "bg-gray-200"}`}
              aria-hidden
            />
            <span className="tabular-nums">{number(i)}</span> {c.name}
          </li>
        );
      })}
    </ul>
  );
}

export default function TrainingVisual() {
  const { step } = useStage();
  const done = step === 5;
  const transition = useTween(done ? 1.6 : 0.3);

  return (
    <Figure
      viewBox="0 0 460 172"
      top={
        <>
          <Code code={CODE} focus={FOCUS[step]} />
          <Uses step={step} />
        </>
      }
      label={`The training loss of a small classifier, falling from ${fmt(losses[0])} to ${fmt(losses[losses.length - 1])} over ${TRAINING.steps} steps.`}
    >
      <line x1={P.left} x2={P.left + P.width} y1={P.py(0)} y2={P.py(0)} stroke={K.axis} />
      <line x1={P.left} x2={P.left} y1={P.top} y2={P.py(0)} stroke={K.axis} />
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={P.left} x2={P.left + P.width} y1={P.py(t)} y2={P.py(t)} stroke={K.grid} />
          <Label x={P.left - 8} y={P.py(t)} size={10} anchor="end">
            {fmt(t, 1)}
          </Label>
        </g>
      ))}
      {[0, TRAINING.steps / 2, TRAINING.steps].map((t) => (
        <Label key={t} x={P.px(t)} y={P.py(0) + 13} size={10}>
          {t}
        </Label>
      ))}
      <Label x={P.left - 8} y={P.top - 4} size={10} anchor="end" fill={K.ink}>
        loss
      </Label>
      <Label x={P.left + P.width + 6} y={P.py(0)} size={10} anchor="start" fill={K.ink}>
        step
      </Label>

      <motion.path
        d={CURVE}
        stroke={K.green}
        strokeWidth={2.5}
        fill="none"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
        transition={transition}
      />
      <motion.g {...fade(step >= 2)}>
        <circle cx={first[0]} cy={first[1]} r={4.5} fill={K.green} />
        <Label x={first[0] + 10} y={first[1] - 10} size={11} anchor="start" fill={K.ink}>
          {`ln 3 = ${fmt(losses[0])}`}
        </Label>
      </motion.g>
      <motion.g {...fade(done, 1.4)}>
        <circle cx={last[0]} cy={last[1]} r={4.5} fill={K.green} />
        <Label x={last[0]} y={last[1] - 14} size={11} fill={K.ink}>
          {fmt(losses[losses.length - 1])}
        </Label>
      </motion.g>
    </Figure>
  );
}
