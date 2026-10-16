"use client";

import { motion, useTransform } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText } from "@/components/blog/svg";
import { LAYER, NODES, lerp, list, range, relu, type Vec } from "../model";
import { Arrow, Calc, Clip, Dot, Grid, K, classOf, plane, useTween, useTweened, type Line } from "../svg";

const CODE = `H = X
H = A_norm @ H
H = H @ W
H = np.maximum(H, 0)`;

const FOCUS: Focus[][] = [[0], [1], [2], [3], [1, 2, 3]];

const P = plane({ x: [-2, 2], y: [-2, 2], unit: 54, left: 8, top: 8 });
const O = P.at([0, 0]);
const SPAN = 5;
const SAMPLES = 40;

const sample = (f: (t: number) => Vec) =>
  range(0, SAMPLES).map((i) => f(-SPAN + (2 * SPAN * i) / SAMPLES));
const GRID = range(-SPAN, SPAN).flatMap((k) => [sample((t) => [k, t]), sample((t) => [t, k])]);

const MAPS: ((p: Vec) => Vec)[] = [
  (p) => p,
  (p) => p,
  LAYER.map,
  (p) => relu(LAYER.map(p)),
];
const IMAGES = MAPS.map((map) => GRID.map((line) => line.map(map)));

function trace(s: number) {
  const k = Math.min(Math.floor(s), IMAGES.length - 2);
  const t = s - k;
  return IMAGES[k]
    .map((line, l) =>
      line
        .map((p, i) => {
          const q = IMAGES[k + 1][l][i];
          const [x, y] = P.at([lerp(p[0], q[0], t), lerp(p[1], q[1], t)]);
          return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" "),
    )
    .join(" ");
}

const BASIS = [
  [1, 0],
  [0, 1],
];

const PIPE = [
  { sym: "X", text: "features" },
  { sym: "Â H", text: "aggregate: mix rows" },
  { sym: "H W", text: "transform: move space" },
  { sym: "σ(H)", text: "ReLU: fold" },
];
const PIPE_X = 258;
const PIPE_Y = 30;
const PIPE_GAP = 34;

const NODE = 6;
const TRACE: Line[] = [
  `x₆      = ${list(LAYER.stages[0][NODE])}`,
  `(ÂX)₆   = ${list(LAYER.stages[1][NODE])}`,
  `· W     = ${list(LAYER.stages[2][NODE])}`,
  { text: `ReLU    = ${list(LAYER.stages[3][NODE])}`, color: K.outInk },
];
const LINES: Line[][] = range(0, 4).map((s) => TRACE.slice(0, Math.min(s, 3) + 1));

export default function LayerVisual() {
  const { step } = useStage();
  const stage = Math.min(step, 3);
  const transition = useTween();
  const tweened = useTweened([stage]);
  const grid = useTransform(tweened, ([s]) => trace(s));
  const points = LAYER.stages[stage];
  const basis = BASIS.map(MAPS[stage]);

  return (
    <Figure
      viewBox="0 0 460 232"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="One GCN layer drawn in the feature plane. Aggregation moves the points but leaves the grid alone. Multiplying by W moves the whole plane linearly. ReLU folds it onto the positive axes, leaving the blue nodes on one axis and the rose nodes on the other."
    >
      <Grid plane={P} lines={false} />
      <Clip plane={P}>
        <motion.path d={grid} fill="none" stroke={K.warp} strokeWidth={1} />
        {NODES.map((i) => (
          <motion.line
            key={i}
            x1={P.at(LAYER.stages[0][i])[0]}
            y1={P.at(LAYER.stages[0][i])[1]}
            x2={P.at(LAYER.stages[1][i])[0]}
            y2={P.at(LAYER.stages[1][i])[1]}
            stroke={classOf(i)}
            strokeOpacity={0.35}
            initial={false}
            animate={{ opacity: step === 1 ? 1 : 0 }}
            transition={transition}
          />
        ))}
      </Clip>
      {basis.map((b, k) => (
        <Arrow key={k} from={O} to={P.at(b)} color={K.slate} width={2} opacity={0.8} />
      ))}
      {NODES.map((i) => (
        <Dot
          key={i}
          at={P.at(points[i])}
          color={classOf(i)}
          label={String(i)}
          labelOpacity={stage < 3 || i === NODE ? 1 : 0}
          r={i === NODE ? 6 : 5}
        />
      ))}

      {PIPE.map((p, k) => {
        const on = step === 4 ? k > 0 : k === stage;
        return (
          <motion.g
            key={p.sym}
            initial={false}
            animate={{ opacity: on ? 1 : 0.35 }}
            transition={transition}
          >
            <rect
              x={PIPE_X}
              y={PIPE_Y + k * PIPE_GAP - 12}
              width={4}
              height={24}
              rx={2}
              fill={on ? K.out : K.faint}
            />
            <MathText x={PIPE_X + 14} y={PIPE_Y + k * PIPE_GAP} size={14}>
              {p.sym}
            </MathText>
            <Label x={PIPE_X + 62} y={PIPE_Y + k * PIPE_GAP} size={11} anchor="start" fill={K.ink}>
              {p.text}
            </Label>
          </motion.g>
        );
      })}

      <Calc x={PIPE_X} y={PIPE_Y + 4 * PIPE_GAP + 2} steps={LINES} step={step} size={10.5} gap={17} />
    </Figure>
  );
}
