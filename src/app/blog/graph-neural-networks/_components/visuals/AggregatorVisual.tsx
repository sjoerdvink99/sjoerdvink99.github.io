"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Morph } from "@/components/blog/Morph";
import { Figure, Label, MathText } from "@/components/blog/svg";
import { AGGREGATORS, MULTISETS, type Aggregator, type Vec } from "../model";
import { Arrow, At, Grid, K, plane, useTween, type Plane } from "../svg";

const { u, w, c, sets } = MULTISETS;

const COMPARE = `N1 = np.array([u, w])
N2 = np.array([u, u, w, w])
N3 = np.array([u, w, c])
N1.sum(0), N1.mean(0), N1.max(0)`;

const GIN = `class GINLayer(nn.Module):
    def __init__(self, d, eps=0.0):
        super().__init__()
        self.eps = eps
        self.mlp = nn.Sequential(nn.Linear(d, d), nn.ReLU(), nn.Linear(d, d))

    def forward(self, H, A):
        return self.mlp((1 + self.eps) * H + A @ H)`;

const FOCUS: Focus[][] = [[0, 1, 3], [0, 2, 3], [[7, "(1 + self.eps) * H + A @ H"]]];

const UNIT = 44;
const PLANES = [20, 250].map((left) => plane({ x: [-0.3, 3.9], y: [-0.3, 3.9], unit: UNIT, left, top: 26 }));
const PAIRS = [
  [0, 1],
  [0, 2],
  [0, 1],
];
const STYLE: Record<Aggregator, string> = { sum: K.out, mean: K.slate, max: K.green };
const NAMES: [Vec, string][] = [
  [u, "u"],
  [w, "w"],
  [c, "c"],
];

const same = (a: Vec, b: Vec) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

function Marker({ kind, at }: { kind: Aggregator; at: [number, number] }) {
  const color = STYLE[kind];
  return (
    <At x={at[0]} y={at[1]}>
      {kind === "mean" ? (
        <circle r={5.5} fill={color} />
      ) : kind === "max" ? (
        <rect x={-5.5} y={-5.5} width={11} height={11} fill="#fff" stroke={color} strokeWidth={2} />
      ) : (
        <circle r={3.5} fill={color} />
      )}
    </At>
  );
}

function Multiset({ P, index }: { P: Plane; index: number }) {
  const transition = useTween();
  const set = sets[index];
  const O = P.at([0, 0]);
  const count = (p: Vec) => set.items.filter((q) => q === p).length;
  return (
    <g>
      <Grid plane={P} />
      {NAMES.map(([p, name]) => {
        const n = count(p);
        const [x, y] = P.at(p);
        return (
          <motion.g key={name} initial={false} animate={{ opacity: n ? 1 : 0 }} transition={transition}>
            <circle cx={x} cy={y} r={4} fill={K.ink} />
            <MathText x={x + 8} y={y - 8} size={14}>
              {name}
            </MathText>
            <motion.text
              x={x + 8}
              y={y + 9}
              fontSize={10}
              dominantBaseline="central"
              fill={K.muted}
              initial={false}
              animate={{ opacity: n > 1 ? 1 : 0 }}
              transition={transition}
            >
              ×{n}
            </motion.text>
          </motion.g>
        );
      })}
      <Arrow from={O} to={P.at(set.sum)} color={STYLE.sum} width={2.25} />
      <Marker kind="mean" at={P.at(set.mean)} />
      <Marker kind="max" at={P.at(set.max)} />
      <Label x={P.left + P.width / 2} y={P.top - 14} size={12} fill={K.ink} mono>
        {set.name}
      </Label>
    </g>
  );
}

export default function AggregatorVisual() {
  const { step } = useStage();
  const [left, right] = PAIRS[step];
  const gin = step === 2;

  return (
    <Figure
      viewBox="0 0 460 262"
      top={
        <Morph id={gin ? "gin" : "compare"}>
          <Code code={gin ? GIN : COMPARE} focus={FOCUS[step]} />
        </Morph>
      }
      label="Two neighbourhoods side by side with their sum, mean and element-wise maximum. Duplicating every neighbour leaves the mean and maximum unchanged but doubles the sum. Adding a small vector changes the mean but not the maximum."
    >
      <Multiset P={PLANES[0]} index={left} />
      <Multiset P={PLANES[1]} index={right} />
      {AGGREGATORS.map((kind, k) => {
        const differs = !same(sets[left][kind], sets[right][kind]);
        const x = 34 + k * 150;
        return (
          <motion.g
            key={kind}
            initial={false}
            animate={{ opacity: gin && kind !== "sum" ? 0.3 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <Marker kind={kind} at={[x, 240]} />
            <Label x={x + 12} y={240} size={12} anchor="start" fill={K.ink} weight={500}>
              {kind}
            </Label>
            <Label x={x + 56} y={240} size={11} anchor="start" fill={differs ? K.outInk : K.muted}>
              {differs ? "tells apart" : "same"}
            </Label>
          </motion.g>
        );
      })}
    </Figure>
  );
}
