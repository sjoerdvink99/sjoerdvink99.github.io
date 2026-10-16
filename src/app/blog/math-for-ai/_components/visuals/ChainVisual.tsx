"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText, fade } from "@/components/blog/svg";
import { CHAIN, fmt, range } from "../model";
import { K } from "../svg";

const CODE = `u = x ** 2
y = 3 * u + 1
dy_dx = 3 * (2 * x)`;

const FOCUS: Focus[][] = [[0, 1], [0, 1], [2]];

const px = (v: number) => 50 + v * 38;
const BAND = 5;
const nudges = [CHAIN.nudge, CHAIN.nudge * CHAIN.du, CHAIN.nudge * CHAIN.total];

const LINES = [
  { name: "x", y: 40, value: CHAIN.x, delta: `Δx = ${fmt(nudges[0], 1)}` },
  { name: "u", y: 112, value: CHAIN.u, delta: `Δu ≈ ${fmt(nudges[1], 1)}` },
  { name: "y", y: 184, value: CHAIN.y, delta: `Δy ≈ ${fmt(nudges[2], 1)}` },
];

const LINKS = [
  { fn: "u = x²", rate: `du/dx = 2x = ${fmt(CHAIN.du, 0)}` },
  { fn: "y = 3u + 1", rate: `dy/du = ${fmt(CHAIN.dy, 0)}` },
];

export default function ChainVisual() {
  const { step } = useStage();

  return (
    <Figure
      viewBox="0 0 460 206"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Three number lines for x, u equals x squared, and y equals 3u plus 1. A small nudge of x is stretched three times on the way to u and three times again on the way to y."
    >
      {LINES.map((line, i) => (
        <g key={line.name}>
          <line x1={px(0)} x2={px(10)} y1={line.y} y2={line.y} stroke={K.axis} strokeWidth={1.5} />
          {range(0, 10).map((t) => (
            <line key={t} x1={px(t)} x2={px(t)} y1={line.y - 3} y2={line.y + 3} stroke={K.axis} />
          ))}
          <Label x={px(0)} y={line.y + 15} size={10}>
            0
          </Label>
          <Label x={px(10)} y={line.y + 15} size={10}>
            10
          </Label>
          <MathText x={26} y={line.y} size={16} anchor="middle">
            {line.name}
          </MathText>

          <motion.g {...fade(step >= 1, i * 0.35)}>
            <rect
              x={px(line.value)}
              y={line.y - BAND}
              width={px(nudges[i]) - px(0)}
              height={BAND * 2}
              fill={K.out}
              fillOpacity={0.35}
              stroke={K.out}
            />
            {px(line.value + nudges[i]) + 70 < 450 ? (
              <MathText x={px(line.value + nudges[i]) + 8} y={line.y - 13} size={12} fill={K.outInk}>
                {line.delta}
              </MathText>
            ) : (
              <MathText x={px(line.value) - 8} y={line.y - 13} size={12} fill={K.outInk} anchor="end">
                {line.delta}
              </MathText>
            )}
          </motion.g>

          <circle cx={px(line.value)} cy={line.y} r={4.5} fill={K.ink} />
          <Label x={px(line.value)} y={line.y + 15} size={11} fill={K.ink}>
            {fmt(line.value, 2)}
          </Label>
        </g>
      ))}

      {LINKS.map((link, i) => {
        const [top, bottom] = [LINES[i], LINES[i + 1]];
        const mid = (top.y + bottom.y) / 2;
        return (
          <g key={link.fn}>
            <motion.path
              d={`M ${px(top.value)} ${top.y + BAND} H ${px(top.value + nudges[i])} L ${px(bottom.value + nudges[i + 1])} ${bottom.y - BAND} H ${px(bottom.value)} Z`}
              fill={K.out}
              fillOpacity={0.12}
              {...fade(step >= 1, 0.2 + i * 0.35)}
            />
            <MathText x={444} y={mid - 8} size={13} anchor="end" fill={K.muted}>
              {link.fn}
            </MathText>
            <motion.g {...fade(step === 2, 0.2 + i * 0.2)}>
              <MathText x={444} y={mid + 10} size={13} anchor="end" fill={K.outInk}>
                {link.rate}
              </MathText>
            </motion.g>
          </g>
        );
      })}

      <motion.g {...fade(step === 2, 0.6)}>
        <MathText x={444} y={12} size={13} anchor="end" fill={K.ink}>
          {`dy/dx = ${fmt(CHAIN.du, 0)} × ${fmt(CHAIN.dy, 0)} = ${fmt(CHAIN.total, 0)}`}
        </MathText>
      </motion.g>
    </Figure>
  );
}
