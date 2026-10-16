"use client";

import { motion, useTransform } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText, fade } from "@/components/blog/svg";
import { FOLD, lerp, range, type Vec } from "../model";
import { Clip, Grid, K, plane, useTween, useTweened } from "../svg";

const CODE = `mlp = nn.Sequential(
    nn.Linear(2, 2),
    nn.ReLU(),
    nn.Linear(2, 2),
)`;

const FOCUS: Focus[][] = [[], [1], [1, 3], [1, 2], [1, 2, 3]];

const P = plane({ x: [-3, 3], y: [-3, 3], unit: 32, left: 8, top: 8 });
const SPAN = 6;
const SAMPLES = 48;

const sample = (f: (t: number) => Vec) =>
  range(0, SAMPLES).map((i) => f(-SPAN + (2 * SPAN * i) / SAMPLES));
const pair = (k: number) => [sample((t) => [k, t]), sample((t) => [t, k])];

const SHAPES = {
  grid: range(-SPAN, SPAN)
    .filter((k) => k !== 0)
    .flatMap(pair),
  axes: pair(0),
  circle: [range(0, 96).map((i) => [2 * Math.cos((i * Math.PI) / 48), 2 * Math.sin((i * Math.PI) / 48)])],
};

type Shape = keyof typeof SHAPES;

const IMAGES = FOLD.maps.map((map) => ({
  grid: SHAPES.grid.map((line) => line.map(map)),
  axes: SHAPES.axes.map((line) => line.map(map)),
  circle: SHAPES.circle.map((line) => line.map(map)),
}));

function trace(s: number, shape: Shape) {
  const k = Math.min(Math.floor(s), IMAGES.length - 2);
  const t = s - k;
  const to = IMAGES[k + 1][shape];
  return IMAGES[k][shape]
    .map((line, l) =>
      line
        .map((p, i) => {
          const q = to[l][i];
          const [x, y] = P.at([lerp(p[0], q[0], t), lerp(p[1], q[1], t)]);
          return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" "),
    )
    .join(" ");
}

const BOXES = [
  { text: "W₁x + b₁", x: 248 },
  { text: "ReLU", x: 318 },
  { text: "W₂h + b₂", x: 388 },
];
const BOX = { y: 26, w: 62, h: 28 };
const ACTIVE = [[], [0], [0, 2], [0, 1], [0, 1, 2]];
const INSET = { x: 350, y: 168, u: 26 };

export default function FoldVisual() {
  const { step } = useStage();
  const transition = useTween();
  const stage = useTweened([step]);
  const grid = useTransform(stage, ([s]) => trace(s, "grid"));
  const axes = useTransform(stage, ([s]) => trace(s, "axes"));
  const circle = useTransform(stage, ([s]) => trace(s, "circle"));
  const relu = `M ${INSET.x - 2.2 * INSET.u} ${INSET.y} H ${INSET.x} L ${INSET.x + 2.2 * INSET.u} ${INSET.y - 2.2 * INSET.u}`;

  return (
    <Figure
      viewBox="0 0 460 208"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A grid and a circle pushed through a small network. Two linear layers keep the grid straight. A ReLU between them folds the plane along the axes, and the second layer leaves a creased grid."
    >
      <Grid plane={P} />
      <Clip plane={P}>
        <motion.path d={grid} stroke={K.warp} strokeWidth={1} fill="none" />
        <motion.path d={axes} stroke={K.muted} strokeWidth={1.25} fill="none" />
        <motion.path d={circle} stroke={K.a} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      </Clip>

      {BOXES.map((box, i) => {
        const on = ACTIVE[step].includes(i);
        return (
          <g key={box.text}>
            <motion.rect
              x={box.x}
              y={BOX.y}
              width={BOX.w}
              height={BOX.h}
              rx={6}
              initial={false}
              animate={{ fill: on ? K.outSoft : "#fff", stroke: on ? K.out : K.faint }}
              transition={transition}
            />
            <MathText x={box.x + BOX.w / 2} y={BOX.y + BOX.h / 2} size={12} anchor="middle" fill={on ? K.ink : K.muted}>
              {box.text}
            </MathText>
            {i > 0 && (
              <path
                d={`M ${box.x - 7} ${BOX.y + BOX.h / 2} h 5 m -3 -3 l 3 3 l -3 3`}
                fill="none"
                stroke={K.axis}
              />
            )}
          </g>
        );
      })}

      <motion.g {...fade(step >= 3)}>
        <line x1={INSET.x - 2.4 * INSET.u} x2={INSET.x + 2.4 * INSET.u} y1={INSET.y} y2={INSET.y} stroke={K.axis} />
        <line x1={INSET.x} x2={INSET.x} y1={INSET.y + 0.6 * INSET.u} y2={INSET.y - 2.6 * INSET.u} stroke={K.axis} />
        <path d={relu} stroke={K.out} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        <Label x={INSET.x - 1.4 * INSET.u} y={INSET.y - 1.6 * INSET.u} size={11} fill={K.ink} mono>
          max(0, z)
        </Label>
      </motion.g>
      <motion.g {...fade(step === 2)}>
        <MathText x={349} y={120} size={13} anchor="middle" fill={K.muted}>
          W₂(W₁x + b₁) + b₂
        </MathText>
        <Label x={349} y={142} size={11}>
          is still one linear layer
        </Label>
      </motion.g>
    </Figure>
  );
}
