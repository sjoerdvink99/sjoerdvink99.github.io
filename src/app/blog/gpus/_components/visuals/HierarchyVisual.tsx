"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { useLevel } from "@/components/blog/Level";
import { Figure, Label, fade } from "@/components/blog/svg";
import { GPU, MEMORY, RIDGE, fmt, si } from "../model";
import { Box, K } from "../svg";

const FEED = { x: 30, w: 400 };
const COLS = { size: 150, bandwidth: 300, w: 100 };
const ROW = (i: number) => 76 + i * 42;
const log = (v: number, lo: number, hi: number) =>
  ((Math.log10(v) - lo) / (hi - lo)) * COLS.w;

export default function HierarchyVisual() {
  const { step } = useStage();
  const { reaches } = useLevel();
  const detail = reaches("mechanics");
  const feed = step === 0;
  const numbers = GPU.hbm / 2;

  return (
    <Figure
      viewBox="0 0 460 250"
      label={`The GPU can do ${fmt(RIDGE)} operations in the time it takes to fetch one byte from memory. Memory closer to the lanes is smaller and faster: registers, shared memory, L2 cache and HBM.`}
    >
      <motion.g {...fade(feed)}>
        {[
          { y: 70, name: detail ? "math" : "doing arithmetic", value: detail ? `${fmt(GPU.bf16 / 1e12)} TFLOP/s` : `${fmt(GPU.bf16 / 1e12)} trillion operations per second`, w: FEED.w, fill: K.gpu },
          { y: 140, name: detail ? "memory" : "fetching numbers", value: detail ? `${fmt(GPU.hbm / 1e12, 2)} TB/s` : `${fmt(numbers / 1e12, 2)} trillion numbers per second`, w: FEED.w / RIDGE, fill: K.mem },
        ].map((b) => (
          <g key={b.y}>
            <Label x={FEED.x} y={b.y - 14} size={11} anchor="start" fill={K.ink} weight={600}>
              {b.name}
            </Label>
            <Label x={FEED.x + FEED.w} y={b.y - 14} size={11} anchor="end">
              {b.value}
            </Label>
            <rect x={FEED.x} y={b.y} width={FEED.w} height={22} rx={3} fill={K.cell} />
            <Box x={FEED.x} y={b.y} width={feed ? Math.max(b.w, 2) : 0} height={22} rx={3} fill={b.fill} />
          </g>
        ))}
        <Label x={230} y={210} size={13} fill={K.ink}>
          {detail
            ? `${fmt(RIDGE)} FLOPs for every byte loaded`
            : `${fmt(RIDGE * 2)} operations for every number fetched`}
        </Label>
      </motion.g>

      <motion.g {...fade(!feed)}>
        <Label x={COLS.size} y={36} size={11} anchor="start" fill={K.ink} weight={600}>
          size
        </Label>
        <motion.g {...fade(step >= 2)}>
          <Label x={COLS.bandwidth} y={36} size={11} anchor="start" fill={K.ink} weight={600}>
            {detail ? "bandwidth" : "speed"}
          </Label>
        </motion.g>
        {MEMORY.map((m, i) => {
          const y = ROW(i);
          return (
            <g key={m.name}>
              <Label x={16} y={y - 6} size={12} anchor="start" fill={K.ink} weight={600}>
                {detail ? m.name : m.kitchen}
              </Label>
              <Label x={16} y={y + 9} size={10} anchor="start">
                {detail ? m.where : m.name}
              </Label>
              <Box x={COLS.size} y={y - 7} width={log(m.size, 6.5, 11)} height={14} fill={i === 3 ? K.mem : K.slate} />
              <Label x={COLS.size + log(m.size, 6.5, 11) + 6} y={y} size={10} anchor="start">
                {si(m.size, "B", 0)}
              </Label>
              <motion.g {...fade(step >= 2, i * 0.08)}>
                <rect x={COLS.bandwidth} y={y - 7} width={log(m.bandwidth, 11.5, 15)} height={14} rx={2} fill={i === 3 ? K.mem : K.gpu} />
                <Label x={COLS.bandwidth + log(m.bandwidth, 11.5, 15) + 6} y={y} size={10} anchor="start">
                  {si(m.bandwidth, "B/s", 2)}
                </Label>
              </motion.g>
            </g>
          );
        })}
        <motion.g {...fade(step >= 2)}>
          <Label x={230} y={ROW(3) + 34} size={10}>
            {detail ? "approximate, log scale; latency grows from ~1 to ~500 cycles" : "closer is smaller and faster"}
          </Label>
        </motion.g>
      </motion.g>
    </Figure>
  );
}
