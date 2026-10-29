"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { useLevel } from "@/components/blog/Level";
import type { Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { BATCHES, DECODE, GPU, fmt } from "../model";
import { Box, Choice, ExpertCode, K, Num } from "../svg";

const CODE = `weights = 2 * params
kv = 2 * layers * kv_heads * head_dim * 2 * context

def step_time(batch):
    read = (weights + batch * kv) / bandwidth
    math = batch * 2 * params / peak
    return max(read, math)

tokens_per_second = batch / step_time(batch)`;

const FOCUS: Focus[][] = [[0, 4], [5, 6, 8], [4, 5, 6], [1, 4]];

const BAR = { x: 20, w: 420 };
const GB = BAR.w / (GPU.memory / 1e9);
const MS = BAR.w / 20;
const ROWS = [118, 150, 182];
const OPTIONS = BATCHES.map((b) => ({ label: String(b), value: b }));

export default function DecodeVisual() {
  const { step } = useStage();
  const { reaches } = useLevel();
  const detail = reaches("mechanics");
  const [picked, setPicked] = useState(32);
  const batch = step >= 2 ? picked : 1;
  const cache = step === 3;
  const kv = cache ? batch * DECODE.kvSequence : 0;
  const full = DECODE.weights + kv > GPU.memory;
  const weightsMs = (DECODE.weights / GPU.hbm) * 1e3;
  const kvMs = (kv / GPU.hbm) * 1e3;
  const mathMs = DECODE.math(batch) * 1e3;
  const total = DECODE.time(batch, cache) * 1e3;
  const rows = [
    { name: detail ? "read weights" : "fetch the model", ms: weightsMs, fill: K.violet, shown: true },
    { name: detail ? "read KV cache" : "fetch the memory of the text", ms: kvMs, fill: K.mem, shown: cache },
    { name: detail ? "math" : "do the arithmetic", ms: mathMs, fill: K.gpu, shown: true },
  ];

  return (
    <Figure
      viewBox="0 0 460 280"
      interactive={step >= 2}
      top={<ExpertCode code={CODE} focus={FOCUS[step]} />}
      controls={<Choice label="batch" options={OPTIONS} value={picked} onChange={setPicked} hidden={step < 2} />}
      label={`Generating one token with an 8 billion parameter model reads all ${fmt(DECODE.weights / 1e9)} GB of weights from memory, which takes far longer than the arithmetic. Batching many sequences shares that read, until the KV cache fills the GPU's memory.`}
    >
      <Label x={BAR.x} y={22} size={11} anchor="start" fill={K.ink} weight={600}>
        {detail ? `HBM, ${fmt(GPU.memory / 1e9)} GB` : "GPU memory"}
      </Label>
      <rect x={BAR.x} y={34} width={BAR.w} height={20} rx={3} fill={K.cell} />
      <Box x={BAR.x} y={34} width={(DECODE.weights / 1e9) * GB} height={20} fill={K.violet} />
      <Box
        x={BAR.x + (DECODE.weights / 1e9) * GB + 1}
        y={34}
        width={Math.min(kv / 1e9, (GPU.memory - DECODE.weights) / 1e9) * GB - 1}
        height={20}
        fill={full ? "#be123c" : K.mem}
      />
      <Label x={BAR.x + 4} y={66} size={10} anchor="start" fill={K.violet}>
        {`weights ${fmt(DECODE.weights / 1e9)} GB`}
      </Label>
      <motion.g {...fade(cache)}>
        <Label x={BAR.x + BAR.w} y={66} size={10} anchor="end" fill={full ? "#be123c" : K.mem} weight={full ? 600 : undefined}>
          {full
            ? `out of memory: at most ${DECODE.maxBatch} sequences`
            : `KV cache ${fmt(kv / 1e9)} GB for ${batch} × ${fmt(DECODE.context)} tokens`}
        </Label>
      </motion.g>

      <Label x={BAR.x} y={96} size={11} anchor="start" fill={K.ink} weight={600}>
        {detail ? "one decode step" : "time to write the next word"}
      </Label>
      {rows.map((r, i) => (
        <motion.g key={r.name} {...fade(r.shown)}>
          <Label x={BAR.x} y={ROWS[i] - 11} size={10} anchor="start">
            {r.name}
          </Label>
          <Box x={BAR.x} y={ROWS[i] - 3} width={Math.max(Math.min(r.ms * MS, BAR.w), 1.5)} height={10} fill={r.fill} />
          <Num
            x={BAR.x + BAR.w}
            y={ROWS[i] - 11}
            value={r.ms}
            format={(v) => `${v < 0.1 ? v.toFixed(3) : v.toFixed(1)} ms`}
            anchor="end"
            size={10}
            fill={K.ink}
          />
        </motion.g>
      ))}

      <g>
        {full ? (
          <Label x={BAR.x} y={230} size={26} anchor="start" fill={K.ink}>
            —
          </Label>
        ) : (
          <Num x={BAR.x} y={230} value={DECODE.rate(batch, cache)} format={(v) => fmt(v)} anchor="start" size={26} fill={K.ink} weight={300} />
        )}
        <Label x={BAR.x} y={256} size={10} anchor="start">
          {batch === 1 ? "tokens per second" : `tokens per second, across ${batch} sequences`}
        </Label>
        <Num
          x={BAR.x + BAR.w}
          y={230}
          value={(mathMs / total) * 100}
          format={(v) => `${v < 1 ? v.toFixed(1) : fmt(v)}%`}
          anchor="end"
          size={26}
          fill={K.gpuInk}
          weight={300}
        />
        <Label x={BAR.x + BAR.w} y={256} size={10} anchor="end">
          {detail ? "of peak FLOP/s in use" : "of the arithmetic in use"}
        </Label>
      </g>
    </Figure>
  );
}
