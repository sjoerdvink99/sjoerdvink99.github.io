"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { X0, XHAT0, fmt, fmtVec, mse, sub, type Vec2 } from "../model";
import {
  Axes,
  Dot,
  DragRing,
  Figure,
  K,
  Label,
  Sym,
  Vector,
  fade,
  plane,
  useDragPoint,
} from "../svg";

const CODE = `loss = np.mean((x_hat - x) ** 2)
dL_dx_hat = x_hat - x`;

const FOCUS: Focus[][] = [
  [[0, "x_hat - x"]],
  [[0, "np.mean((x_hat - x) ** 2)"]],
  [0],
  [1],
  [1],
  [0, 1],
];

const PL = plane({ x: [0.6, 2.8], y: [-0.2, 1.8] }, 23, 8, 170);
const LEVELS = [0.02, 0.08, 0.18, 0.32, 0.5, 0.72];
const READOUT = PL.box.x + PL.box.w - 196;

function Partial({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <text
        x={x}
        y={y}
        fontSize={14}
        fill={color}
        dominantBaseline="central"
        fontFamily="KaTeX_Main, serif"
      >
        ∂
        <tspan fontFamily="KaTeX_Math, serif" fontStyle="italic">
          L
        </tspan>{" "}
        / ∂
      </text>
      <Sym x={x + 44} y={y} size={14} fill={color} anchor="start" hat>
        x
      </Sym>
    </g>
  );
}

export default function LossVisual() {
  const { step } = useStage();
  const [dragged, setDragged] = useState<Vec2>(XHAT0);
  const live = step >= 5;
  const xhat = live ? dragged : XHAT0;
  const diff = sub(xhat, X0);
  const loss = mse(xhat, X0);

  const P = PL.p;
  const x = P(X0);
  const h = P(xhat);
  const corner = P([xhat[0], X0[1]]);

  const drag = useDragPoint({
    pl: PL,
    enabled: live,
    value: dragged,
    onChange: setDragged,
    label: `Reconstruction at ${fmtVec(xhat, 2)}. Use the arrow keys to move it.`,
  });

  const gradEnd = P([xhat[0] + diff[0], xhat[1] + diff[1]]);
  const showSquares = step === 1;

  return (
    <Figure
      interactive
      viewBox="0 0 420 372"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The loss around the target x forms circular contours. The gradient at the reconstruction points away from x, and the negative gradient points toward it."
    >
      <defs>
        <clipPath id="loss-clip">
          <rect
            x={PL.box.x}
            y={PL.box.y}
            width={PL.box.w}
            height={PL.box.h}
            rx={6}
          />
        </clipPath>
      </defs>
      <Axes pl={PL} />

      <g clipPath="url(#loss-clip)">
        <motion.g {...fade(step >= 2)}>
          {LEVELS.map((l) => (
            <circle
              key={l}
              cx={x[0]}
              cy={x[1]}
              r={Math.sqrt(2 * l) * PL.k}
              fill="none"
              stroke={K.grad}
              strokeOpacity={0.16}
            />
          ))}
          <circle
            cx={x[0]}
            cy={x[1]}
            r={Math.sqrt(2 * loss) * PL.k}
            fill="none"
            stroke={K.grad}
            strokeOpacity={0.6}
            strokeDasharray="4 4"
          />
        </motion.g>

        <motion.g {...fade(showSquares)}>
          <rect
            x={Math.min(h[0], x[0])}
            y={x[1]}
            width={Math.abs(diff[0]) * PL.k}
            height={Math.abs(diff[0]) * PL.k}
            fill={K.grad}
            fillOpacity={0.08}
            stroke={K.grad}
            strokeOpacity={0.4}
          />
          <rect
            x={h[0] - Math.abs(diff[1]) * PL.k}
            y={Math.min(h[1], x[1])}
            width={Math.abs(diff[1]) * PL.k}
            height={Math.abs(diff[1]) * PL.k}
            fill={K.grad}
            fillOpacity={0.08}
            stroke={K.grad}
            strokeOpacity={0.4}
          />
          <Label
            x={Math.min(h[0], x[0]) + (Math.abs(diff[0]) * PL.k) / 2}
            y={x[1] + (Math.abs(diff[0]) * PL.k) / 2}
            size={12}
            fill={K.grad}
          >
            {`(${fmt(diff[0])})² = ${fmt(diff[0] ** 2, 2)}`}
          </Label>
          <Label
            x={h[0] - (Math.abs(diff[1]) * PL.k) / 2}
            y={Math.min(h[1], x[1]) + (Math.abs(diff[1]) * PL.k) / 2}
            size={11}
            fill={K.grad}
          >
            {`${fmt(diff[1] ** 2, 2)}`}
          </Label>
        </motion.g>
      </g>

      <motion.g {...fade(step <= 1)}>
        <line
          x1={x[0]}
          y1={x[1]}
          x2={corner[0]}
          y2={corner[1]}
          stroke={K.grad}
          strokeDasharray="3 3"
        />
        <line
          x1={corner[0]}
          y1={corner[1]}
          x2={h[0]}
          y2={h[1]}
          stroke={K.grad}
          strokeDasharray="3 3"
        />
        <line
          x1={x[0]}
          y1={x[1]}
          x2={h[0]}
          y2={h[1]}
          stroke={K.grad}
          strokeWidth={1.5}
        />
        <motion.g {...fade(step === 0)}>
          <Label
            x={(x[0] + corner[0]) / 2}
            y={x[1] - 11}
            size={12}
            fill={K.grad}
          >
            {fmt(diff[0])}
          </Label>
          <Label
            x={h[0] - 10}
            y={(corner[1] + h[1]) / 2}
            size={12}
            fill={K.grad}
            anchor="end"
          >
            {fmt(diff[1])}
          </Label>
        </motion.g>
      </motion.g>

      <motion.g {...fade(step >= 3)}>
        <Vector from={h} to={gradEnd} color={K.grad} width={2} />
        <Partial x={gradEnd[0] - 10} y={gradEnd[1] + 16} color={K.grad} />
      </motion.g>
      <motion.g {...fade(step >= 4)}>
        <Vector
          from={h}
          to={P([xhat[0] - diff[0] * 0.92, xhat[1] - diff[1] * 0.92])}
          color={K.x}
          width={2}
        />
        <Label
          x={(h[0] + x[0]) / 2 + 12}
          y={(h[1] + x[1]) / 2 + 14}
          size={12}
          fill={K.x}
          anchor="start"
        >
          −gradient
        </Label>
      </motion.g>

      <Dot at={x} r={6}>
        <Sym x={15} y={-10} size={17}>
          x
        </Sym>
      </Dot>
      <g {...drag}>
        <DragRing at={h} show={live} />
        <Dot at={h} kind="xhat" r={6}>
          <Sym x={-16} y={-12} size={17} hat>
            x
          </Sym>
        </Dot>
      </g>

      <motion.g {...fade(step >= 1)}>
        <text
          x={READOUT}
          y={PL.box.y + 18}
          fontSize={13}
          fill={K.grad}
          dominantBaseline="central"
          className="tabular-nums"
        >
          <tspan fontFamily="KaTeX_Math, serif" fontStyle="italic">
            L
          </tspan>
          {` = ${fmt(loss, 3)}`}
        </text>
        <motion.g {...fade(step >= 3)}>
          <Partial x={READOUT} y={PL.box.y + 40} color={K.grad} />
          <Label
            x={READOUT + 58}
            y={PL.box.y + 40}
            size={13}
            fill={K.grad}
            anchor="start"
          >
            {`= ${fmtVec(diff, 2)}`}
          </Label>
        </motion.g>
      </motion.g>
    </Figure>
  );
}
