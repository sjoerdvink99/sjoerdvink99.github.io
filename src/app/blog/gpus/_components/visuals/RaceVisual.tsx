"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { useLevel } from "@/components/blog/Level";
import type { Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { range } from "../model";
import { ExpertCode, K, useClock } from "../svg";

const CODE = `__global__ void matmul(float* A, float* B, float* C, int n) {
    int i = blockIdx.y * blockDim.y + threadIdx.y;
    int j = blockIdx.x * blockDim.x + threadIdx.x;
    float acc = 0;
    for (int k = 0; k < n; k++)
        acc += A[i * n + k] * B[k * n + j];
    C[i * n + j] = acc;
}

matmul<<<dim3(n / 16, n / 16), dim3(16, 16)>>>(A, B, C, n);`;

const FOCUS: Focus[][] = [[3, 4, 5, 6], [1, 2], [9]];

const N = 16;
const CELL = 11;
const CORES = 8;
const LATENCY = 4;
const TICKS = (N * N) / CORES;
const LOOP = TICKS + 10;
const GRIDS = { cpu: { x: 34, y: 46 }, gpu: { x: 250, y: 46 } };
const SIZE = N * CELL;
const PICK = 5 * N + 9;

function Grid({
  at,
  done,
  busy,
  color,
  mark,
  pick,
}: {
  at: { x: number; y: number };
  done: (i: number) => boolean;
  busy: (i: number) => boolean;
  color: (i: number) => string;
  mark: string;
  pick: boolean;
}) {
  return (
    <g>
      {range(N * N).map((i) => (
        <rect
          key={i}
          x={at.x + (i % N) * CELL}
          y={at.y + Math.floor(i / N) * CELL}
          width={CELL - 1.5}
          height={CELL - 1.5}
          rx={1.5}
          fill={busy(i) ? K.ink : done(i) ? color(i) : pick && i === PICK ? mark : K.cell}
          style={{ transition: "fill 160ms" }}
        />
      ))}
    </g>
  );
}

export default function RaceVisual() {
  const { step } = useStage();
  const { reaches } = useLevel();
  const tick = useClock(step >= 1, 110, LOOP);
  const gpu = step >= 2;
  const cpuDone = Math.min(tick, TICKS) * CORES;
  const gpuTick = Math.min(tick, LATENCY);

  return (
    <Figure
      viewBox="0 0 460 280"
      top={<ExpertCode code={CODE} focus={FOCUS[step]} />}
      label="Two copies of the same 16 by 16 output grid. A CPU with 8 cores fills it 8 cells at a time. A GPU starts every cell at once and finishes long before the CPU."
    >
      {(["cpu", "gpu"] as const).map((k) => (
        <motion.g key={k} {...fade(k === "cpu" || gpu || step === 0)}>
          <Label x={GRIDS[k].x} y={GRIDS[k].y - 26} size={12} anchor="start" fill={k === "cpu" ? K.cpu : K.gpuInk} weight={600}>
            {k.toUpperCase()}
          </Label>
          <Label x={GRIDS[k].x + SIZE} y={GRIDS[k].y - 26} size={11} anchor="end">
            {k === "cpu"
              ? reaches("mechanics") ? "8 cores, 4 GHz" : "8 fast workers"
              : reaches("mechanics") ? "16,896 lanes, 1.8 GHz" : "thousands of slow workers"}
          </Label>
        </motion.g>
      ))}

      <Grid
        at={GRIDS.cpu}
        pick={step === 0}
        mark={K.cpu}
        done={(i) => step >= 1 && i < cpuDone}
        busy={(i) => step >= 1 && tick < TICKS && i >= cpuDone && i < cpuDone + CORES}
        color={() => K.cpu}
      />
      <motion.g {...fade(gpu || step === 0)}>
        <Grid
          at={GRIDS.gpu}
          pick={step === 0}
          mark={K.gpu}
          done={() => gpu && gpuTick >= LATENCY}
          busy={() => gpu && gpuTick < LATENCY}
          color={(i) => (Math.floor(i / 32) % 2 ? K.gpu : "#f59e0b")}
        />
      </motion.g>

      <motion.g {...fade(step === 0)}>
        <Label x={230} y={GRIDS.cpu.y + SIZE + 22} size={11} fill={K.ink}>
          each cell is one dot product, independent of every other cell
        </Label>
      </motion.g>

      <motion.g {...fade(step >= 1)}>
        <Label x={GRIDS.cpu.x + SIZE / 2} y={GRIDS.cpu.y + SIZE + 22} size={12} fill={K.cpu}>
          {`${Math.min(cpuDone, N * N)} / ${N * N} cells`}
        </Label>
      </motion.g>
      <motion.g {...fade(gpu)}>
        <Label x={GRIDS.gpu.x + SIZE / 2} y={GRIDS.gpu.y + SIZE + 22} size={12} fill={K.gpuInk}>
          {gpuTick >= LATENCY ? `done in ${LATENCY} ticks, then idle` : "every cell at once"}
        </Label>
      </motion.g>
      <motion.g {...fade(step >= 1)}>
        <Label x={230} y={GRIDS.cpu.y + SIZE + 48} size={11}>
          {`tick ${Math.min(tick, TICKS)}`}
        </Label>
      </motion.g>
    </Figure>
  );
}
