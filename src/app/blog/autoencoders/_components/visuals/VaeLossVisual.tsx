"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { ENCODED, decodeShape, fmt, regularized, snap } from "../model";
import {
  Axes,
  Figure,
  Glyph,
  K,
  Label,
  MathText,
  Slider,
  Vector,
  fade,
  plane,
  useMotion,
} from "../svg";

const PL = plane({ x: [-3.6, 3.6], y: [-3.6, 3.6] }, 40, 4, 50);

const TERMS: number[][] = [[0], [1], [1], [0, 1], [0, 1]];
const BETA = [0, 0, Infinity, 1];

export default function VaeLossVisual({
  formula,
}: {
  formula: { rec: ReactNode; kl: ReactNode; lhs: ReactNode; beta: ReactNode };
}) {
  const motionFor = useMotion();
  const { step } = useStage();
  const [chosen, setChosen] = useState(1);
  const live = step >= 4;
  const beta = live ? chosen : BETA[step];
  const encoded = ENCODED.map((e) => regularized(e, beta));
  const total = encoded.reduce((s, e) => s + e.kl, 0);
  const on = (t: number) => TERMS[step].includes(t);
  const dim = (t: number) =>
    `transition-opacity duration-500 ${on(t) ? "opacity-100" : "opacity-30"}`;

  return (
    <Figure
      viewBox="0 0 440 404"
      label="Five encoded distributions in a two-dimensional latent space. Reconstruction alone keeps them small and far apart. The KL term pulls them toward the standard normal prior. Together they settle into an organized arrangement near the origin."
      top={
        <div className="flex flex-wrap items-baseline justify-center gap-x-1.5 text-lg">
          {formula.lhs}
          <span className={dim(0)}>{formula.rec}</span>
          <span className={dim(1)}>{formula.beta}</span>
          <span className={dim(1)}>{formula.kl}</span>
        </div>
      }
      controls={
        <Slider
          label={<span className="font-math italic">β</span>}
          value={chosen}
          min={0}
          max={6}
          step={0.1}
          onChange={setChosen}
          display={fmt(chosen, 1)}
          hidden={!live}
        />
      }
    >
      <Axes pl={PL} names={["z", "z"]} ticks={false} />

      <motion.g {...fade(step >= 1)}>
        <circle
          cx={PL.px(0)}
          cy={PL.py(0)}
          r={PL.k}
          fill="none"
          stroke={K.x}
          strokeOpacity={0.55}
          strokeDasharray="4 4"
        />
        <circle
          cx={PL.px(0)}
          cy={PL.py(0)}
          r={2 * PL.k}
          fill="none"
          stroke={K.x}
          strokeOpacity={0.2}
          strokeDasharray="4 4"
        />
        <MathText
          x={PL.px(0) + PL.k * 0.72 + 4}
          y={PL.py(0) - PL.k * 0.72 - 6}
          size={12}
          fill={K.muted}
        >
          N(0, I)
        </MathText>
      </motion.g>

      <motion.g {...fade(step === 1)}>
        {ENCODED.map((e, i) => (
          <Vector
            key={i}
            from={PL.p(e.mu)}
            to={PL.p([e.mu[0] * 0.55, e.mu[1] * 0.55])}
            color={K.grad}
            width={1.5}
            head={6}
          />
        ))}
      </motion.g>

      {encoded.map((e, i) => {
        const [cx, cy] = PL.p(e.mu);
        const u = ENCODED[i].mu;
        const n = snap(Math.hypot(u[0], u[1]));
        const off = Math.max(e.sigma[0], e.sigma[1]) * PL.k + 16;
        return (
          <g key={i}>
            <motion.ellipse
              initial={false}
              animate={{
                cx,
                cy,
                rx: Math.max(3, e.sigma[0] * PL.k),
                ry: Math.max(3, e.sigma[1] * PL.k),
              }}
              transition={motionFor.spring()}
              fill={K.z}
              fillOpacity={0.08}
              stroke={K.z}
              strokeWidth={1.25}
            />
            <motion.g
              initial={false}
              animate={{ x: cx + (u[0] / n) * off, y: cy - (u[1] / n) * off }}
              transition={motionFor.spring()}
            >
              <Glyph
                shape={decodeShape(ENCODED[i].mu)}
                x={0}
                y={0}
                r={10}
                width={1.25}
              />
            </motion.g>
          </g>
        );
      })}

      <motion.g {...fade(step >= 1)}>
        <Label
          x={PL.box.x + 10}
          y={PL.box.y + 16}
          size={11}
          fill={K.grad}
          anchor="start"
        >
          total KL
        </Label>
        <Label
          x={PL.box.x + 10}
          y={PL.box.y + 34}
          size={13}
          fill={K.grad}
          anchor="start"
          mono
        >
          {fmt(total, 2)}
        </Label>
      </motion.g>
      <motion.g {...fade(step === 2)}>
        <Label
          x={PL.box.x + PL.box.w - 10}
          y={PL.box.y + PL.box.h - 14}
          size={11}
          fill={K.grad}
          anchor="end"
        >
          KL term only, so z says nothing about x
        </Label>
      </motion.g>
      <motion.g {...fade(step === 0)}>
        <Label
          x={PL.box.x + PL.box.w - 10}
          y={PL.box.y + PL.box.h - 14}
          size={11}
          fill={K.muted}
          anchor="end"
        >
          reconstruction term only
        </Label>
      </motion.g>
      <motion.g {...fade(step >= 3)}>
        <Label
          x={PL.box.x + PL.box.w - 10}
          y={PL.box.y + PL.box.h - 14}
          size={11}
          fill={K.muted}
          anchor="end"
        >
          {`both terms, β = ${fmt(beta, 1)}`}
        </Label>
      </motion.g>
    </Figure>
  );
}
