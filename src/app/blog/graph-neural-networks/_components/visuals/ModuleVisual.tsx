"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Morph } from "@/components/blog/Morph";
import { Figure, Label, fade } from "@/components/blog/svg";
import { K, Tensor } from "../svg";

const LAYER = `class GCNLayer(nn.Module):
    def __init__(self, d_in, d_out):
        super().__init__()
        self.W = nn.Linear(d_in, d_out, bias=False)

    def forward(self, H, A):
        A_hat = A + torch.eye(A.size(0))
        d = A_hat.sum(dim=1)
        A_norm = A_hat / torch.sqrt(d[:, None] * d[None, :])
        return A_norm @ self.W(H)`;

const MODEL = `layer1 = GCNLayer(d, 16)
layer2 = GCNLayer(16, c)

H = torch.relu(layer1(X, A))
logits = layer2(H, A)`;

const CODE = [LAYER, LAYER, LAYER, MODEL];
const FOCUS: Focus[][] = [[6, 7, 8], [3, [9, "self.W(H)"]], [[9, "A_norm @"]], [3, 4]];

const U = 9;
const Y = 18;
const ON = [["A"], ["H", "W"], ["A", "out"], []];

const STACK = [
  { x: 20, cols: 6, name: "X", shape: "(n, d)", color: K.ink },
  { x: 154, cols: 4, name: "H", shape: "(n, 16)", color: K.c0 },
  { x: 272, cols: 2, name: "logits", shape: "(n, c)", color: K.outInk },
];
const ARROWS = [
  { x: 80, label: "layer1, ReLU" },
  { x: 198, label: "layer2" },
];

const LEGEND = [
  ["n", "nodes"],
  ["d", "features in"],
  ["d′", "features out"],
  ["c", "classes"],
];

export default function ModuleVisual() {
  const { step } = useStage();
  const on = (k: string) => ON[step].includes(k);
  const stacked = step === 3;

  return (
    <Figure
      viewBox="0 0 460 140"
      top={
        <Morph id={CODE[step] === LAYER ? "layer" : "model"}>
          <Code code={CODE[step]} focus={FOCUS[step]} />
        </Morph>
      }
      label="The shapes in one GCN layer: the normalized adjacency matrix of shape n by n, times the node features of shape n by d, times the weights of shape d by d prime, gives new features of shape n by d prime. Two stacked layers turn the features into one score per class for every node."
    >
      <motion.g {...fade(!stacked, 0.35)}>
        <Tensor x={20} y={Y} rows={8} cols={8} u={U} color={K.out} name="A_norm" shape="(n, n)" on={on("A")} />
        <Label x={106} y={Y + 4 * U} size={15}>
          @
        </Label>
        <Tensor x={120} y={Y} rows={8} cols={4} u={U} name="H" shape="(n, d)" on={on("H")} />
        <Label x={170} y={Y + 4 * U} size={15}>
          @
        </Label>
        <Tensor x={184} y={Y} rows={4} cols={2} u={U} color={K.c0} name="W" shape="(d, d′)" on={on("W")} />
        <Label x={218} y={Y + 4 * U} size={15}>
          =
        </Label>
        <Tensor
          x={234}
          y={Y}
          rows={8}
          cols={2}
          u={U}
          color={K.outInk}
          fill={K.outSoft}
          name="H′"
          shape="(n, d′)"
          on={on("out")}
        />
      </motion.g>
      <motion.g {...fade(stacked, 0.35)}>
        {STACK.map((t) => (
          <Tensor
            key={t.name}
            x={t.x}
            y={Y}
            rows={8}
            cols={t.cols}
            u={U}
            color={t.color}
            fill={t.name === "logits" ? K.outSoft : "#fff"}
            name={t.name}
            shape={t.shape}
          />
        ))}
        {ARROWS.map((a) => (
          <g key={a.label}>
            <path
              d={`M ${a.x} ${Y + 36} H ${a.x + 66} M ${a.x + 62} ${Y + 33} L ${a.x + 66} ${Y + 36} L ${a.x + 62} ${Y + 39}`}
              stroke={K.faint}
              strokeWidth={1.25}
              fill="none"
            />
            <Label x={a.x + 33} y={Y + 24} size={9.5} mono>
              {a.label}
            </Label>
          </g>
        ))}
      </motion.g>

      {LEGEND.map(([sym, text], k) => (
        <g key={sym}>
          <Label x={318} y={Y + 10 + k * 22} size={12} anchor="start" mono fill={K.ink}>
            {sym}
          </Label>
          <Label x={344} y={Y + 10 + k * 22} size={11} anchor="start">
            {text}
          </Label>
        </g>
      ))}
    </Figure>
  );
}
