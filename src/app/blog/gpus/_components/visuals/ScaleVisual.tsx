"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { useLevel } from "@/components/blog/Level";
import type { Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { TRAIN, big, fmt, range } from "../model";
import { Calc, ExpertCode, K } from "../svg";

const CODE = `flops = 6 * ${TRAIN.params / 1e9}e9 * ${TRAIN.tokens / 1e12}e12
per_gpu = 989e12 * ${TRAIN.mfu}
gpu_hours = flops / per_gpu / 3600
days = gpu_hours / ${TRAIN.gpus} / 24`;

const FOCUS: Focus[][] = [[0], [1, 2], [3], [2]];

const COLS = 32;
const ROWS = 16;
const CELL = 10.5;
const GRID = { x: 96, y: 40 };
const PER = TRAIN.gpus / (COLS * ROWS);

export default function ScaleVisual() {
  const { step } = useStage();
  const { reaches } = useLevel();
  const all = step >= 2;
  const lines = [
    [`6 × ${big(TRAIN.params)} × ${big(TRAIN.tokens)} = ${(TRAIN.flops / 1e24).toFixed(1)} × 10²⁴ FLOP`],
    [`${(TRAIN.flops / 1e24).toFixed(1)} × 10²⁴ ÷ (989 T × ${TRAIN.mfu}) = ${fmt(TRAIN.years)} GPU-years`],
    [`${fmt(TRAIN.hours / 1e6, 1)} M GPU-hours ÷ ${fmt(TRAIN.gpus)} GPUs = ${fmt(TRAIN.days, 1)} days`],
    [`estimate ${fmt(TRAIN.hours / 1e6, 1)} M GPU-hours, published ${fmt(TRAIN.reported / 1e6, 1)} M`],
  ];

  return (
    <Figure
      viewBox="0 0 460 260"
      top={<ExpertCode code={CODE} focus={FOCUS[step]} />}
      label={`Training a ${big(TRAIN.params)} parameter model on ${big(TRAIN.tokens)} tokens takes about ${fmt(TRAIN.years)} years on one GPU, or ${fmt(TRAIN.days)} days on ${fmt(TRAIN.gpus)}.`}
    >
      <motion.g {...fade(step >= 1)}>
        <rect x={20} y={GRID.y} width={CELL * 2} height={CELL * 2} rx={2} fill={all ? K.cell : K.gpu} style={{ transition: "fill 400ms" }} />
        <Label x={20 + CELL} y={GRID.y + CELL * 2 + 14} size={10} fill={K.ink}>
          1 GPU
        </Label>
        <Label x={20 + CELL} y={GRID.y + CELL * 2 + 28} size={10} fill={all ? K.muted : K.gpuInk} weight={600}>
          {`${fmt(TRAIN.years)} years`}
        </Label>
      </motion.g>
      {range(COLS * ROWS).map((i) => (
        <motion.rect
          key={i}
          x={GRID.x + (i % COLS) * CELL}
          y={GRID.y + Math.floor(i / COLS) * CELL}
          width={CELL - 1.5}
          height={CELL - 1.5}
          rx={1}
          initial={false}
          animate={{ fill: all ? K.gpu : K.cell }}
          transition={{ duration: 0.3, delay: all ? (i % COLS) * 0.012 + Math.floor(i / COLS) * 0.03 : 0 }}
        />
      ))}
      <Label x={GRID.x} y={GRID.y - 14} size={11} anchor="start" fill={K.ink} weight={600}>
        {`${fmt(TRAIN.gpus)} GPUs`}
      </Label>
      <Label x={GRID.x + COLS * CELL} y={GRID.y - 14} size={10} anchor="end">
        {reaches("mechanics") ? `each square is ${PER} H100s` : `each square is ${PER} GPUs`}
      </Label>
      <motion.g {...fade(all)}>
        <Label x={GRID.x + (COLS * CELL) / 2} y={GRID.y + ROWS * CELL + 18} size={13} fill={K.gpuInk} weight={600}>
          {`${fmt(TRAIN.days, 0)} days`}
        </Label>
      </motion.g>
      <Calc x={230} y={GRID.y + ROWS * CELL + 46} steps={lines} step={step} size={11} />
    </Figure>
  );
}
