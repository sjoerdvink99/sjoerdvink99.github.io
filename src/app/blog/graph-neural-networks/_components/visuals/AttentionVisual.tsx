"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Morph } from "@/components/blog/Morph";
import { Figure, Label, fade } from "@/components/blog/svg";
import { ATTENTION, NODES, X, list, range, type Edge } from "../model";
import { Arrow, Calc, Clip, Dot, GraphView, Grid, HBar, K, Num, classLook, classOf, place, plane, type Line } from "../svg";

const { v, nodes, scores, alpha, uniform, mean, out, hull } = ATTENTION;

const GAT = `Wh = H @ W
h_mean = Wh[nodes].mean(axis=0)
e = np.array([a @ np.concatenate([Wh[v], Wh[u]]) for u in nodes])
alpha = softmax(leaky_relu(e))
h = alpha @ Wh[nodes]`;

const MASKED = `scores = Q @ K.T / np.sqrt(d_k)
scores[A_hat == 0] = -np.inf
weights = softmax(scores, axis=-1)
H = weights @ V`;

const FOCUS: Focus[][] = [[1], [2, [3, "leaky_relu"]], [[3, "softmax"]], [4], [1]];

const GRAPH = place(10, 14, 36);
const P = plane({ x: [-1.2, 2.3], y: [-1.2, 2], unit: 60, left: 240, top: 8 });
const BARS = { label: 14, base: 104, value: 222, top: 128, gap: 21 };
const COMPLETE: Edge[] = NODES.flatMap((a) => range(a + 1, NODES.length - 1).map((b) => [a, b] as const));
const HEAD = ["weight", "score e", "α = softmax(e)", "α", "α"];

const LINES: Line[][] = [
  [{ text: `mean = ${list(mean)}`, color: K.ink }],
  [`e = LeakyReLU(aᵀ[x₄ ‖ xᵤ]) = ${list(scores)}`],
  [{ text: `α = softmax(e) = ${list(alpha)}`, color: K.outInk }],
  [{ text: `h₄ = Σ αᵤ xᵤ = ${list(out)}`, color: K.outInk }],
  [],
];

const touches = ([a, b]: Edge) => a === v || b === v;
const weightOf = (u: number) => alpha[nodes.indexOf(u)];

export default function AttentionVisual() {
  const { step } = useStage();
  const weighted = step >= 2;
  const complete = step === 4;
  const column = step === 0 ? uniform : step === 1 ? scores : alpha;
  const k = step === 1 ? 44 : 140;

  return (
    <Figure
      viewBox="0 0 460 236"
      top={
        <Morph id={complete ? "masked" : "gat"}>
          <Code code={complete ? MASKED : GAT} focus={complete ? [1] : FOCUS[step]} />
        </Morph>
      }
      label="Node 4 and its neighbours. The mean gives every neighbour the same weight. Graph attention scores each neighbour, turns the scores into weights with softmax, and the weighted sum lands inside the convex hull of the neighbours, far from the node of the other class."
    >
      <motion.g {...fade(complete)}>
        <GraphView
          at={GRAPH}
          r={9}
          edges={COMPLETE}
          edge={() => ({ color: K.faint, dashed: true })}
          node={() => ({ opacity: 0 })}
          label={() => null}
        />
      </motion.g>
      <GraphView
        at={GRAPH}
        r={9}
        node={(i) => ({
          ...classLook(i),
          ring: i === v ? K.out : undefined,
          opacity: complete || nodes.includes(i) ? 1 : 0.35,
        })}
        edge={(e) =>
          touches(e)
            ? {
                color: K.out,
                width: weighted ? 1 + 9 * weightOf(e[0] === v ? e[1] : e[0]) : 2,
              }
            : { opacity: complete ? 1 : 0.35 }
        }
      />

      <Label x={BARS.base} y={BARS.top - 22} size={10} anchor="start">
        {HEAD[step]}
      </Label>
      <line
        x1={BARS.base}
        x2={BARS.base}
        y1={BARS.top - 10}
        y2={BARS.top + 3 * BARS.gap + 10}
        stroke={K.axis}
      />
      {nodes.map((u, n) => {
        const y = BARS.top + n * BARS.gap;
        return (
          <g key={u}>
            <Label x={BARS.label} y={y} size={11} anchor="start" fill={classOf(u)}>
              {u === v ? `node ${u} (self)` : `node ${u}`}
            </Label>
            <HBar
              y={y}
              base={BARS.base}
              value={column[n]}
              k={k}
              fill={step === 1 ? K.slate : step >= 2 ? K.out : K.faint}
            />
            <Num x={BARS.value} y={y} value={column[n]} size={11} anchor="end" fill={K.muted} />
          </g>
        );
      })}

      <Grid plane={P} />
      <Clip plane={P}>
        <polygon
          points={hull.map((p) => P.at(p).join(",")).join(" ")}
          fill={K.outSoft}
          fillOpacity={0.55}
          stroke={K.out}
          strokeOpacity={0.4}
        />
      </Clip>
      <Clip plane={P}>
        {NODES.map((i) => (
          <Dot
            key={i}
            at={P.at(X[i])}
            color={classOf(i)}
            label={String(i)}
            opacity={nodes.includes(i) ? 1 : 0.15}
            r={weighted && nodes.includes(i) ? 3 + 9 * weightOf(i) : 5}
          />
        ))}
      </Clip>
      <Dot at={P.at(mean)} color={K.ink} hollow r={5} opacity={step === 4 ? 0.3 : 1} />
      <motion.g {...fade(step < 4)}>
        <Label x={P.at(mean)[0] - 8} y={P.at(mean)[1] - 12} size={10} anchor="end" fill={K.ink}>
          mean
        </Label>
      </motion.g>
      <Arrow from={P.at(mean)} to={P.at(step >= 3 ? out : mean)} color={K.out} width={1.75} opacity={step >= 3 ? 1 : 0} />
      <Dot at={P.at(step >= 3 ? out : mean)} color={K.out} r={6} opacity={step >= 3 ? 1 : 0} />

      <Calc x={10} y={224} steps={LINES} step={step} size={11} />
    </Figure>
  );
}
