"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Morph } from "@/components/blog/Morph";
import { Figure, Label, fade } from "@/components/blog/svg";
import { ATT } from "../model";
import { Block, K } from "../svg";

const NUMPY = `Q = X @ W_Q
K = X @ W_K
V = X @ W_V
scores = Q @ K.T / np.sqrt(d_k)
weights = softmax(scores, axis=-1)
output = weights @ V`;

const TORCH = `Q = X @ W_Q
K = X @ W_K
V = X @ W_V
scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)
weights = torch.softmax(scores, dim=-1)
output = weights @ V`;

const MODULE = `class SelfAttention(nn.Module):
    def __init__(self, D):
        super().__init__()
        self.W_Q = nn.Linear(D, D, bias=False)
        self.W_K = nn.Linear(D, D, bias=False)
        self.W_V = nn.Linear(D, D, bias=False)

    def forward(self, X):
        Q, K, V = self.W_Q(X), self.W_K(X), self.W_V(X)
        d_k = Q.size(-1)
        scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)
        weights = torch.softmax(scores, dim=-1)
        return weights @ V`;

const CODE = [NUMPY, TORCH, TORCH, MODULE];
const FOCUS: Focus[][] = [
  [],
  [
    [3, "K.transpose(-2, -1)"],
    [3, "math.sqrt"],
    [4, "torch.softmax"],
    [4, "dim=-1"],
  ],
  [
    [3, "transpose(-2, -1)"],
    [4, "dim=-1"],
  ],
  [3, 4, 5, 8],
];

const U = 8;
const Y = 34;
const PARTS = [
  { name: "X", x: 18, rows: 5, cols: 4, color: K.x, shape: "T, D" },
  { name: "Q", x: 92, rows: 5, cols: 4, color: K.q, shape: "" },
  { name: "K", x: 136, rows: 5, cols: 4, color: K.kInk, shape: "T, D" },
  { name: "V", x: 180, rows: 5, cols: 4, color: K.v, shape: "" },
  { name: "scores", x: 254, rows: 5, cols: 5, color: K.x, shape: "T, T" },
  { name: "weights", x: 326, rows: 5, cols: 5, color: K.x, shape: "T, T" },
  { name: "output", x: 400, rows: 5, cols: 4, color: K.v, shape: "T, D" },
];

const ARROWS = [
  [56, 84],
  [220, 246],
  [300, 318],
  [372, 392],
];

export default function TorchVisual() {
  const { step } = useStage();
  const batch = step >= 2;

  return (
    <Figure
      viewBox="0 0 460 112"
      top={
        <Morph id={CODE[step] === TORCH ? "torch" : CODE[step]}>
          <Code code={CODE[step]} focus={FOCUS[step]} />
        </Morph>
      }
      label="The tensors in self-attention and their shapes. With a batch dimension in front, every shape gains a leading B and the operations are unchanged."
    >
      {ARROWS.map(([a, b]) => (
        <path
          key={a}
          d={`M ${a} ${Y + 20} H ${b} M ${b - 4} ${Y + 17} L ${b} ${Y + 20} L ${b - 4} ${Y + 23}`}
          stroke={K.faint}
          strokeWidth={1.25}
          fill="none"
        />
      ))}
      {PARTS.map((p) => (
        <g key={p.name}>
          <Block
            x={p.x}
            y={Y}
            rows={p.rows}
            cols={p.cols}
            u={U}
            color={p.color}
            batch={batch}
            fill={p.name === "weights" ? "#e5e7eb" : "#fff"}
          />
          <Label x={p.x + (p.cols * U) / 2} y={Y + 5 * U + 16} size={11} fill={p.color}>
            {p.name}
          </Label>
          {p.shape && (
            <Label x={p.x + (p.cols * U) / 2} y={Y + 5 * U + 31} size={9} mono fill={K.shape}>
              {`(${batch ? "B, " : ""}${p.shape})`}
            </Label>
          )}
        </g>
      ))}
      <motion.g {...fade(batch, 0.3)}>
        <Label x={18} y={12} size={10} anchor="start" fill={K.muted}>
          {`B sentences at once, each with its own ${ATT.weights.length} × ${ATT.weights.length} weights`}
        </Label>
      </motion.g>
    </Figure>
  );
}
