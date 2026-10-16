"use client";

import { motion, useTransform } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText, fade } from "@/components/blog/svg";
import { SPREAD, fmt, range } from "../model";
import { At, Calc, K, useTweened, type Line } from "../svg";

const CODE = `x = np.array([${SPREAD.data.join(", ")}])
mu = x.mean()
var = ((x - mu) ** 2).mean()
sigma = np.sqrt(var)
z = (x - mu) / sigma`;

const FOCUS: Focus[][] = [[0], [1], [2], [3], [1, 3], [4]];

const AXIS = 172;
const RAW = 36;
const STD = 56;
const CENTER = 230;
const PEAK = 110;
const rx = (v: number) => CENTER + (v - SPREAD.mu) * RAW;
const zx = (z: number) => CENTER + z * STD;

const { data, mu, variance, sigma } = SPREAD;
const squares = data.map((v) => (v - mu) ** 2);

const LINES: Line[][] = [
  [`${data.length} values`],
  [`μ = (${data.join(" + ")}) / ${data.length} = ${fmt(mu, 0)}`],
  [`σ² = (${squares.join(" + ")}) / ${data.length} = ${fmt(variance, 0)}`],
  [`σ = √${fmt(variance, 0)} = ${fmt(sigma)}`],
  [`N(μ, σ²) = N(${fmt(mu, 0)}, ${fmt(variance, 0)})`],
  ["z = (x − μ) / σ"],
];

function bell(center: number, spread: number) {
  return range(0, 108)
    .map((i) => {
      const x = 14 + i * 4;
      const y = AXIS - PEAK * Math.exp(-((x - center) ** 2) / (2 * spread ** 2));
      return `${i ? "L" : "M"} ${x} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function SpreadVisual() {
  const { step } = useStage();
  const standard = step === 5;
  const shape = useTweened([standard ? STD : sigma * RAW]);
  const curve = useTransform(shape, ([s]) => bell(CENTER, s));
  const side = sigma * RAW;

  return (
    <Figure
      viewBox="0 0 460 200"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Seven values on a number line. The mean is their balance point. Each distance to the mean is drawn as a square, and the variance is the average area. A bell curve fits the data, and standardizing moves it to mean zero and spread one."
    >
      <motion.g {...fade(step >= 2 && step <= 3)}>
        {data.map((v, i) => {
          const w = Math.abs(v - mu) * RAW;
          return (
            <rect
              key={i}
              x={Math.min(rx(v), rx(mu))}
              y={AXIS - w}
              width={w}
              height={w}
              fill={v < mu ? K.a : K.b}
              fillOpacity={0.07}
              stroke={v < mu ? K.a : K.b}
              strokeOpacity={0.5}
            />
          );
        })}
      </motion.g>
      <motion.g {...fade(step === 3, 0.2)}>
        <rect
          x={CENTER - side / 2}
          y={AXIS - side}
          width={side}
          height={side}
          fill={K.outSoft}
          fillOpacity={0.6}
          stroke={K.out}
          strokeWidth={2}
        />
        <MathText x={CENTER - side / 2 - 8} y={AXIS - side + 12} size={13} anchor="end" fill={K.outInk}>
          {`σ = ${fmt(sigma)}`}
        </MathText>
      </motion.g>

      <motion.g {...fade(step >= 4)}>
        <motion.path d={curve} stroke={K.green} strokeWidth={2.5} fill="none" />
      </motion.g>

      <motion.g {...fade(step >= 1 && step <= 4)}>
        <line x1={CENTER} x2={CENTER} y1={36} y2={AXIS} stroke={K.out} strokeDasharray="3 4" />
        <path d={`M ${CENTER} ${AXIS + 2} l -8 13 h 16 Z`} fill={K.out} />
        <MathText x={CENTER + 6} y={44} size={13} fill={K.outInk}>
          μ
        </MathText>
      </motion.g>

      <line x1={14} x2={446} y1={AXIS} y2={AXIS} stroke={K.axis} strokeWidth={1.5} />
      <motion.g {...fade(!standard)}>
        {range(0, 10).map((t) => (
          <g key={t}>
            <line x1={rx(t)} x2={rx(t)} y1={AXIS - 3} y2={AXIS + 3} stroke={K.axis} />
            <Label x={rx(t)} y={AXIS + 22} size={10}>
              {t}
            </Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(standard, 0.3)}>
        {range(-3, 3).map((t) => (
          <g key={t}>
            <line x1={zx(t)} x2={zx(t)} y1={AXIS - 3} y2={AXIS + 3} stroke={K.axis} />
            <Label x={zx(t)} y={AXIS + 22} size={10} fill={t === 0 ? K.ink : K.muted}>
              {fmt(t, 0)}
            </Label>
          </g>
        ))}
      </motion.g>

      {data.map((v, i) => (
        <At key={i} x={standard ? zx(SPREAD.z[i]) : rx(v)} y={AXIS}>
          <circle r={5.5} fill={K.ink} stroke="#fff" strokeWidth={1.5} />
        </At>
      ))}

      <Calc x={16} y={16} steps={LINES} step={step} size={11.5} />
    </Figure>
  );
}
