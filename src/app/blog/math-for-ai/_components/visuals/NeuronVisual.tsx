"use client";

import { motion, useTransform } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, MathText, fade } from "@/components/blog/svg";
import { NEURON, add, dot, fmt, list, norm, scale, type Vec } from "../model";
import { Arrow, Calc, Clip, Grid, K, arrowPath, plane, useTween, useTweened, type Line } from "../svg";

const CODE = `score = w @ x
score = w @ x + b
side = score > 0
scores = W @ x + b`;

const FOCUS: Focus[][] = [[0], [0], [0, 2], [1, 2], [3]];

const P = plane({ x: [-1.5, 4], y: [-1.2, 3.4], unit: 44, left: 10, top: 8 });
const O = P.at([0, 0]);
const REACH = 12;
const COLORS = [K.ink, K.out, K.slate];

const foot = (w: Vec, b: number) => scale(w, -b / dot(w, w));

function edges(w: Vec, b: number) {
  const along = scale([-w[1], w[0]], REACH / norm(w));
  const out = scale(w, REACH / norm(w));
  const p = add(foot(w, b), along);
  const q = add(foot(w, b), scale(along, -1));
  return { p, q, pOut: add(p, out), qOut: add(q, out) };
}

function Boundary({
  w,
  b,
  color,
  opacity,
  shade = 0,
}: {
  w: Vec;
  b: number;
  color: string;
  opacity: number;
  shade?: number;
}) {
  const transition = useTween();
  const t = useTweened([...w, b]);
  const line = useTransform(t, ([w1, w2, b0]) => {
    const { p, q } = edges([w1, w2], b0);
    return arrowPath([...P.at(p), ...P.at(q)], 0);
  });
  const half = useTransform(t, ([w1, w2, b0]) => {
    const { p, q, pOut, qOut } = edges([w1, w2], b0);
    return `M ${[p, q, qOut, pOut].map((v) => P.at(v).join(" ")).join(" L ")} Z`;
  });
  return (
    <motion.g initial={false} animate={{ opacity }} transition={transition}>
      <motion.path
        d={half}
        fill={K.aSoft}
        initial={false}
        animate={{ opacity: shade }}
        transition={transition}
      />
      <motion.path d={line} stroke={color} strokeWidth={2} fill="none" />
    </motion.g>
  );
}

const { w, bias, probe } = NEURON;
const raw = dot(w, probe);
const LINES: Line[][] = [
  [`w = ${list(w, 0)}`, "score = w · x"],
  ["w · x = 0", "on a line ⟂ w"],
  [`x = ${list(probe, 1)}`, `w · x = ${fmt(raw, 1)} > 0`],
  [
    `b = ${fmt(bias, 0)}`,
    `w · x + b = ${fmt(raw + bias, 1)}`,
    `shift = ${fmt(-bias, 0)} / ‖w‖ = ${fmt(-bias / norm(w))}`,
  ],
  [`${NEURON.layer.length} neurons`, `${NEURON.layer.length} lines`, "W x + b"],
];

export default function NeuronVisual() {
  const { step } = useStage();
  const biased = step >= 3;
  const b = biased ? bias : 0;
  const start = biased ? P.at(foot(w, b)) : O;
  const end = P.at(add(biased ? foot(w, b) : [0, 0], w));
  const [x, y] = P.at(probe);

  return (
    <Figure
      viewBox="0 0 460 220"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Points of two classes and a weight vector w. The points where w dot x plus b is zero form a line at right angles to w. The bias shifts the line until it separates the classes. A layer of three neurons draws three lines."
    >
      <Grid plane={P} />
      <Clip plane={P}>
        <Boundary
          w={w}
          b={b}
          color={K.ink}
          opacity={step >= 1 ? 1 : 0}
          shade={step === 2 || step === 3 ? 0.7 : 0}
        />
        {NEURON.layer.slice(1).map((n, i) => (
          <Boundary key={i} w={n.w} b={n.b} color={COLORS[i + 1]} opacity={step === 4 ? 1 : 0} />
        ))}
      </Clip>

      {NEURON.yes.map((p, i) => (
        <circle key={`y${i}`} cx={P.at(p)[0]} cy={P.at(p)[1]} r={4.5} fill={K.a} />
      ))}
      {NEURON.no.map((p, i) => (
        <circle key={`n${i}`} cx={P.at(p)[0]} cy={P.at(p)[1]} r={4.5} fill={K.b} />
      ))}
      <motion.circle
        cx={x}
        cy={y}
        r={9}
        fill="none"
        stroke={K.ink}
        strokeWidth={1.5}
        {...fade(step === 2 || step === 3)}
      />

      <Arrow from={start} to={end} color={K.ink} width={2.5} opacity={step <= 3 ? 1 : 0} />
      <motion.g {...fade(step <= 3)}>
        <MathText x={end[0] + 6} y={end[1] - 8} size={16}>
          w
        </MathText>
      </motion.g>
      {NEURON.layer.map((n, i) => {
        const from = P.at(foot(n.w, n.b));
        const to = P.at(add(foot(n.w, n.b), scale(n.w, 0.8 / norm(n.w))));
        return (
          <Arrow key={i} from={from} to={to} color={COLORS[i]} width={2} opacity={step === 4 ? 1 : 0} />
        );
      })}

      <Calc x={272} y={60} steps={LINES} step={step} gap={22} />
    </Figure>
  );
}
