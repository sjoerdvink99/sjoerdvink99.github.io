"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, Sym, fade } from "@/components/blog/svg";
import { Block, K } from "../svg";

const CODE = `B, T, D = X.shape
H, D_head = self.H, D // self.H
Q = self.W_Q(X)                                # (B, T, D)
Q = Q.view(B, T, H, D_head)                    # (B, T, H, D_head)
Q = Q.transpose(1, 2)                          # (B, H, T, D_head)
# K and V are reshaped the same way
scores = Q @ K.transpose(-2, -1) / math.sqrt(D_head)
weights = torch.softmax(scores, dim=-1)        # (B, H, T, T)
heads = weights @ V                            # (B, H, T, D_head)
heads = heads.transpose(1, 2).reshape(B, T, D) # (B, T, D)
output = self.W_O(heads)                       # (B, T, D)`;

const FOCUS: Focus[][] = [[0, 2], [1, 3], [4, 5], [6, 7], [8], [9], [10]];

const SHAPES = [
  "(B, T, D)",
  "(B, T, H, D_head)",
  "(B, H, T, D_head)",
  "(B, H, T, T)",
  "(B, H, T, D_head)",
  "(B, T, D)",
  "(B, T, D)",
];

const U = 12;
const ROW_Y = [36, 146];
const Q_AT = { x: 196, y: 91 };
const SCORE_X = 262;
const OUT_X = 350;
const MERGE = { x: 322, y: 91 };
const FINAL_X = 398;

export default function ShapesVisual() {
  const { step } = useStage();
  const split = step >= 2;
  const scored = step >= 3;
  const valued = step >= 4;
  const merged = step >= 5;
  const projected = step >= 6;

  const headAt = (h: number) =>
    split ? { x: Q_AT.x, y: ROW_Y[h] } : { x: Q_AT.x + h * 2 * U, y: Q_AT.y };
  const outAt = (h: number) =>
    merged ? { x: MERGE.x + h * 2 * U, y: MERGE.y } : { x: OUT_X, y: ROW_Y[h] };

  return (
    <Figure
      viewBox="0 0 460 290"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Multi-head shapes. X is projected by W_Q into Q of shape B, T, D. The projected columns are split into two heads, each head computes its own T by T weights and its own output, and the head outputs are concatenated back to width D and projected by W_O."
    >
      {/* X and the projection that every head shares */}
      <motion.g
        initial={false}
        animate={{ opacity: split ? 0.35 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <Block x={18} y={Q_AT.y} rows={5} cols={4} u={U} batch />
        <Sym x={42} y={Q_AT.y + 76} size={15}>
          X
        </Sym>
        <path d={`M 76 ${Q_AT.y + 30} H 98`} stroke={K.faint} strokeWidth={1.25} />
        <Block x={104} y={Q_AT.y + 6} rows={4} cols={4} u={U} color={K.q} />
        <Sym x={128} y={Q_AT.y + 70} size={14} sub="Q" fill={K.q}>
          W
        </Sym>
        <Label x={128} y={Q_AT.y + 86} size={9} mono fill={K.shape}>
          D × D
        </Label>
        <path d={`M 158 ${Q_AT.y + 30} H 188 M 184 ${Q_AT.y + 27} L 188 ${Q_AT.y + 30} L 184 ${Q_AT.y + 33}`} stroke={K.faint} strokeWidth={1.25} fill="none" />
      </motion.g>
      <motion.g {...fade(step === 1, 0.3)}>
        <Label x={42} y={Q_AT.y - 22} size={10} fill={K.muted}>
          X is not split
        </Label>
      </motion.g>

      {/* Q: one block, then two heads */}
      <Block x={Q_AT.x} y={Q_AT.y} rows={5} cols={4} u={U} color={K.q} batch show={step === 0} />
      {[0, 1].map((h) => (
        <g key={h}>
          <Block
            {...headAt(h)}
            rows={5}
            cols={2}
            u={U}
            color={K.q}
            fill={K.head[h]}
            batch
            show={step >= 1}
          />
          <motion.g {...fade(split, 0.3)}>
            <Label x={Q_AT.x + U} y={ROW_Y[h] + 74} size={10} fill={K.muted}>
              {`head ${h + 1}`}
            </Label>
          </motion.g>

          <Block
            x={SCORE_X}
            y={ROW_Y[h]}
            rows={5}
            cols={5}
            u={U}
            fill="#e5e7eb"
            batch
            show={scored && !merged}
          />
          <Block
            {...outAt(h)}
            rows={5}
            cols={2}
            u={U}
            color={K.v}
            fill={K.head[h]}
            batch
            show={valued && !projected}
          />
        </g>
      ))}
      <motion.g {...fade(step <= 1)}>
        <Label x={Q_AT.x + 2 * U} y={Q_AT.y + 76} size={11} fill={K.q}>
          Q
        </Label>
      </motion.g>
      <motion.g {...fade(step === 1, 0.2)}>
        <path
          d={`M ${Q_AT.x} ${Q_AT.y - 14} v -4 h ${2 * U - 2} v 4 M ${Q_AT.x + 2 * U + 2} ${Q_AT.y - 14} v -4 h ${2 * U - 2} v 4`}
          stroke={K.muted}
          fill="none"
        />
        <Label x={Q_AT.x + U} y={Q_AT.y - 26} size={10} fill={K.muted}>
          1
        </Label>
        <Label x={Q_AT.x + 3 * U} y={Q_AT.y - 26} size={10} fill={K.muted}>
          2
        </Label>
        <Label x={Q_AT.x + 2 * U} y={Q_AT.y - 42} size={10} fill={K.muted}>
          heads
        </Label>
      </motion.g>

      <motion.g {...fade(scored && !merged, 0.3)}>
        {[0, 1].map((h) => (
          <Label key={h} x={SCORE_X + 30} y={ROW_Y[h] + 74} size={10} fill={K.muted}>
            weights
          </Label>
        ))}
      </motion.g>
      <motion.g {...fade(valued && !merged, 0.3)}>
        {[0, 1].map((h) => (
          <Label key={h} x={OUT_X + U} y={ROW_Y[h] + 74} size={10} fill={K.v}>
            heads
          </Label>
        ))}
      </motion.g>
      <motion.g {...fade(merged && !projected, 0.3)}>
        <Label x={MERGE.x + 2 * U} y={MERGE.y + 76} size={10} fill={K.v}>
          concat
        </Label>
      </motion.g>

      {/* the output projection mixes the heads */}
      <motion.g {...fade(projected)}>
        <Block x={MERGE.x} y={MERGE.y} rows={5} cols={4} u={U} color={K.v} batch fill="#fff" colFill={(j) => K.head[j < 2 ? 0 : 1]} />
        <path d={`M ${MERGE.x + 54} ${MERGE.y + 30} H ${FINAL_X - 8} M ${FINAL_X - 12} ${MERGE.y + 27} L ${FINAL_X - 8} ${MERGE.y + 30} L ${FINAL_X - 12} ${MERGE.y + 33}`} stroke={K.faint} strokeWidth={1.25} fill="none" />
        <Sym x={(MERGE.x + 54 + FINAL_X) / 2} y={MERGE.y + 18} size={12} sub="O" fill={K.muted}>
          W
        </Sym>
        <Block x={FINAL_X} y={MERGE.y} rows={5} cols={4} u={U} color={K.v} fill={K.vSoft} batch />
        <Label x={FINAL_X + 2 * U} y={MERGE.y + 76} size={10} fill={K.v}>
          output
        </Label>
      </motion.g>

      <Label x={230} y={276} size={12} mono fill={K.x}>
        {SHAPES[step]}
      </Label>
    </Figure>
  );
}
