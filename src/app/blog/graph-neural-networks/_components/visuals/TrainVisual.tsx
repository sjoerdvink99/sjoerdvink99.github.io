"use client";

import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Morph } from "@/components/blog/Morph";
import { Figure, Label } from "@/components/blog/svg";
import { CORA } from "../model";
import { K, Tensor } from "../svg";

const MODEL = `data = Planetoid(root="data", name="Cora")[0]

class GCN(torch.nn.Module):
    def __init__(self, d_in, d_hidden, n_classes):
        super().__init__()
        self.conv1 = GCNConv(d_in, d_hidden)
        self.conv2 = GCNConv(d_hidden, n_classes)

    def forward(self, x, edge_index):
        h = F.relu(self.conv1(x, edge_index))
        return self.conv2(h, edge_index)`;

const LOOP = `model = GCN(data.num_features, ${CORA.hidden}, ${CORA.classes})
optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

for epoch in range(200):
    optimizer.zero_grad()
    out = model(data.x, data.edge_index)
    loss = F.cross_entropy(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()`;

const EVAL = `model.eval()
pred = model(data.x, data.edge_index).argmax(dim=1)
correct = pred[data.test_mask] == data.y[data.test_mask]
accuracy = correct.float().mean()`;

const CODE = [MODEL, MODEL, LOOP, EVAL];
const FOCUS: Focus[][] = [[0], [5, 6, 9, 10], [5, 6], [1, 2]];

const U = 7;
const Y = 14;
const ON = [
  ["x", "edges"],
  ["x", "h", "out", "edges"],
  ["out"],
  ["out"],
];

function Pass({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <path
        d={`M ${x} ${Y + 28} H ${x + 40} M ${x + 36} ${Y + 25} L ${x + 40} ${Y + 28} L ${x + 36} ${Y + 31}`}
        stroke={K.faint}
        strokeWidth={1.25}
        fill="none"
      />
      <Label x={x + 20} y={Y + 18} size={10} mono>
        {label}
      </Label>
    </g>
  );
}

export default function TrainVisual() {
  const { step } = useStage();
  const on = (k: string) => ON[step].includes(k);
  const id = CODE[step] === MODEL ? "model" : CODE[step] === LOOP ? "loop" : "eval";

  return (
    <Figure
      viewBox="0 0 460 112"
      top={
        <Morph id={id}>
          <Code code={CODE[step]} focus={FOCUS[step]} />
        </Morph>
      }
      label={`The tensors in a two-layer GCN on Cora: ${CORA.nodes} nodes with ${CORA.features} features become ${CORA.hidden} hidden features and then ${CORA.classes} class scores, using an edge list of ${CORA.edges} directed edges.`}
    >
      <Tensor x={16} y={Y} rows={8} cols={12} u={U} name="x" shape={`(${CORA.nodes}, ${CORA.features})`} on={on("x")} />
      <Pass x={108} label="conv1" />
      <Tensor x={158} y={Y} rows={8} cols={4} u={U} color={K.c0} name="h" shape={`(${CORA.nodes}, ${CORA.hidden})`} on={on("h")} />
      <Pass x={196} label="conv2" />
      <Tensor
        x={246}
        y={Y}
        rows={8}
        cols={2}
        u={U}
        color={K.outInk}
        fill={K.outSoft}
        name="out"
        shape={`(${CORA.nodes}, ${CORA.classes})`}
        on={on("out")}
      />
      <Tensor
        x={330}
        y={Y + 21}
        rows={2}
        cols={16}
        u={U}
        color={K.slate}
        name="edge_index"
        shape={`(2, ${CORA.edges})`}
        on={on("edges")}
      />
    </Figure>
  );
}
