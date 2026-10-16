"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code } from "@/components/blog/Code";
import { Morph } from "@/components/blog/Morph";
import { Figure, Label, fade } from "@/components/blog/svg";
import { CLASS, EMBEDDING, NODES, fmt, list } from "../model";
import { Arrow, At, Calc, Clip, Dot, Grid, K, classOf, plane, type Line } from "../svg";

const { Z, pooled, same, across, sameScore, acrossScore } = EMBEDDING;

const CODE = [
  `logits = classifier(Z)
pred = logits.argmax(dim=1)`,
  `score = (Z[u] * Z[v]).sum(dim=-1)
p = torch.sigmoid(score)`,
  `z_graph = Z.mean(dim=0)
logits = classifier(z_graph)`,
];

const P = plane({ x: [-0.25, 1.3], y: [-0.25, 1.3], unit: 132, left: 8, top: 8 });
const O = P.at([0, 0]);
const RIGHT = 248;

const corner = (pts: number[][]) => pts.map((p) => P.at(p).join(",")).join(" ");
const REGIONS = [
  corner([[-1, -1], [2, 2], [-1, 2]]),
  corner([[-1, -1], [2, 2], [2, -1]]),
];

const sigmoid = (v: number) => 1 / (1 + Math.exp(-v));
const z = (i: number) => `z${"₀₁₂₃₄₅₆₇"[i]}`;

const SHOWN = [2, 6];
const LINES: Line[][] = [
  SHOWN.map((i) => ({ text: `${z(i)} = ${list(Z[i])} → class ${CLASS[i]}`, color: classOf(i) })),
  [
    { text: `${z(same[0])} · ${z(same[1])} = ${fmt(sameScore)}   σ = ${fmt(sigmoid(sameScore))}`, color: K.outInk },
    `${z(across[0])} · ${z(across[1])} = ${fmt(acrossScore)}   σ = ${fmt(sigmoid(acrossScore))}`,
  ],
  [{ text: `mean of ${Z.length} rows = ${list(pooled)}`, color: K.outInk }],
];

const LINK = [same, across];

export default function TasksVisual() {
  const { step } = useStage();
  const nodes = step === 0;
  const links = step === 1;
  const graph = step === 2;
  const inLink = (i: number) => LINK.some(([a, b]) => a === i || b === i);
  const named = (i: number) => (nodes ? SHOWN.includes(i) : links && inLink(i));

  return (
    <Figure
      viewBox="0 0 460 222"
      top={
        <Morph id={step}>
          <Code code={CODE[step]} />
        </Morph>
      }
      label="The node vectors after one GCN layer. A line separates the two classes for node classification. Dot products between node vectors score possible links. Averaging all node vectors gives one vector for the whole graph."
    >
      <Grid plane={P} />
      <Clip plane={P}>
        <motion.g {...fade(nodes)}>
          {REGIONS.map((points, c) => (
            <polygon key={c} points={points} fill={c ? K.c1Soft : K.c0Soft} fillOpacity={0.45} />
          ))}
          <line
            x1={P.px(-1)}
            y1={P.py(-1)}
            x2={P.px(2)}
            y2={P.py(2)}
            stroke={K.ink}
            strokeOpacity={0.5}
            strokeDasharray="5 5"
          />
        </motion.g>
        <motion.g {...fade(graph)}>
          {NODES.map((i) => (
            <line
              key={i}
              x1={P.at(Z[i])[0]}
              y1={P.at(Z[i])[1]}
              x2={P.at(pooled)[0]}
              y2={P.at(pooled)[1]}
              stroke={K.out}
              strokeOpacity={0.35}
              strokeDasharray="3 4"
            />
          ))}
        </motion.g>
      </Clip>

      {LINK.flat().map((i, k) => (
        <Arrow key={k} from={O} to={P.at(links ? Z[i] : [0, 0])} color={classOf(i)} width={2} opacity={links ? 0.9 : 0} />
      ))}

      {NODES.map((i) => (
        <Dot
          key={i}
          at={P.at(Z[i])}
          color={classOf(i)}
          label={String(i)}
          labelOpacity={named(i) ? 1 : 0}
          side={CLASS[i] ? "right" : "left"}
          opacity={links && !inLink(i) ? 0.25 : 1}
        />
      ))}
      <At x={P.at(pooled)[0]} y={P.at(pooled)[1]} opacity={graph ? 1 : 0}>
        <path
          d="M 0 -9 L 2.6 -3.2 L 8.6 -2.8 L 4 1.2 L 5.4 7.3 L 0 4 L -5.4 7.3 L -4 1.2 L -8.6 -2.8 L -2.6 -3.2 Z"
          fill={K.out}
        />
      </At>

      <motion.g {...fade(nodes, 0.35)}>
        <Label x={RIGHT} y={30} size={12} anchor="start" fill={K.ink} weight={500}>
          Node classification
        </Label>
        <Label x={RIGHT} y={48} size={11} anchor="start">
          one prediction per row of Z
        </Label>
      </motion.g>
      <motion.g {...fade(links, 0.35)}>
        <Label x={RIGHT} y={30} size={12} anchor="start" fill={K.ink} weight={500}>
          Link prediction
        </Label>
        <Label x={RIGHT} y={48} size={11} anchor="start">
          one score per pair of rows
        </Label>
      </motion.g>
      <motion.g {...fade(graph, 0.35)}>
        <Label x={RIGHT} y={30} size={12} anchor="start" fill={K.ink} weight={500}>
          Graph classification
        </Label>
        <Label x={RIGHT} y={48} size={11} anchor="start">
          one vector for all rows
        </Label>
      </motion.g>

      <Calc x={RIGHT} y={84} steps={LINES} step={step} size={11} />
    </Figure>
  );
}
