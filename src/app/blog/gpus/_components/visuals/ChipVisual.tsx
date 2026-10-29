"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { useLevel } from "@/components/blog/Level";
import { Figure, Label, fade } from "@/components/blog/svg";
import { GPU, fmt, range } from "../model";
import { K, useClock } from "../svg";

const CPU_DIE = { x: 20, y: 40, w: 180, h: 180 };
const GPU_DIE = { x: 278, y: 40, w: 134, h: 180 };
const SM = { cols: 12, rows: 11 };
const SM_W = (GPU_DIE.w - 8) / SM.cols;
const SM_H = (GPU_DIE.h - 18) / SM.rows;
const PART = { x: 16, y: 40, w: 80, gap: 6 };
const SPAN = 4 * PART.w + 3 * PART.gap;

function CpuDie() {
  return (
    <g>
      <rect x={CPU_DIE.x} y={CPU_DIE.y} width={CPU_DIE.w} height={CPU_DIE.h} rx={6} fill="#fff" stroke={K.faint} />
      {range(8).map((i) => {
        const x = CPU_DIE.x + 8 + (i % 2) * 86;
        const y = CPU_DIE.y + 8 + Math.floor(i / 2) * 34;
        return (
          <g key={i}>
            <rect x={x} y={y} width={78} height={28} rx={2} fill={K.cpuSoft} />
            <rect x={x + 4} y={y + 4} width={18} height={20} rx={1.5} fill={K.cpu} />
          </g>
        );
      })}
      <rect x={CPU_DIE.x + 8} y={CPU_DIE.y + 146} width={CPU_DIE.w - 16} height={26} rx={2} fill={K.slateSoft} />
      <Label x={CPU_DIE.x + CPU_DIE.w / 2} y={CPU_DIE.y + 159} size={10} fill={K.slate}>
        cache
      </Label>
    </g>
  );
}

function GpuDie() {
  return (
    <g>
      {range(6).map((i) => (
        <rect
          key={i}
          x={i < 3 ? GPU_DIE.x - 22 : GPU_DIE.x + GPU_DIE.w + 6}
          y={GPU_DIE.y + 6 + (i % 3) * 58}
          width={16}
          height={52}
          rx={2}
          fill={K.memSoft}
          stroke={K.mem}
          strokeWidth={0.75}
        />
      ))}
      <rect x={GPU_DIE.x} y={GPU_DIE.y} width={GPU_DIE.w} height={GPU_DIE.h} rx={6} fill="#fff" stroke={K.faint} />
      {range(GPU.sms).map((i) => {
        const r = Math.floor(i / SM.cols);
        return (
          <rect
            key={i}
            x={GPU_DIE.x + 4 + (i % SM.cols) * SM_W}
            y={GPU_DIE.y + 4 + r * SM_H + (r >= 6 ? 10 : 0)}
            width={SM_W - 1.5}
            height={SM_H - 1.5}
            rx={1}
            fill={K.gpu}
          />
        );
      })}
      <rect x={GPU_DIE.x + 4} y={GPU_DIE.y + 5 + 6 * SM_H} width={GPU_DIE.w - 8} height={7} rx={1} fill={K.slateSoft} />
    </g>
  );
}

function Partition({ p, pulse, lockstep }: { p: number; pulse: boolean; lockstep: boolean }) {
  const x = PART.x + p * (PART.w + PART.gap);
  const lit = lockstep && p === 0;
  return (
    <g>
      <rect x={x} y={PART.y} width={PART.w} height={150} rx={4} fill="#fff" stroke={K.faint} />
      <rect x={x + 4} y={PART.y + 4} width={PART.w - 8} height={14} rx={2} fill={lit ? K.ink : K.slateSoft} />
      {range(32).map((i) => (
        <motion.circle
          key={i}
          cx={x + 8.5 + (i % 8) * 9}
          cy={PART.y + 32 + Math.floor(i / 8) * 10}
          r={3}
          initial={false}
          animate={{ fill: lit && pulse ? K.ink : K.gpu, scale: lit && pulse ? 1.25 : 1 }}
          transition={{ duration: 0.18 }}
        />
      ))}
      <rect x={x + 4} y={PART.y + 76} width={PART.w - 8} height={34} rx={2} fill={K.gpuInk} />
      <rect x={x + 4} y={PART.y + 116} width={PART.w - 8} height={28} rx={2} fill={K.violetSoft} />
    </g>
  );
}

export default function ChipVisual() {
  const { step } = useStage();
  const { reaches } = useLevel();
  const detail = reaches("mechanics");
  const sm = step >= 2;
  const lockstep = step === 3;
  const pulse = useClock(lockstep, 500, 2) === 1;

  return (
    <Figure
      viewBox="0 0 460 260"
      label={`A CPU spends most of its chip on a few large cores and cache. A GPU tiles its chip with ${GPU.sms} streaming multiprocessors, each holding four groups of 32 lanes and four tensor cores.`}
    >
      <motion.g {...fade(!sm)}>
        <CpuDie />
        <Label x={CPU_DIE.x} y={CPU_DIE.y - 16} size={12} anchor="start" fill={K.cpu} weight={600}>
          CPU
        </Label>
        <Label x={CPU_DIE.x + CPU_DIE.w} y={CPU_DIE.y - 16} size={11} anchor="end">
          {detail ? "8 big cores" : "a few clever workers"}
        </Label>
        <motion.g {...fade(step >= 1)}>
          <GpuDie />
          <Label x={GPU_DIE.x - 22} y={CPU_DIE.y - 16} size={12} anchor="start" fill={K.gpuInk} weight={600}>
            GPU
          </Label>
          <Label x={GPU_DIE.x + GPU_DIE.w + 22} y={CPU_DIE.y - 16} size={11} anchor="end">
            {detail ? `${GPU.sms} SMs` : "many simple workers"}
          </Label>
          <Label x={GPU_DIE.x + GPU_DIE.w / 2} y={GPU_DIE.y + GPU_DIE.h + 16} size={10} fill={K.mem}>
            {detail ? "HBM stacks on both sides" : "memory on both sides"}
          </Label>
        </motion.g>
        <g>
          <rect x={CPU_DIE.x} y={CPU_DIE.y + CPU_DIE.h + 10} width={10} height={10} rx={2} fill={K.cpu} />
          <Label x={CPU_DIE.x + 16} y={CPU_DIE.y + CPU_DIE.h + 15} size={10} anchor="start">
            arithmetic
          </Label>
        </g>
      </motion.g>

      <motion.g {...fade(sm)}>
        <Label x={PART.x} y={PART.y - 16} size={12} anchor="start" fill={K.gpuInk} weight={600}>
          {detail ? "One streaming multiprocessor (SM)" : "One block of the GPU"}
        </Label>
        <Label x={PART.x + SPAN} y={PART.y - 16} size={11} anchor="end">
          {`1 of ${GPU.sms}`}
        </Label>
        {range(4).map((p) => (
          <Partition key={p} p={p} pulse={pulse} lockstep={lockstep} />
        ))}
        <rect x={PART.x} y={PART.y + 158} width={SPAN} height={22} rx={3} fill={K.memSoft} />
        <Label x={PART.x + SPAN / 2} y={PART.y + 169} size={10} fill={K.mem}>
          {detail ? `shared memory, up to ${fmt(GPU.smem / 1e3)} KB` : "a small, fast shared shelf"}
        </Label>
        {[
          { y: PART.y + 11, text: detail ? "warp scheduler" : "instructions", fill: K.slate },
          { y: PART.y + 47, text: detail ? "32 lanes" : "32 workers", fill: K.gpuInk },
          { y: PART.y + 93, text: detail ? "tensor core" : "matrix unit", fill: K.gpuInk },
          { y: PART.y + 130, text: detail ? "registers" : "scratch space", fill: K.violet },
        ].map((l) => (
          <Label key={l.text} x={PART.x + SPAN + 10} y={l.y} size={10} anchor="start" fill={l.fill}>
            {l.text}
          </Label>
        ))}
        <motion.g {...fade(lockstep)}>
          <Label x={PART.x + PART.w / 2} y={PART.y + 202} size={10} fill={K.ink} mono>
            {detail ? "FMA  acc, a, b" : "multiply, add"}
          </Label>
          <Label x={PART.x + 2 * PART.w + 1.5 * PART.gap} y={PART.y + 202} size={11} anchor="start">
            {detail ? "one warp: 32 threads, one instruction" : "32 workers, one instruction"}
          </Label>
        </motion.g>
      </motion.g>
    </Figure>
  );
}
