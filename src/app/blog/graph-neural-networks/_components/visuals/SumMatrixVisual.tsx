"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText, fade } from "@/components/blog/svg";
import { A, A_HAT, AGGREGATE, DEGREE_HAT, MEANS, NODES, SUMS, X, list, matmul } from "../model";
import { Calc, Cells, K, type Line } from "../svg";

const CODE = `S = A @ X
A_hat = A + np.eye(n)
deg = A_hat.sum(axis=1, keepdims=True)
H = (A_hat @ X) / deg
src, dst = add_self_loops(edge_index)[0]
H = scatter(X[src], dst, dim=0, reduce="mean")`;

const FOCUS: Focus[][] = [[0], [1, 3], [2, 3], [4, 5]];

const V = AGGREGATE.v;
const U = 15;
const TOP = 30;
const COL = 34;
const AX = { a: 16, x: 166, s: 256, d: 346, h: 388 };
const NEIGHBOR_SUMS = matmul(A, X);

const LINES: Line[][] = [
  [`row ${V}: X[${AGGREGATE.nbrs.join("] + X[")}] = ${list(NEIGHBOR_SUMS[V])}`],
  [`row ${V}: X[${V}] + X[${AGGREGATE.nbrs.join("] + X[")}] = ${list(SUMS[V])}`],
  [{ text: `row ${V}: ${list(SUMS[V])} / ${DEGREE_HAT[V]} = ${list(MEANS[V])}`, color: K.outInk }],
  ["same result, one message per edge, no n × n matrix"],
];

function Title({ x, children }: { x: number; children: string }) {
  return (
    <MathText x={x} y={TOP - 14} size={14} anchor="middle">
      {children}
    </MathText>
  );
}

function Op({ x, children }: { x: number; children: string }) {
  return (
    <Label x={x} y={TOP + 4 * U} size={15}>
      {children}
    </Label>
  );
}

export default function SumMatrixVisual() {
  const { step } = useStage();
  const loops = step >= 1;
  const divided = step >= 2;
  const one = (i: number) => divided || i === V;
  const used = (i: number) => divided || (loops ? A_HAT[V][i] > 0 : A[V][i] > 0);

  return (
    <Figure
      viewBox="0 0 460 196"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Multiplying the adjacency matrix by the feature matrix adds up the neighbours of every node at once. Adding the identity counts each node itself, and dividing by the degree turns the sums into means."
    >
      <Title x={AX.a + 4 * U}>{loops ? "A + I" : "A"}</Title>
      <Cells
        x={AX.a}
        y={TOP}
        values={loops ? A_HAT : A}
        w={U}
        h={U}
        numbers={false}
        fill={(v, i, j) => (v ? (i === j ? K.out : K.slate) : K.empty)}
        lit={(i) => one(i)}
      />
      <Op x={AX.x - 13}>@</Op>

      <Title x={AX.x + COL}>X</Title>
      <Cells x={AX.x} y={TOP} values={X} w={COL} h={U} digits={1} lit={(i) => used(i)} />
      <Op x={AX.s - 12}>=</Op>

      <Cells
        x={AX.s}
        y={TOP}
        values={loops ? SUMS : NEIGHBOR_SUMS}
        w={COL}
        h={U}
        digits={1}
        lit={(i) => one(i)}
      />

      <motion.g {...fade(divided)}>
        <Op x={AX.d - 10}>÷</Op>
        <Label x={AX.d + 10} y={TOP - 14} size={10}>
          deg
        </Label>
        <Cells x={AX.d} y={TOP} values={DEGREE_HAT.map((d) => [d])} w={20} h={U} />
        <Op x={AX.h - 8}>=</Op>
        <Title x={AX.h + COL}>H</Title>
        <Cells
          x={AX.h}
          y={TOP}
          values={MEANS}
          w={COL}
          h={U}
          digits={2}
          size={8.5}
          fill={(_, i) => (i === V ? K.outSoft : K.empty)}
        />
      </motion.g>

      {NODES.map((i) => (
        <Label key={i} x={AX.a - 6} y={TOP + i * U + U / 2} size={8} anchor="end">
          {i}
        </Label>
      ))}
      <Calc x={AX.a} y={TOP + 8 * U + 26} steps={LINES} step={step} size={11} />
    </Figure>
  );
}
