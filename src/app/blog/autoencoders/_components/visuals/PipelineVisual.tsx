"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { X0, XHAT0, Z0 } from "../model";
import { Figure, K, Label, Sym, fade, useMotion } from "../svg";

const Y = 150;
const CELL = { w: 40, h: 32 };

function Block({
  x,
  narrowing,
  label,
}: {
  x: number;
  narrowing: boolean;
  label: string;
}) {
  const [l, r] = narrowing ? [46, 22] : [22, 46];
  return (
    <g>
      <path
        d={`M ${x} ${Y - l} L ${x + 64} ${Y - r} L ${x + 64} ${Y + r} L ${x} ${Y + l} Z`}
        fill={K.opSoft}
        stroke={K.op}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <Label x={x + 32} y={Y + 64} size={12} fill={K.opInk}>
        {label}
      </Label>
    </g>
  );
}

function Arrow({ x1, x2 }: { x1: number; x2: number }) {
  return (
    <path
      d={`M ${x1} ${Y} H ${x2} M ${x2 - 5} ${Y - 4} L ${x2} ${Y} L ${x2 - 5} ${Y + 4}`}
      stroke={K.muted}
      strokeWidth={1.25}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export default function PipelineVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const named = step >= 1;
  const compared = step >= 2;
  const numbers = step >= 3;

  const vec = (x: number, n: number) =>
    Array.from({ length: n }, (_, i) => ({
      x,
      y: Y - (n * CELL.h + (n - 1) * 4) / 2 + i * (CELL.h + 4),
    }));

  const X_AT = 18;
  const Z_AT = 210;
  const XH_AT = 402;
  const xCells = vec(X_AT, 2);
  const zCells = vec(Z_AT, 1);
  const xhCells = vec(XH_AT, 2);

  return (
    <Figure
      viewBox="0 0 460 306"
      label="The autoencoder pipeline: an input x passes through an encoder to a latent z, and a decoder produces a reconstruction x-hat."
    >
      <Arrow x1={64} x2={96} />
      <Block x={100} narrowing label="encoder" />
      <Arrow x1={168} x2={204} />
      <Arrow x1={256} x2={288} />
      <Block x={292} narrowing={false} label="decoder" />
      <Arrow x1={360} x2={396} />

      {[
        { cells: xCells, values: X0, color: K.x, fill: "#fff" },
        { cells: zCells, values: [Z0], color: K.z, fill: K.zSoft },
        { cells: xhCells, values: XHAT0, color: K.x, fill: "#fff" },
      ].map(({ cells, values, color, fill }, v) =>
        cells.map((c, i) => (
          <g key={`${v}${i}`}>
            <rect
              x={c.x}
              y={c.y}
              width={CELL.w}
              height={CELL.h}
              rx={5}
              fill={fill}
              stroke={color}
              strokeOpacity={0.6}
              strokeDasharray={v === 2 ? "3 3" : undefined}
            />
            <motion.g {...fade(numbers)}>
              <Label
                x={c.x + CELL.w / 2}
                y={c.y + CELL.h / 2}
                size={13}
                fill={color}
              >
                {values[i].toFixed(1)}
              </Label>
            </motion.g>
          </g>
        )),
      )}

      <Sym x={X_AT + CELL.w / 2} y={Y - 58} size={20}>
        x
      </Sym>
      <Sym x={Z_AT + CELL.w / 2} y={Y - 58} size={20} fill={K.z}>
        z
      </Sym>
      <Sym x={XH_AT + CELL.w / 2} y={Y - 58} size={20} hat>
        x
      </Sym>

      <motion.g {...fade(named)}>
        <Label x={X_AT + CELL.w / 2} y={Y + 64} size={12}>
          input
        </Label>
        <Label x={Z_AT + CELL.w / 2} y={Y + 64} size={12} fill={K.z}>
          latent
        </Label>
        <Label x={XH_AT + CELL.w / 2} y={Y + 64} size={12}>
          reconstruction
        </Label>
      </motion.g>

      <motion.g {...fade(numbers)}>
        {[
          [X_AT, "(2,)"],
          [Z_AT, "(1,)"],
          [XH_AT, "(2,)"],
        ].map(([x, s]) => (
          <Label
            key={x}
            x={(x as number) + CELL.w / 2}
            y={Y + 84}
            size={11}
            mono
            fill="#9ca3af"
          >
            {s}
          </Label>
        ))}
      </motion.g>

      <motion.g {...fade(compared)}>
        <motion.path
          d={`M ${XH_AT + CELL.w / 2} ${Y + 104} C ${XH_AT} ${Y + 150}, ${X_AT + CELL.w} ${Y + 150}, ${X_AT + CELL.w / 2} ${Y + 104}`}
          fill="none"
          stroke={K.grad}
          strokeWidth={1.5}
          strokeDasharray="4 5"
          initial={false}
          animate={{ pathLength: compared ? 1 : 0 }}
          transition={motionFor.draw(0, 0.9)}
        />
        <path
          d={`M ${X_AT + CELL.w / 2 - 5} ${Y + 111} L ${X_AT + CELL.w / 2} ${Y + 104} L ${X_AT + CELL.w / 2 + 5} ${Y + 111}`}
          fill="none"
          stroke={K.grad}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Label x={230} y={Y + 148} size={12} fill={K.grad}>
          compare, then adjust the weights
        </Label>
      </motion.g>
    </Figure>
  );
}
