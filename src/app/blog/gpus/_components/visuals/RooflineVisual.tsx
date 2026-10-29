"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { useLevel } from "@/components/blog/Level";
import type { Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { GPU, RIDGE, attainable, fmt } from "../model";
import { ExpertCode, K, Num, Slider, useTween } from "../svg";

const CODE = `peak, bandwidth = 989e12, 3.35e12
ridge = peak / bandwidth

def attainable(flops, bytes):
    return min(peak, flops / bytes * bandwidth)

relu = attainable(n, 2 * n + 2 * n)
matvec = attainable(2 * n * n, 2 * n * n)
matmul = attainable(2 * n**3, 3 * 2 * n**2)
fused = attainable(3 * n, 2 * n + 2 * n)`;

const FOCUS: Focus[][] = [[0, 1, 3, 4], [6], [7, 8], [8], [9]];

const AREA = { left: 64, top: 18, width: 372, height: 178 };
const X = [-1, 4] as const;
const Y = [11, 15.3] as const;
const px = (i: number) => AREA.left + ((Math.log10(i) - X[0]) / (X[1] - X[0])) * AREA.width;
const py = (f: number) => AREA.top + ((Y[1] - Math.log10(f)) / (Y[1] - Y[0])) * AREA.height;
const at = (i: number): [number, number] => [px(i), py(attainable(i))];

const ROOF = `M ${px(10 ** X[0])} ${py(attainable(10 ** X[0]))} L ${px(RIDGE)} ${py(GPU.bf16)} L ${px(10 ** X[1])} ${py(GPU.bf16)}`;
const SIZES = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];

function Point({
  i,
  label,
  color,
  shown,
}: {
  i: number;
  label: string;
  color: string;
  shown: boolean;
}) {
  const transition = useTween();
  const [x, y] = at(i);
  return (
    <motion.g initial={false} animate={{ x, y, opacity: shown ? 1 : 0 }} transition={transition}>
      <circle r={5} fill={color} />
      <Label x={8} y={14} size={11} anchor="start" fill={color} weight={600}>
        {label}
      </Label>
    </motion.g>
  );
}

export default function RooflineVisual() {
  const { step } = useStage();
  const { reaches } = useLevel();
  const detail = reaches("mechanics");
  const [size, setSize] = useState(6);
  const n = SIZES[size];
  const live = step === 3;
  const fused = step === 4;
  const intensity = n / 3;

  return (
    <Figure
      viewBox="0 0 460 236"
      interactive={live}
      top={<ExpertCode code={CODE} focus={FOCUS[step]} />}
      controls={
        <Slider
          label="matrix size n"
          value={size}
          min={0}
          max={SIZES.length - 1}
          onChange={setSize}
          display={fmt(n)}
          hidden={!live}
        />
      }
      label={`A roofline plot. Performance rises with arithmetic intensity until it reaches the peak of ${fmt(GPU.bf16 / 1e12)} TFLOP/s at ${fmt(RIDGE)} FLOPs per byte. Elementwise operations sit far to the left, large matrix multiplications on the flat roof.`}
    >
      <rect x={AREA.left} y={AREA.top} width={px(RIDGE) - AREA.left} height={AREA.height} fill={K.memSoft} opacity={0.45} />
      <rect x={px(RIDGE)} y={AREA.top} width={AREA.left + AREA.width - px(RIDGE)} height={AREA.height} fill={K.gpuSoft} opacity={0.45} />
      {[0, 1, 2, 3, 4].map((e) => (
        <g key={e}>
          <line x1={px(10 ** e)} x2={px(10 ** e)} y1={AREA.top} y2={AREA.top + AREA.height} stroke={K.grid} />
          <Label x={px(10 ** e)} y={AREA.top + AREA.height + 12} size={10}>
            {fmt(10 ** e)}
          </Label>
        </g>
      ))}
      {[12, 13, 14, 15].map((e) => (
        <g key={e}>
          <line x1={AREA.left} x2={AREA.left + AREA.width} y1={py(10 ** e)} y2={py(10 ** e)} stroke={K.grid} />
          <Label x={AREA.left - 6} y={py(10 ** e)} size={10} anchor="end">
            {`${fmt(10 ** (e - 12))} T`}
          </Label>
        </g>
      ))}
      <Label x={AREA.left + AREA.width / 2} y={AREA.top + AREA.height + 30} size={11} fill={K.ink}>
        {detail ? "arithmetic intensity (FLOP per byte)" : "operations per byte fetched"}
      </Label>
      <text
        x={14}
        y={AREA.top + AREA.height / 2}
        fontSize={11}
        fill={K.ink}
        textAnchor="middle"
        transform={`rotate(-90 14 ${AREA.top + AREA.height / 2})`}
      >
        {detail ? "FLOP/s" : "speed"}
      </text>

      <path d={ROOF} fill="none" stroke={K.ink} strokeWidth={2.5} strokeLinejoin="round" />
      <Label x={(AREA.left + px(RIDGE)) / 2} y={AREA.top + AREA.height - 12} size={11} fill={K.mem} weight={600}>
        {detail ? "memory-bound" : "waiting for data"}
      </Label>
      <Label x={(px(RIDGE) + AREA.left + AREA.width) / 2} y={AREA.top + AREA.height - 12} size={11} fill={K.gpuInk} weight={600}>
        {detail ? "compute-bound" : "busy computing"}
      </Label>
      <line x1={px(RIDGE)} x2={px(RIDGE)} y1={py(GPU.bf16)} y2={AREA.top + AREA.height} stroke={K.ink} strokeDasharray="3 4" />
      <Label x={px(RIDGE)} y={py(GPU.bf16) - 10} size={10} fill={K.ink}>
        {`ridge ${fmt(RIDGE)}`}
      </Label>

      <Point i={fused ? 0.75 : 0.25} label={fused ? "3 ops, fused" : "ReLU"} color={K.mem} shown={step >= 1} />
      <Point i={1} label={detail ? "matrix × vector" : "one word at a time"} color={K.violet} shown={step === 2} />
      <Point i={4096 / 3} label={detail ? "4096² matmul" : "big matrix product"} color={K.gpuInk} shown={step === 2} />
      <Point i={intensity} label={`n = ${fmt(n)}`} color={K.gpuInk} shown={live} />

      <motion.g {...fade(live)}>
        <Num
          x={AREA.left + 10}
          y={AREA.top + 12}
          value={attainable(intensity) / GPU.bf16}
          format={(v) => `${fmt(v * 100)}% of peak`}
          anchor="start"
          size={12}
          fill={K.ink}
          weight={600}
        />
      </motion.g>
    </Figure>
  );
}
