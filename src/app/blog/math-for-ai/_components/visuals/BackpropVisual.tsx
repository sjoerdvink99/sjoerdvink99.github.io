"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText, fade } from "@/components/blog/svg";
import { GRAPH, fmt, type Point } from "../model";
import { Calc, K, useTween, type Line } from "../svg";

const CODE = `p = w * x
z = p + b
a = torch.sigmoid(z)
loss = (a - y) ** 2
loss.backward()
w.grad, b.grad`;

const FOCUS: Focus[][] = [[0, 1, 2, 3], [3], [2], [1], [0], [4, 5]];

const NODES = [
  { op: "×", at: [100, 83] },
  { op: "+", at: [190, 128] },
  { op: "σ", at: [270, 128] },
];
const LOSS = { x: 330, y: 114, w: 60, h: 28 };

const INPUTS = [
  { name: "x", at: [20, 44] },
  { name: "w", at: [20, 122] },
  { name: "b", at: [100, 174] },
  { name: "y", at: [360, 48] },
  { name: "L", at: [446, 128] },
];

interface Edge {
  from: Point;
  to: Point;
  value: string;
  grad?: { value: number; step: number };
}

const EDGES: Edge[] = [
  { from: [30, 48], to: [87, 76], value: fmt(GRAPH.x, 1), grad: { value: GRAPH.dX, step: 4 } },
  { from: [30, 118], to: [87, 90], value: fmt(GRAPH.w, 1), grad: { value: GRAPH.dW, step: 4 } },
  { from: [113, 90], to: [177, 121], value: fmt(GRAPH.p, 1), grad: { value: GRAPH.dZ, step: 3 } },
  { from: [108, 162], to: [177, 135], value: fmt(GRAPH.b, 1), grad: { value: GRAPH.dZ, step: 3 } },
  { from: [206, 128], to: [254, 128], value: fmt(GRAPH.z, 1), grad: { value: GRAPH.dZ, step: 2 } },
  { from: [286, 128], to: [330, 128], value: fmt(GRAPH.a), grad: { value: GRAPH.dA, step: 1 } },
  { from: [360, 60], to: [360, 114], value: fmt(GRAPH.y, 0) },
  { from: [390, 128], to: [434, 128], value: fmt(GRAPH.loss), grad: { value: 1, step: 1 } },
];

function offset(e: Edge, d: number): Point {
  const [dx, dy] = [e.to[0] - e.from[0], e.to[1] - e.from[1]];
  const len = Math.hypot(dx, dy);
  return [(e.from[0] + e.to[0]) / 2 + (dy / len) * d, (e.from[1] + e.to[1]) / 2 - (dx / len) * d];
}

const LINES: Line[][] = [
  ["p = w·x    z = p + b    a = σ(z)    L = (a − y)²"],
  [`∂L/∂a = 2(a − y) = ${fmt(GRAPH.dA)}`],
  [`∂L/∂z = ∂L/∂a · σ′(z) = ${fmt(GRAPH.dA)} × ${fmt(GRAPH.local)} = ${fmt(GRAPH.dZ)}`],
  [`∂L/∂b = ∂L/∂p = ∂L/∂z = ${fmt(GRAPH.dZ)}`],
  [`∂L/∂w = ∂L/∂p · x = ${fmt(GRAPH.dW)}    ∂L/∂x = ∂L/∂p · w = ${fmt(GRAPH.dX)}`],
  [`w.grad = ${fmt(GRAPH.dW)}    b.grad = ${fmt(GRAPH.dZ)}`],
];

export default function BackpropVisual() {
  const { step } = useStage();
  const transition = useTween();

  return (
    <Figure
      viewBox="0 0 460 218"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A computation graph for one neuron with a sigmoid and a squared error. Forward values flow left to right above the edges, and gradients flow right to left below them, one node at a time."
    >
      {EDGES.map((e, i) => {
        const current = e.grad?.step === step;
        const reached = e.grad !== undefined && step >= e.grad.step;
        const [vx, vy] = offset(e, 10);
        const [gx, gy] = offset(e, -12);
        return (
          <g key={i}>
            <motion.path
              d={`M ${e.from[0]} ${e.from[1]} L ${e.to[0]} ${e.to[1]}`}
              initial={false}
              animate={{
                stroke: current ? K.b : K.axis,
                strokeWidth: current ? 2.5 : 1.5,
              }}
              transition={transition}
            />
            <Label x={vx} y={vy} size={11} fill={K.a}>
              {e.value}
            </Label>
            {e.grad && (
              <motion.g {...fade(reached, 0.15)}>
                <Label x={gx} y={gy} size={11} fill={K.b} weight={current ? 600 : undefined}>
                  {fmt(e.grad.value, e.grad.value === 1 ? 0 : 2)}
                </Label>
              </motion.g>
            )}
          </g>
        );
      })}

      {NODES.map((n) => (
        <g key={n.op}>
          <circle cx={n.at[0]} cy={n.at[1]} r={15} fill="#fff" stroke={K.ink} strokeWidth={1.25} />
          <MathText x={n.at[0]} y={n.at[1]} size={15} anchor="middle">
            {n.op}
          </MathText>
        </g>
      ))}
      <rect x={LOSS.x} y={LOSS.y} width={LOSS.w} height={LOSS.h} rx={14} fill="#fff" stroke={K.ink} strokeWidth={1.25} />
      <MathText x={LOSS.x + LOSS.w / 2} y={LOSS.y + LOSS.h / 2} size={12} anchor="middle">
        (a − y)²
      </MathText>
      {INPUTS.map((n) => (
        <MathText key={n.name} x={n.at[0]} y={n.at[1]} size={16} anchor="middle">
          {n.name}
        </MathText>
      ))}

      <Calc x={230} y={204} steps={LINES} step={step} size={11} anchor="middle" />
    </Figure>
  );
}
