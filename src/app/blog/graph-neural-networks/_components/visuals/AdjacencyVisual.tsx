"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, Sym, fade } from "@/components/blog/svg";
import { A, DEGREE, NEIGHBORS, NODES, X } from "../model";
import { Calc, Cells, GraphView, K, classLook, place, type Line } from "../svg";

const CODE = `X.shape
A = np.zeros((n, n))
for u, v in edges:
    A[u, v] = A[v, u] = 1
deg = A.sum(axis=1)
edge_index = to_undirected(torch.tensor(edges).T)`;

const FOCUS: Focus[][] = [[0], [1, 2, 3], [4], [5]];

const V = 3;
const U = 15;
const TOP = 34;
const GRAPH = place(6, 70, 32);
const XM = { x: 206, w: 30 };
const AM = { x: 296 };
const DEG = { x: AM.x + 8 * U + 10 };

const DIRECTED = NODES.flatMap((u) => NEIGHBORS[u].map((v) => [u, v] as const));
const LINES: Line[][] = [
  [],
  [],
  [],
  [
    `src = [${DIRECTED.map(([u]) => u).join(" ")}]`,
    `dst = [${DIRECTED.map(([, v]) => v).join(" ")}]`,
  ],
];

export default function AdjacencyVisual() {
  const { step } = useStage();
  const rowOn = step >= 1;
  const sym = step >= 2;
  const nbr = (i: number) => NEIGHBORS[V].includes(i);

  return (
    <Figure
      viewBox="0 0 460 226"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The graph stored as two matrices: X holds one feature vector per row, and A has a one wherever two nodes share an edge. Row 3 of A marks the neighbours of node 3, and its sum is the degree."
    >
      <GraphView
        at={GRAPH}
        r={9}
        node={(i) => ({
          ...classLook(i),
          ring: rowOn && i === V ? K.out : undefined,
          opacity: rowOn && i !== V && !nbr(i) ? 0.35 : 1,
        })}
        edge={([u, v]) =>
          rowOn ? (u === V || v === V ? { color: K.out, width: 2.5 } : { opacity: 0.35 }) : {}
        }
      />

      <Sym x={XM.x + XM.w} y={TOP - 18}>
        X
      </Sym>
      {NODES.map((i) => (
        <Label key={i} x={XM.x - 7} y={TOP + i * U + U / 2} size={9} anchor="end" fill={rowOn && i === V ? K.ink : K.muted}>
          {i}
        </Label>
      ))}
      <Cells
        x={XM.x}
        y={TOP}
        values={X}
        w={XM.w}
        h={U}
        digits={1}
        lit={(i) => !rowOn || i === V}
      />
      <Label x={XM.x + XM.w} y={TOP + 8 * U + 12} size={9} mono fill={K.shape}>
        (8, 2)
      </Label>

      <motion.g {...fade(rowOn)}>
        <Sym x={AM.x + 4 * U} y={TOP - 18}>
          A
        </Sym>
        {NODES.map((j) => (
          <Label key={j} x={AM.x + j * U + U / 2} y={TOP - 6} size={8} fill={sym && j === V ? K.ink : K.muted}>
            {j}
          </Label>
        ))}
        <Cells
          x={AM.x}
          y={TOP}
          values={A}
          w={U}
          h={U}
          numbers={false}
          fill={(v) => (v ? K.out : K.empty)}
          lit={(i, j) => i === V || (sym && j === V)}
        />
        <Label x={AM.x + 4 * U} y={TOP + 8 * U + 12} size={9} mono fill={K.shape}>
          (8, 8)
        </Label>
      </motion.g>

      <motion.g {...fade(sym)}>
        <Label x={DEG.x + 10} y={TOP - 6} size={8}>
          deg
        </Label>
        <Cells
          x={DEG.x}
          y={TOP}
          values={DEGREE.map((d) => [d])}
          w={20}
          h={U}
          lit={(i) => i === V}
        />
      </motion.g>

      <motion.g {...fade(step === 3)}>
        <Label x={6} y={TOP + 8 * U + 28} size={10} anchor="start" fill={K.ink}>
          {`edge_index (2, ${DIRECTED.length})`}
        </Label>
      </motion.g>
      <Calc x={6} y={TOP + 8 * U + 48} steps={LINES} step={step} size={10.5} gap={17} />
    </Figure>
  );
}
