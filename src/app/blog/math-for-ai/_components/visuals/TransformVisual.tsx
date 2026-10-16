"use client";

import { motion, useTransform } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText, Sym, fade } from "@/components/blog/svg";
import { LINEAR, dot, fmt, list, matvec, range, times, type Matrix, type Vec } from "../model";
import { Arrow, At, Bracket, Calc, Clip, Grid, K, Num, plane, useTweened, type Line } from "../svg";

const CODE = `A = np.array([[2, -1],
              [1,  1]])
A @ x
x[0] * A[:, 0] + x[1] * A[:, 1]
np.linalg.det(A)
(R @ A) @ x`;

const FOCUS: Focus[][] = [[2], [3], [2], [4], [5]];

const P = plane({ x: [-4, 4], y: [-2.5, 4], unit: 30, left: 8, top: 8 });
const O = P.at([0, 0]);
const I = [
  [1, 0],
  [0, 1],
];
const { A, RA, x } = LINEAR;
const WARP: Matrix[] = [I, I, A, A, RA];
const SHOWN: Matrix[] = [A, A, A, A, RA];
const NAMES = ["A", "A", "A", "A", "RA"];
const SPAN = 8;
const LINES = range(-SPAN, SPAN);
const SQUARE = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

const apply = (m: Vec, p: Vec) => [m[0] * p[0] + m[1] * p[1], m[2] * p[0] + m[3] * p[1]];
const segment = (m: Vec, p: Vec, q: Vec) => {
  const [a, b] = [P.at(apply(m, p)), P.at(apply(m, q))];
  return `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`;
};
const lines = (m: Vec, ks: number[]) =>
  ks
    .flatMap((k) => [segment(m, [k, -SPAN], [k, SPAN]), segment(m, [-SPAN, k], [SPAN, k])])
    .join(" ");
const column = (M: Matrix, j: number) => [M[0][j], M[1][j]];
const beyond = (v: Vec, gap = 14) => {
  const [x0, y0] = P.at([0, 0]);
  const [x1, y1] = P.at(v);
  const length = Math.hypot(x1 - x0, y1 - y0);
  return { x: x1 + ((x1 - x0) / length) * gap, y: y1 + ((y1 - y0) / length) * gap };
};

const PANEL = { title: 34, rows: [64, 90], cols: [296, 326], x: 370, result: 428 };

const LINES_CALC: Line[][] = [
  A.map((row) => `${times(row[0], x[0])} + ${times(row[1], x[1])} = ${fmt(dot(row, x), 0)}`),
  [
    `${x[0]}×${list(column(A, 0), 0)} + ${x[1]}×${list(column(A, 1), 0)}`,
    `= ${list(LINEAR.Ax, 0)}`,
  ],
  [`e₁ → ${list(column(A, 0), 0)}`, `e₂ → ${list(column(A, 1), 0)}`],
  [`det A = ${times(A[0][0], A[1][1])} − ${times(A[0][1], A[1][0])}`, `= ${fmt(LINEAR.det, 0)}`],
  [`RA = ${list(RA[0], 0)}`, `     ${list(RA[1], 0)}`, `RAx = ${list(LINEAR.RAx, 0)}`],
];

function Warp({ matrix, square }: { matrix: Matrix; square: boolean }) {
  const m = useTweened(matrix.flat());
  const grid = useTransform(m, (v) => lines(v, LINES.filter((k) => k !== 0)));
  const axes = useTransform(m, (v) => lines(v, [0]));
  const area = useTransform(
    m,
    (v) => `M ${SQUARE.map((p) => P.at(apply(v, p)).join(" ")).join(" L ")} Z`,
  );
  return (
    <Clip plane={P}>
      <motion.path d={area} fill={K.outSoft} stroke={K.out} strokeWidth={1.5} {...fade(square)} />
      <motion.path d={grid} stroke={K.warp} strokeWidth={1} fill="none" />
      <motion.path d={axes} stroke={K.muted} strokeWidth={1.25} fill="none" />
    </Clip>
  );
}

export default function TransformVisual() {
  const { step } = useStage();
  const M = WARP[step];
  const e1 = P.at(column(M, 0));
  const e2 = P.at(column(M, 1));
  const first = P.at(matvec(M, [x[0], 0]));
  const out = P.at(matvec(M, x));
  const pieces = step === 1 || step === 2;
  const basis = step !== 1;
  const shown = SHOWN[step];
  const result = matvec(shown, x);

  return (
    <Figure
      viewBox="0 0 460 212"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A grid in the plane is transformed by a matrix. The basis vectors land on the matrix columns, the unit square becomes a parallelogram whose area is the determinant, and a second matrix composes with the first."
    >
      <Grid plane={P} />
      <Warp matrix={M} square={step === 3} />

      <Arrow from={O} to={first} color={K.a} width={2} opacity={pieces ? 0.9 : 0} dashed={basis} />
      <Arrow from={first} to={out} color={K.b} width={2} opacity={pieces ? 0.9 : 0} dashed={basis} />
      <Arrow from={O} to={e1} color={K.a} width={2.5} opacity={basis ? 1 : 0} />
      <Arrow from={O} to={e2} color={K.b} width={2.5} opacity={basis ? 1 : 0} />
      <Arrow from={O} to={out} color={K.out} width={2.5} />

      <At {...beyond(column(M, 0))} opacity={basis ? 1 : 0}>
        <Sym x={0} y={0} sub="1" size={14} fill={K.a}>
          e
        </Sym>
      </At>
      <At {...beyond(column(M, 1))} opacity={basis ? 1 : 0}>
        <Sym x={0} y={0} sub="2" size={14} fill={K.b}>
          e
        </Sym>
      </At>
      <At x={out[0]} y={out[1]}>
        <MathText x={8} y={-10} size={14} fill={K.outInk}>
          {step === 4 ? "RAx" : step >= 2 ? "Ax" : "x"}
        </MathText>
      </At>

      <MathText x={(PANEL.cols[0] + PANEL.cols[1]) / 2} y={PANEL.title} size={16} anchor="middle">
        {NAMES[step]}
      </MathText>
      <Bracket x={311} top={PANEL.rows[0] - 14} bottom={PANEL.rows[1] + 14} width={62} />
      {shown.map((row, i) =>
        row.map((v, j) => (
          <Num
            key={`${i}${j}`}
            x={PANEL.cols[j]}
            y={PANEL.rows[i]}
            value={v}
            digits={0}
            size={14}
            fill={j === 0 ? K.a : K.b}
            weight={500}
          />
        )),
      )}
      <Bracket x={PANEL.x} top={PANEL.rows[0] - 14} bottom={PANEL.rows[1] + 14} width={28} />
      {x.map((v, i) => (
        <Label key={i} x={PANEL.x} y={PANEL.rows[i]} size={14} fill={K.ink}>
          {v}
        </Label>
      ))}
      <Label x={399} y={(PANEL.rows[0] + PANEL.rows[1]) / 2} size={15} fill={K.muted}>
        =
      </Label>
      <Bracket x={PANEL.result} top={PANEL.rows[0] - 14} bottom={PANEL.rows[1] + 14} width={32} />
      {result.map((v, i) => (
        <Num key={i} x={PANEL.result} y={PANEL.rows[i]} value={v} digits={0} size={14} fill={K.outInk} weight={600} />
      ))}

      <Calc x={270} y={140} steps={LINES_CALC} step={step} size={11.5} gap={19} />
    </Figure>
  );
}
