"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { TOKENS } from "../model";
import { K } from "../svg";

const CODE = `class Transformer(nn.Module):
    def __init__(self, vocab, D, H, n_blocks, max_len):
        super().__init__()
        self.token_emb = nn.Embedding(vocab, D)
        self.pos_emb = nn.Embedding(max_len, D)
        self.blocks = nn.Sequential(
            *[TransformerBlock(D, H) for _ in range(n_blocks)])
        self.out = nn.Linear(D, vocab)

    def forward(self, tokens):                    # (B, T)
        positions = torch.arange(tokens.size(1), device=tokens.device)
        X = self.token_emb(tokens) + self.pos_emb(positions)
        X = self.blocks(X)                        # (B, T, D)
        return self.out(X)                        # (B, T, vocab)`;

const FOCUS: Focus[][] = [
  [3, 4, 10, 11],
  [[6, "TransformerBlock(D, H)"], 12],
  [5, 6, 12],
  [7, 13],
];

const CX = 200;
const LANE = 30;
const LANES = [-2, -1, 0, 1, 2].map((k) => CX + k * LANE);
const BLOCK = { x: CX - 76, w: 152, h: 40 };
const BLOCK_Y = [92, 146, 200];
const NOTE_X = BLOCK.x + BLOCK.w + 22;

function Strip({ y, color, fill }: { y: number; color: string; fill: string }) {
  return (
    <g>
      {LANES.map((x) => (
        <rect key={x} x={x - 8} y={y - 8} width={16} height={16} rx={2} fill={fill} stroke={color} strokeOpacity={0.6} />
      ))}
    </g>
  );
}

/** The block from the previous figure, folded into one unit. */
function TransformerBlock({ y }: { y: number }) {
  return (
    <g>
      <rect x={BLOCK.x} y={y} width={BLOCK.w} height={BLOCK.h} rx={6} fill="#fff" stroke={K.x} strokeOpacity={0.5} />
      {LANES.map((a, i) =>
        LANES.map((b, j) => (
          <line key={`${i}${j}`} x1={a} y1={y + 6} x2={b} y2={y + 20} stroke={K.v} strokeOpacity={0.22} />
        )),
      )}
      {LANES.map((x) => (
        <rect key={x} x={x - 6} y={y + 24} width={12} height={10} rx={2} fill={K.posSoft} stroke={K.x} strokeOpacity={0.3} />
      ))}
    </g>
  );
}

export default function ModelVisual() {
  const { step } = useStage();
  const blocks = step === 0 ? 0 : step === 1 ? 1 : 3;
  const head = step >= 3;

  return (
    <Figure
      viewBox="0 0 460 320"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A small Transformer. Tokens become vectors through a token embedding plus a position embedding, pass through a stack of three Transformer blocks, and a final linear layer turns each vector into scores over the vocabulary."
    >
      <path d={`M ${CX} 30 V ${head ? 278 : 66 + blocks * 54}`} stroke={K.faint} strokeWidth={1.25} />

      {TOKENS.map((t, i) => (
        <Label key={i} x={LANES[i]} y={16} size={10} fill={K.x}>
          {t}
        </Label>
      ))}

      <Strip y={56} color={K.x} fill="#fff" />
      <Label x={NOTE_X} y={49} size={11} anchor="start" fill={K.x}>
        embedding + position
      </Label>
      <Label x={NOTE_X} y={65} size={10} anchor="start" mono fill={K.shape}>
        (B, T, D)
      </Label>

      {BLOCK_Y.map((y, b) => (
        <motion.g key={y} {...fade(blocks > b, b * 0.15)}>
          <TransformerBlock y={y} />
        </motion.g>
      ))}
      <motion.g {...fade(blocks === 1, 0.2)}>
        <Label x={NOTE_X} y={BLOCK_Y[0] + 20} size={11} anchor="start" fill={K.x}>
          Transformer block
        </Label>
      </motion.g>
      <motion.g {...fade(blocks === 3, 0.4)}>
        <path
          d={`M ${NOTE_X - 8} ${BLOCK_Y[0]} h 4 V ${BLOCK_Y[2] + BLOCK.h} h -4`}
          fill="none"
          stroke={K.faint}
        />
        <Label x={NOTE_X + 4} y={(BLOCK_Y[0] + BLOCK_Y[2] + BLOCK.h) / 2 - 8} size={11} anchor="start" fill={K.x}>
          n_blocks = 3
        </Label>
        <Label x={NOTE_X + 4} y={(BLOCK_Y[0] + BLOCK_Y[2] + BLOCK.h) / 2 + 8} size={10} anchor="start" mono fill={K.shape}>
          (B, T, D) throughout
        </Label>
      </motion.g>

      <motion.g {...fade(head, 0.3)}>
        <rect x={BLOCK.x} y={254} width={BLOCK.w} height={18} rx={9} fill="#fff" stroke={K.faint} />
        <Label x={CX} y={263} size={10} fill={K.muted}>
          Linear
        </Label>
        <Strip y={296} color={K.v} fill={K.vSoft} />
        <Label x={NOTE_X} y={289} size={11} anchor="start" fill={K.v}>
          scores over the vocabulary
        </Label>
        <Label x={NOTE_X} y={305} size={10} anchor="start" mono fill={K.shape}>
          (B, T, vocab)
        </Label>
      </motion.g>
    </Figure>
  );
}
