"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label } from "@/components/blog/svg";
import { K } from "../svg";

const CODE = `class TransformerBlock(nn.Module):
    def __init__(self, D, H):
        super().__init__()
        self.attn = MultiHeadAttention(D, H)
        self.norm1 = nn.LayerNorm(D)
        self.mlp = nn.Sequential(
            nn.Linear(D, 4 * D), nn.GELU(), nn.Linear(4 * D, D))
        self.norm2 = nn.LayerNorm(D)

    def forward(self, X):
        X = self.norm1(X + self.attn(X))
        X = self.norm2(X + self.mlp(X))
        return X`;

const FOCUS: Focus[][] = [
  [3, [10, "self.attn(X)"]],
  [4, [10, "self.norm1(X + "]],
  [5, 6, [11, "self.mlp(X)"]],
  [7, [11, "self.norm2(X + "], 12],
];

const CX = 200;
const LANE = 26;
const LANES = [-2, -1, 0, 1, 2].map((k) => CX + k * LANE);
const BOX = { x: CX - 76, w: 152 };
const ATT = { y: 58, h: 52 };
const ADD1 = 130;
const NORM1 = 146;
const MLP = { y: 186, h: 46 };
const ADD2 = 252;
const NORM2 = 268;
const OUT_Y = 308;
const SKIP_X = BOX.x - 26;
const NOTE_X = BOX.x + BOX.w + 22;

function Part({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <motion.g initial={false} animate={{ opacity: on ? 1 : 0.32 }} transition={{ duration: 0.5 }}>
      {children}
    </motion.g>
  );
}

function Tokens({ y, color, fill }: { y: number; color: string; fill: string }) {
  return (
    <g>
      {LANES.map((x) => (
        <rect key={x} x={x - 8} y={y - 8} width={16} height={16} rx={2} fill={fill} stroke={color} strokeOpacity={0.6} />
      ))}
    </g>
  );
}

function Plus({ y }: { y: number }) {
  return (
    <g stroke={K.muted} strokeWidth={1.25}>
      <circle cx={CX} cy={y} r={7} fill="#fff" />
      <path d={`M ${CX - 4} ${y} H ${CX + 4} M ${CX} ${y - 4} V ${y + 4}`} />
    </g>
  );
}

function Norm({ y }: { y: number }) {
  return (
    <g>
      <rect x={BOX.x} y={y} width={BOX.w} height={18} rx={9} fill="#fff" stroke={K.faint} />
      <Label x={CX} y={y + 9} size={10} fill={K.muted}>
        LayerNorm
      </Label>
    </g>
  );
}

function Skip({ from, to }: { from: number; to: number }) {
  return (
    <path
      d={`M ${CX} ${from} H ${SKIP_X + 6} Q ${SKIP_X} ${from} ${SKIP_X} ${from + 6} V ${to - 6} Q ${SKIP_X} ${to} ${SKIP_X + 6} ${to} H ${CX - 7}`}
      fill="none"
      stroke={K.muted}
      strokeWidth={1.25}
    />
  );
}

function Note({ y, title, body }: { y: number; title: string; body: string }) {
  return (
    <g>
      <Label x={NOTE_X} y={y - 7} size={11} anchor="start" fill={K.x}>
        {title}
      </Label>
      <Label x={NOTE_X} y={y + 9} size={10} anchor="start" fill={K.muted}>
        {body}
      </Label>
    </g>
  );
}

export default function BlockVisual() {
  const { step } = useStage();

  return (
    <Figure
      viewBox="0 0 460 330"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A Transformer block. Multi-head attention mixes information across tokens, a residual connection adds the input back and LayerNorm normalizes each token. An MLP then transforms each token on its own, followed by a second residual connection and LayerNorm. The output has the same shape as the input."
    >
      {/* spine */}
      <path
        d={[
          [28, ATT.y],
          [ATT.y + ATT.h, ADD1 - 7],
          [ADD1 + 7, NORM1],
          [NORM1 + 18, MLP.y],
          [MLP.y + MLP.h, ADD2 - 7],
          [ADD2 + 7, NORM2],
          [NORM2 + 18, OUT_Y - 8],
        ]
          .map(([a, b]) => `M ${CX} ${a} V ${b}`)
          .join(" ")}
        stroke={K.faint}
        strokeWidth={1.25}
      />

      <Tokens y={20} color={K.x} fill="#fff" />
      <Label x={LANES[0] - 16} y={20} size={10} anchor="end" mono fill={K.shape}>
        (T, D)
      </Label>

      <Part on={step === 0}>
        <rect x={BOX.x} y={ATT.y} width={BOX.w} height={ATT.h} rx={6} fill="#fff" stroke={K.x} strokeOpacity={0.5} />
        {LANES.map((a, i) =>
          LANES.map((b, j) => (
            <line
              key={`${i}${j}`}
              x1={a}
              y1={ATT.y + 8}
              x2={b}
              y2={ATT.y + ATT.h - 8}
              stroke={K.v}
              strokeOpacity={i === j ? 0.5 : 0.28}
            />
          )),
        )}
        <Note y={ATT.y + ATT.h / 2} title="multi-head attention" body="tokens exchange information" />
      </Part>

      <Part on={step === 1}>
        <Skip from={40} to={ADD1} />
        <Plus y={ADD1} />
        <Norm y={NORM1} />
        <Note y={ADD1 + 12} title="add and normalize" body="input added back, rescaled" />
      </Part>

      <Part on={step === 2}>
        {LANES.map((x) => (
          <rect key={x} x={x - 9} y={MLP.y} width={18} height={MLP.h} rx={4} fill={K.posSoft} stroke={K.x} strokeOpacity={0.4} />
        ))}
        <Note y={MLP.y + MLP.h / 2} title="MLP" body="each token on its own" />
      </Part>

      <Part on={step === 3}>
        <Skip from={NORM1 + 26} to={ADD2} />
        <Plus y={ADD2} />
        <Norm y={NORM2} />
        <Tokens y={OUT_Y} color={K.v} fill={K.vSoft} />
        <Label x={LANES[0] - 16} y={OUT_Y} size={10} anchor="end" mono fill={K.shape}>
          (T, D)
        </Label>
        <Note y={OUT_Y} title="same shape out" body="ready for the next block" />
      </Part>
    </Figure>
  );
}
