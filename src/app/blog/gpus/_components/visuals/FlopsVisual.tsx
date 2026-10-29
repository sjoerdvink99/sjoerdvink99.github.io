"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { useLevel } from "@/components/blog/Level";
import type { Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { FLOPS, MODEL, OPS, TRAIN, big, fmt, range, si, sum } from "../model";
import { Box, Calc, ExpertCode, K } from "../svg";

const CODE = `def flops_per_token(d, kv, ffn, layers, vocab, n):
    qkv = 2 * d * (d + 2 * kv)
    attention = 4 * n * d
    output = 2 * d * d
    mlp = 6 * d * ffn
    return layers * (qkv + attention + output + mlp) + 2 * d * vocab

training = 6 * params * tokens`;

const FOCUS: Focus[][] = [[0], [1, 2, 3, 4], [1, 3, 4], [5], [7]];

const TOWER = { x: 24, y: 28, w: 76, h: 184 };
const ROW = TOWER.h / MODEL.layers;
const PICK = 14;
const BAR = { x: 140, y: 92, w: 300, h: 30 };

const SEGMENTS = (() => {
  const total = sum(OPS.map((o) => o.flops));
  let x = BAR.x;
  return OPS.map((o) => {
    const w = (o.flops / total) * BAR.w;
    const seg = { ...o, x, w, share: o.flops / total };
    x += w;
    return seg;
  });
})();

const pickY = TOWER.y + (MODEL.layers - 1 - PICK) * ROW;

export default function FlopsVisual() {
  const { step } = useStage();
  const { reaches } = useLevel();
  const zoom = step >= 1;
  const split = step >= 2;
  const lines = [
    [],
    [],
    [],
    [
      `${MODEL.layers} layers × ${si(FLOPS.layer, "FLOP", 0)} + ${si(FLOPS.head, "FLOP")}`,
      `= ${si(FLOPS.token, "FLOP")} per token  ≈  2 × ${big(MODEL.params)} params`,
    ],
    [
      `6 × ${big(TRAIN.params)} params × ${big(TRAIN.tokens)} tokens`,
      `= ${(TRAIN.flops / 1e24).toFixed(1)} × 10²⁴ FLOP`,
    ],
  ];

  return (
    <Figure
      viewBox="0 0 460 270"
      top={<ExpertCode code={CODE} focus={FOCUS[step]} />}
      label={`A language model is a stack of ${MODEL.layers} layers. Inside one layer, ${(FLOPS.share * 100).toFixed(1)} percent of the arithmetic is matrix multiplication.`}
    >
      <Label x={TOWER.x + TOWER.w / 2} y={TOWER.y - 14} size={11} fill={K.ink}>
        next token
      </Label>
      <Label x={TOWER.x + TOWER.w / 2} y={TOWER.y + TOWER.h + 12} size={11} fill={K.ink}>
        token
      </Label>
      {range(MODEL.layers).map((i) => {
        const on = i === PICK && zoom;
        return (
          <motion.rect
            key={i}
            x={TOWER.x}
            y={TOWER.y + (MODEL.layers - 1 - i) * ROW + 0.6}
            width={TOWER.w}
            height={ROW - 1.2}
            rx={1}
            initial={false}
            animate={{ fill: on ? K.gpu : zoom ? "#e5e7eb" : K.gpuSoft }}
            transition={{ duration: 0.4, delay: zoom ? 0 : i * 0.02 }}
          />
        );
      })}
      <motion.g {...fade(!zoom)}>
        <Label x={TOWER.x + TOWER.w + 12} y={TOWER.y + TOWER.h / 2} size={11} anchor="start">
          {`${MODEL.layers} identical layers`}
        </Label>
      </motion.g>

      <motion.g {...fade(zoom)}>
        <path
          d={`M ${TOWER.x + TOWER.w} ${pickY} L ${BAR.x} ${BAR.y} M ${TOWER.x + TOWER.w} ${pickY + ROW} L ${BAR.x} ${BAR.y + BAR.h}`}
          stroke={K.axis}
          fill="none"
        />
        <Label x={BAR.x} y={BAR.y - 16} size={11} anchor="start" fill={K.ink}>
          one layer, one token
        </Label>
        {reaches("mechanics") && (
          <Label x={BAR.x + BAR.w} y={BAR.y - 16} size={11} anchor="end">
            {si(FLOPS.layer, "FLOP", 0)}
          </Label>
        )}
        {SEGMENTS.map((s, i) => (
          <g key={s.name}>
            <Box
              x={s.x}
              y={BAR.y}
              width={Math.max(s.w - 1.5, 1.5)}
              height={BAR.h}
              fill={split ? (s.matmul ? K.gpu : K.mem) : [K.gpuSoft, "#fde68a", K.gpuSoft, "#fde68a", K.mem][i]}
            />
            <Label
              x={s.matmul ? s.x + s.w / 2 : BAR.x + BAR.w}
              y={BAR.y + BAR.h + (s.matmul ? 14 : 44)}
              size={10}
              anchor={s.matmul ? "middle" : "end"}
              fill={s.matmul ? K.ink : K.mem}
            >
              {s.name}
            </Label>
            {s.matmul && (
              <Label x={s.x + s.w / 2} y={BAR.y + BAR.h + 28} size={10}>
                {`${fmt(s.share * 100)}%`}
              </Label>
            )}
          </g>
        ))}
        <path
          d={`M ${BAR.x + BAR.w - 0.5} ${BAR.y + BAR.h + 2} V ${BAR.y + BAR.h + 34}`}
          stroke={K.mem}
        />
      </motion.g>

      <motion.g {...fade(step === 2)}>
        <Label x={BAR.x + (BAR.w - 30) / 2} y={BAR.y + BAR.h + 68} size={13} fill={K.gpuInk} weight={600}>
          {`matrix multiplication: ${(FLOPS.share * 100).toFixed(1)}%`}
        </Label>
      </motion.g>

      <motion.g {...fade(step === 4)}>
        {[
          { name: "forward", share: 2, fill: K.gpu },
          { name: "backward", share: 4, fill: K.gpuInk },
        ].map((b, i) => (
          <g key={b.name}>
            <rect x={BAR.x + i * 100} y={BAR.y - 50} width={b.share * 50 - 2} height={14} rx={2} fill={b.fill} />
            <Label x={BAR.x + i * 100 + (b.share * 50) / 2} y={BAR.y - 61} size={10}>
              {`${b.name}: ${b.share}N`}
            </Label>
          </g>
        ))}
      </motion.g>

      <Calc x={BAR.x + BAR.w / 2} y={BAR.y + BAR.h + 100} steps={lines} step={step} size={11} />
    </Figure>
  );
}
