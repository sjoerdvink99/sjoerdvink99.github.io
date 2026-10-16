"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { WL } from "../model";
import { GraphView, K, WL_COLORS, place, useTween, type NodeLook } from "../svg";

const CODE = `colors = [0] * n
for _ in range(rounds):
    colors = [hash((colors[v], tuple(sorted(colors[u] for u in nbrs[v]))))
              for v in range(n)]`;

const FOCUS: Focus[][] = [[0], [2, 3], [2, 3], [1, 2, 3], [0], [1, 2, 3]];
const ROUND = [0, 1, 2, 3, 0, 3];

const MAIN = place(70, 18, 60);
const TWINS = place(132, 82, 50, WL.twinLayout);
const CHIP = { x: 70, y: 186, size: 12, gap: 4 };

const look = (color: number): NodeLook => ({
  fill: WL_COLORS[color],
  stroke: color === 0 ? K.node : WL_COLORS[color],
  ink: color === 0 ? K.ink : "#fff",
});

function Histogram({ colors, x, y, label }: { colors: number[]; x: number; y: number; label: string }) {
  const transition = useTween();
  const sorted = [...colors].sort((a, b) => a - b);
  return (
    <g>
      <Label x={x - 10} y={y + CHIP.size / 2} size={11} anchor="end" fill={K.ink}>
        {label}
      </Label>
      {sorted.map((c, k) => (
        <motion.rect
          key={k}
          x={x + k * (CHIP.size + CHIP.gap)}
          y={y}
          width={CHIP.size}
          height={CHIP.size}
          rx={3}
          initial={false}
          animate={{ fill: WL_COLORS[c] }}
          transition={transition}
        />
      ))}
    </g>
  );
}

export default function WLVisual() {
  const { step } = useStage();
  const twins = step >= 4;
  const round = ROUND[step];
  const main = WL.main[round];
  const pair = WL.twins[round];
  const distinct = new Set(main).size;

  return (
    <Figure
      viewBox="0 0 460 214"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Colour refinement. Every node starts with the same colour and repeatedly takes a new colour from its own colour and the colours of its neighbours. In the example graph the colours split into seven classes. A hexagon and a pair of triangles never split at all, so the two graphs look identical."
    >
      <motion.g {...fade(!twins, 0.45)}>
        <GraphView at={MAIN} r={12} node={(i) => look(main[i])} />
        <Histogram colors={main} x={CHIP.x + 60} y={CHIP.y} label="colors" />
        <Label x={460 - 8} y={CHIP.y + CHIP.size / 2} size={11} anchor="end" fill={K.muted}>
          {`round ${round}: ${distinct} color${distinct === 1 ? "" : "s"}${step === 3 ? ", stable" : ""}`}
        </Label>
      </motion.g>

      <motion.g {...fade(twins, 0.45)}>
        <GraphView
          at={TWINS}
          edges={WL.twinEdges}
          r={11}
          node={(i) => look(pair[i])}
          label={() => null}
        />
        <Label x={TWINS[0][0]} y={156} size={11} fill={K.ink}>
          one hexagon
        </Label>
        <Label x={(TWINS[6][0] + TWINS[9][0]) / 2} y={156} size={11} fill={K.ink}>
          two triangles
        </Label>
        <Histogram colors={pair.slice(0, 6)} x={CHIP.x + 60} y={CHIP.y - 12} label="hexagon" />
        <Histogram colors={pair.slice(6)} x={CHIP.x + 60} y={CHIP.y + 8} label="triangles" />
        <Label x={460 - 8} y={CHIP.y + 2} size={11} anchor="end" fill={K.muted}>
          {`round ${round}: identical`}
        </Label>
      </motion.g>
    </Figure>
  );
}
