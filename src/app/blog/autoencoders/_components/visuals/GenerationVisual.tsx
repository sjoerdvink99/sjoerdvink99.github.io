"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import {
  MU,
  SIGMA,
  decodeShape,
  normal,
  reparam,
  EPS,
  type Vec2,
} from "../model";
import {
  Axes,
  Button,
  Figure,
  Glyph,
  K,
  Label,
  MathText,
  Sym,
  fade,
  plane,
} from "../svg";

const CODE = `z = torch.randn(6, 2)
x_new = decoder(z)`;

const FOCUS: Focus[][] = [[], [0, 1], [1], [0, 1]];

const PL = plane({ x: [-3, 3], y: [-3, 3] }, 70, 104, 50);
const GRID = [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4];
const Z_ONE = reparam(MU, SIGMA, EPS);

function Trapezoid({
  x,
  y,
  narrowing,
}: {
  x: number;
  y: number;
  narrowing: boolean;
}) {
  const [l, r] = narrowing ? [16, 8] : [8, 16];
  return (
    <path
      d={`M ${x} ${y - l} L ${x + 36} ${y - r} L ${x + 36} ${y + r} L ${x} ${y + l} Z`}
      fill={K.opSoft}
      stroke={K.op}
      strokeWidth={1.25}
      strokeLinejoin="round"
    />
  );
}

const arrow = (x1: number, x2: number, y: number) =>
  `M ${x1} ${y} H ${x2} M ${x2 - 4} ${y - 3} L ${x2} ${y} L ${x2 - 4} ${y + 3}`;

export default function GenerationVisual() {
  const { step } = useStage();
  const [batch, setBatch] = useState(0);
  const draws: Vec2[] = Array.from({ length: 6 }, (_, i) =>
    normal(300 + batch * 6 + i),
  );
  const reconstruct = step === 0 || step === 3;
  const generate = step >= 1;
  const grid = step >= 2;

  return (
    <Figure
      viewBox="0 0 440 412"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Generation with a trained variational autoencoder. Points are drawn from the standard normal prior and decoded into new shapes. Decoding a grid of latent points shows that nearby points decode to similar shapes."
      controls={
        <Button onClick={() => setBatch((b) => b + 1)} hidden={step !== 1}>
          Sample again
        </Button>
      }
    >
      <motion.g
        initial={false}
        animate={{ opacity: reconstruct ? 1 : 0.18 }}
        transition={{ duration: 0.5 }}
      >
        <Glyph shape={decodeShape(MU)} x={40} y={26} r={13} />
        <path
          d={arrow(60, 76, 26)}
          stroke={K.muted}
          fill="none"
          strokeWidth={1.25}
        />
        <Trapezoid x={80} y={26} narrowing />
        <path
          d={arrow(120, 140, 26)}
          stroke={K.muted}
          fill="none"
          strokeWidth={1.25}
        />
        <Sym x={152} y={26} size={15} fill={K.z}>
          z
        </Sym>
        <path
          d={arrow(164, 184, 26)}
          stroke={K.muted}
          fill="none"
          strokeWidth={1.25}
        />
        <Trapezoid x={188} y={26} narrowing={false} />
        <path
          d={arrow(228, 246, 26)}
          stroke={K.muted}
          fill="none"
          strokeWidth={1.25}
        />
        <Glyph shape={decodeShape(Z_ONE)} x={266} y={26} r={13} color={K.x} />
        <Label x={296} y={26} size={12} fill={K.muted} anchor="start">
          reconstruction
        </Label>
      </motion.g>

      <motion.g {...fade(generate)}>
        <MathText x={140} y={70} size={14} fill={K.z} anchor="end">
          z ~ N(0, I)
        </MathText>
        <path
          d={arrow(150, 184, 70)}
          stroke={K.muted}
          fill="none"
          strokeWidth={1.25}
        />
        <Trapezoid x={188} y={70} narrowing={false} />
        <path
          d={arrow(228, 246, 70)}
          stroke={K.muted}
          fill="none"
          strokeWidth={1.25}
        />
        <Glyph
          shape={decodeShape(draws[0])}
          x={266}
          y={70}
          r={13}
          color={K.z}
        />
        <Label x={296} y={70} size={12} fill={K.z} anchor="start">
          generation
        </Label>
      </motion.g>

      <Axes pl={PL} names={["z", "z"]} ticks={false} />

      <motion.g {...fade(generate)}>
        <circle
          cx={PL.px(0)}
          cy={PL.py(0)}
          r={PL.k}
          fill={K.z}
          fillOpacity={0.05}
          stroke={K.z}
          strokeOpacity={0.4}
          strokeDasharray="4 4"
        />
        <circle
          cx={PL.px(0)}
          cy={PL.py(0)}
          r={2 * PL.k}
          fill="none"
          stroke={K.z}
          strokeOpacity={0.2}
          strokeDasharray="4 4"
        />
      </motion.g>

      <motion.g {...fade(step === 0)}>
        <ellipse
          cx={PL.px(MU[0])}
          cy={PL.py(MU[1])}
          rx={SIGMA[0] * PL.k}
          ry={SIGMA[1] * PL.k}
          fill={K.z}
          fillOpacity={0.12}
          stroke={K.z}
        />
        <circle cx={PL.px(Z_ONE[0])} cy={PL.py(Z_ONE[1])} r={4} fill={K.z} />
        <Label
          x={PL.px(MU[0])}
          y={PL.py(MU[1] + SIGMA[1]) - 12}
          size={11}
          fill={K.z}
        >
          encoded from x
        </Label>
      </motion.g>

      <motion.g {...fade(step === 1)}>
        {draws.map((z, i) => {
          const [cx, cy] = PL.p(z);
          return (
            <motion.g
              key={`${batch}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <circle cx={cx} cy={cy} r={3.5} fill={K.z} />
              <line
                x1={cx}
                y1={cy}
                x2={cx + 12}
                y2={cy - 12}
                stroke={K.faint}
              />
              <circle
                cx={cx + 22}
                cy={cy - 22}
                r={15}
                fill="#fff"
                stroke={K.faint}
              />
              <Glyph
                shape={decodeShape(z)}
                x={cx + 22}
                y={cy - 22}
                r={10}
                width={1.25}
              />
            </motion.g>
          );
        })}
      </motion.g>

      <motion.g {...fade(grid)}>
        {GRID.flatMap((a) =>
          GRID.map((b) => (
            <Glyph
              key={`${a}${b}`}
              shape={decodeShape([a, b])}
              x={PL.px(a)}
              y={PL.py(b)}
              r={12}
              width={1.25}
              opacity={step === 3 ? 0.45 : Math.hypot(a, b) <= 2 ? 1 : 0.4}
            />
          )),
        )}
      </motion.g>
    </Figure>
  );
}
