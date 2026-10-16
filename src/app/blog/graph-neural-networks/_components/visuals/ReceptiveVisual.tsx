"use client";

import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText } from "@/components/blog/svg";
import { NODES, RECEPTIVE } from "../model";
import { Calc, Cells, GraphView, K, Slider, place, type Line } from "../svg";

const { v, dist, depth, reach } = RECEPTIVE;

const CODE = `reach = np.linalg.matrix_power(A_hat, k) > 0
reach[${v}]`;

const FOCUS: Focus[][] = [[], [], [0, 1], [0, 1]];
const LAYERS = [1, 2, depth];

const GRAPH = place(14, 40, 40);
const U = 16;
const M = { x: 306, y: 28 };

const seen = (k: number) => NODES.filter((i) => dist[i] <= k);

export default function ReceptiveVisual() {
  const { step } = useStage();
  const [free, setFree] = useState(2);
  const k = step === 3 ? free : LAYERS[step];
  const within = (i: number) => dist[i] <= k;

  const lines: Line[][] = [0, 1, 2, 3].map(() => [
    `k = ${k}: node ${v} sees {${seen(k).join(", ")}}`,
  ]);

  return (
    <Figure
      viewBox="0 0 460 190"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      interactive={step === 3}
      label="After k layers, node 0 has received information from every node within k hops. The same pattern appears as the nonzero entries of the k-th power of the adjacency matrix with self-loops."
      controls={
        <Slider
          label="layers"
          value={free}
          min={0}
          max={depth}
          step={1}
          onChange={setFree}
          display={String(free)}
          hidden={step !== 3}
        />
      }
    >
      <GraphView
        at={GRAPH}
        r={10}
        node={(i) =>
          i === v
            ? { fill: K.out, stroke: K.out, ink: "#fff" }
            : within(i)
              ? { fill: K.outSoft, stroke: K.out, ink: K.outInk }
              : { opacity: 0.45 }
        }
        edge={([a, b]) =>
          within(a) && within(b) && Math.min(dist[a], dist[b]) < k
            ? { color: K.out, width: 2.5 }
            : { opacity: 0.45 }
        }
      />
      <MathText x={M.x} y={M.y - 16} size={14} anchor="start">
        (A + I)ᵏ
      </MathText>
      <Label x={M.x + 8 * U} y={M.y - 16} size={11} anchor="end" mono fill={K.outInk}>
        {`k = ${k}`}
      </Label>
      {NODES.map((i) => (
        <Label key={i} x={M.x - 7} y={M.y + i * U + U / 2} size={9} anchor="end" fill={i === v ? K.ink : K.muted}>
          {i}
        </Label>
      ))}
      <Cells
        x={M.x}
        y={M.y}
        values={reach[Math.min(k, depth)].map((row) => row.map(Number))}
        w={U}
        h={U}
        numbers={false}
        fill={(on, i) => (on ? (i === v ? K.out : K.slate) : K.empty)}
        lit={(i) => step < 2 || i === v || step === 3}
      />

      <Calc x={14} y={160} steps={lines} step={step} size={10.5} />
    </Figure>
  );
}
