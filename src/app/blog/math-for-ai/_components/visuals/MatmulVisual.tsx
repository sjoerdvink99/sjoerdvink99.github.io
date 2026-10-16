"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText, fade } from "@/components/blog/svg";
import { MATMUL, fmt, times, type Matrix, type Point } from "../model";
import { Calc, K, useTween, type Line } from "../svg";

const CODE = `C = A @ B
C[i, j] = A[i, :] @ B[:, j]
Y = X @ W + b
Y = X @ layer.weight.T + layer.bias`;

const FOCUS: Focus[][] = [[0], [1], [1], [2], [3]];

const CELL = { w: 34, h: 28 };
const SPOT = {
  A: { x: 24, y: 66 },
  B: { x: 152, y: 52 },
  C: { x: 268, y: 66 },
  T: { x: 350, y: 66 },
};
const { A, B, C } = MATMUL;

type Place = (i: number, j: number) => Point;

const grid =
  (at: { x: number; y: number }, transposed = false): Place =>
  (i, j) =>
    transposed ? [at.x + i * CELL.w, at.y + j * CELL.h] : [at.x + j * CELL.w, at.y + i * CELL.h];

function Cells({
  values,
  place,
  lit,
  numbers = () => true,
  opacity = 1,
}: {
  values: Matrix;
  place: Place;
  lit?: (i: number, j: number) => boolean;
  numbers?: (i: number, j: number) => boolean;
  opacity?: number;
}) {
  const transition = useTween();
  return (
    <motion.g initial={false} animate={{ opacity }} transition={transition}>
      {values.map((row, i) =>
        row.map((v, j) => {
          const [x, y] = place(i, j);
          const on = lit?.(i, j);
          return (
            <motion.g
              key={`${i}${j}`}
              initial={false}
              animate={{ x, y, opacity: lit && !on ? 0.35 : 1 }}
              transition={transition}
            >
              <motion.rect
                width={CELL.w}
                height={CELL.h}
                stroke="#fff"
                strokeWidth={1.5}
                initial={false}
                animate={{ fill: on ? K.outSoft : "#f3f4f6" }}
                transition={transition}
              />
              <motion.g {...fade(numbers(i, j))}>
                <Label x={CELL.w / 2} y={CELL.h / 2} size={13} fill={on ? K.outInk : K.ink} weight={on ? 600 : undefined}>
                  {fmt(v, 0)}
                </Label>
              </motion.g>
            </motion.g>
          );
        }),
      )}
    </motion.g>
  );
}

function Shape({ x, y, rows, cols, inner }: { x: number; y: number; rows: number; cols: number; inner?: "rows" | "cols" }) {
  return (
    <text x={x} y={y} fontSize={11} textAnchor="middle" dominantBaseline="central" fill={K.muted} className="font-mono">
      (<tspan fill={inner === "rows" ? K.outInk : undefined} fontWeight={inner === "rows" ? 700 : undefined}>{rows}</tspan>,{" "}
      <tspan fill={inner === "cols" ? K.outInk : undefined} fontWeight={inner === "cols" ? 700 : undefined}>{cols}</tspan>)
    </text>
  );
}

const term = (i: number, j: number) =>
  A[i].map((a, k) => times(a, B[k][j])).join(" + ") + ` = ${fmt(C[i][j], 0)}`;

const LINES: Line[][] = [
  ["(2, 3) @ (3, 2) → (2, 2)"],
  [`row 0 · col 0 = ${term(0, 0)}`],
  [`row 1 · col 1 = ${term(1, 1)}`],
  ["Y = X @ W + b"],
  ["Y = X @ layer.weight.T + layer.bias"],
];

const PICK: ([number, number] | null)[] = [null, [0, 0], [1, 1], null, null];

export default function MatmulVisual() {
  const { step } = useStage();
  const pick = PICK[step];
  const layer = step >= 3;
  const width = (m: Matrix) => m[0].length * CELL.w;

  return (
    <Figure
      viewBox="0 0 460 200"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A two by three matrix times a three by two matrix gives a two by two matrix. Each entry of the result is the dot product of a row of the first with a column of the second."
    >
      {[
        { at: SPOT.A, m: A, name: layer ? "X" : "A", note: "inputs" },
        { at: SPOT.B, m: B, name: layer ? "W" : "B", note: "neurons" },
        { at: SPOT.C, m: C, name: layer ? "Y" : "C", note: "outputs" },
      ].map(({ at, m, name, note }) => (
        <g key={note}>
          <MathText x={at.x + width(m) / 2} y={at.y - 16} size={16} anchor="middle">
            {name}
          </MathText>
          <motion.g {...fade(layer)}>
            <Label x={at.x + width(m) / 2} y={at.y - 34} size={10}>
              {note}
            </Label>
          </motion.g>
        </g>
      ))}

      <Cells
        values={A}
        place={grid(SPOT.A)}
        lit={pick ? (i) => i === pick[0] : undefined}
      />
      <Cells
        values={B}
        place={grid(SPOT.B)}
        lit={pick ? (_, j) => j === pick[1] : undefined}
      />
      <Cells
        values={C}
        place={grid(SPOT.C)}
        lit={pick ? (i, j) => i === pick[0] && j === pick[1] : undefined}
        numbers={(i, j) => step >= 2 || (step === 1 && i === 0 && j === 0)}
      />
      <Cells values={B} place={grid(step === 4 ? SPOT.T : SPOT.B, step === 4)} opacity={step === 4 ? 1 : 0} />

      <Label x={(SPOT.A.x + width(A) + SPOT.B.x) / 2} y={SPOT.A.y + CELL.h} size={16} fill={K.muted}>
        @
      </Label>
      <Label x={(SPOT.B.x + width(B) + SPOT.C.x) / 2} y={SPOT.A.y + CELL.h} size={16} fill={K.muted}>
        =
      </Label>
      <motion.g {...fade(step === 3)}>
        <MathText x={SPOT.C.x + width(C) + 14} y={SPOT.A.y + CELL.h} size={16}>
          + b
        </MathText>
      </motion.g>
      <motion.g {...fade(step === 4, 0.3)}>
        <Label x={SPOT.T.x + width(A) / 2} y={SPOT.T.y - 16} size={11} mono fill={K.ink}>
          layer.weight
        </Label>
        <Label x={SPOT.T.x + width(A) / 2} y={SPOT.T.y + 2 * CELL.h + 16} size={11} mono>
          (2, 3)
        </Label>
      </motion.g>

      <Shape x={SPOT.A.x + width(A) / 2} y={SPOT.B.y + 3 * CELL.h + 16} rows={2} cols={3} inner={step === 0 ? "cols" : undefined} />
      <Shape x={SPOT.B.x + width(B) / 2} y={SPOT.B.y + 3 * CELL.h + 16} rows={3} cols={2} inner={step === 0 ? "rows" : undefined} />
      <Shape x={SPOT.C.x + width(C) / 2} y={SPOT.B.y + 3 * CELL.h + 16} rows={2} cols={2} />

      <Calc x={230} y={180} steps={LINES} step={step} anchor="middle" />
    </Figure>
  );
}
