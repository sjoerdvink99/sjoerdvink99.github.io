"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, Sym, fade } from "@/components/blog/svg";
import { A, A_PERMUTED, NODES, PERMUTATION, X } from "../model";
import { Calc, Cells, GraphView, K, classLook, place, type Line } from "../svg";

const CODE = `perm = [${PERMUTATION.join(", ")}]
P = np.eye(n)[perm].T
X_new, A_new = P @ X, P @ A @ P.T
(A_new.flatten() != A.flatten()).sum()
np.allclose(f(X_new, A_new), P @ f(X, A))`;

const FOCUS: Focus[][] = [[], [0, 1, 2], [3], [4]];

const V = 3;
const U = 15;
const TOP = 34;
const GRAPH = place(6, 70, 32);
const XM = { x: 206, w: 30 };
const AM = { x: 296 };
const STRIP = { x: 52, w: 6.2, h: 10, y: [180, 196] };

const FLAT = [A.flat(), A_PERMUTED.flat()];
const DIFFERENT = FLAT[0].map((v, k) => v !== FLAT[1][k]);
const CHANGED = DIFFERENT.filter(Boolean).length;

const LINES: Line[][] = [
  [],
  [],
  [{ text: `${CHANGED} of ${FLAT[0].length} entries of A changed place`, color: K.c1 }],
  [],
];

const touches = (i: number, j: number) => i === V || j === V;

export default function PermutationVisual() {
  const { step } = useStage();
  const moved = step >= 1;
  const order = moved ? PERMUTATION : undefined;

  return (
    <Figure
      viewBox="0 0 460 236"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Renumbering the nodes moves the rows of X and the rows and columns of A, although the graph itself is unchanged. Flattened, the two versions of A differ in many places."
    >
      <GraphView
        at={GRAPH}
        r={9}
        node={(i) => ({ ...classLook(i), ring: i === V ? K.out : undefined })}
        label={(i) => String(moved ? PERMUTATION[i] : i)}
      />

      <Sym x={XM.x + XM.w} y={TOP - 18}>
        X
      </Sym>
      {NODES.map((i) => (
        <Label key={i} x={XM.x - 7} y={TOP + i * U + U / 2} size={9} anchor="end">
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
        rows={order}
        fill={(_, i) => (i === V ? K.outSoft : K.empty)}
      />

      <Sym x={AM.x + 4 * U} y={TOP - 18}>
        A
      </Sym>
      {NODES.map((j) => (
        <Label key={j} x={AM.x + j * U + U / 2} y={TOP - 6} size={8}>
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
        rows={order}
        cols={order}
        colDelay={0.7}
        fill={(v, i, j) => (v ? (touches(i, j) ? K.out : K.slate) : touches(i, j) ? K.outSoft : K.empty)}
      />

      <motion.g {...fade(step === 2)}>
        {FLAT.map((values, r) => (
          <g key={r}>
            <Label x={STRIP.x - 8} y={STRIP.y[r] + STRIP.h / 2} size={9} anchor="end" mono>
              {r ? "A_new" : "A"}
            </Label>
            {values.map((v, k) => (
              <rect
                key={k}
                x={STRIP.x + k * STRIP.w}
                y={STRIP.y[r]}
                width={STRIP.w - 0.8}
                height={STRIP.h}
                fill={v ? (DIFFERENT[k] ? K.c1 : K.slate) : DIFFERENT[k] ? K.c1Soft : K.empty}
              />
            ))}
          </g>
        ))}
      </motion.g>
      <Calc x={STRIP.x - 46} y={222} steps={LINES} step={step} size={11} />
    </Figure>
  );
}
