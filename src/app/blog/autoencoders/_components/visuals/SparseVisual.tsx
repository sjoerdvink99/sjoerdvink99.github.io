"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import {
  DENSE_Z,
  DICT,
  N_FEATURES,
  SPARSE_X,
  Z0,
  add,
  fmt,
  fmtVec,
  mul,
  sparseCode,
  type Vec2,
} from "../model";
import {
  Axes,
  Dot,
  DragRing,
  Figure,
  K,
  Label,
  Sym,
  fade,
  plane,
  useDragPoint,
  useMotion,
} from "../svg";

const CODE = `h = x @ W_encoder + b_encoder
z = torch.relu(h)
x_hat = z @ W_decoder + b_decoder
recon = ((x_hat - x) ** 2).mean()
sparsity = z.abs().sum()
loss = recon + lam * sparsity`;

const FOCUS: Focus[][] = [
  [],
  [0, 1],
  [[2, "z @ W_decoder"]],
  [[2, "z @ W_decoder"]],
  [3, 4, 5],
  [0, 1, 2],
];

const PL = plane({ x: [-2.4, 2.4], y: [-1.4, 2.4] }, 76, 100, 60);
const CELL = { w: 42, h: 32, gap: 6, y: 14 };
const cellX = (j: number) => 31 + j * (CELL.w + CELL.gap);

function chain(z: number[]) {
  let at: Vec2 = [0, 0];
  return z.map((v, j) => {
    const from = at;
    at = add(at, mul(DICT[j], v));
    return { from, to: at, on: v > 1e-6 };
  });
}

export default function SparseVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const [picked, setPicked] = useState<Vec2>(SPARSE_X);
  const wide = step >= 1;
  const dictionary = step >= 2;
  const coded = step >= 3;
  const live = step >= 5;
  const x = live ? picked : SPARSE_X;
  const z = step === 3 ? DENSE_Z : sparseCode(x);
  const active = z.filter((v) => v > 1e-6).length;
  const l1 = z.reduce((s, v) => s + v, 0);
  const links = chain(z);
  const drag = useDragPoint({
    pl: PL,
    enabled: live,
    value: picked,
    onChange: setPicked,
    label: `Input at ${fmtVec(x, 2)}. Use the arrow keys to move it.`,
  });

  return (
    <Figure
      interactive
      viewBox="0 0 440 380"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A sparse autoencoder with eight latent units for a two-dimensional input. Each unit is a direction. A dense code uses all eight directions, a sparse code only two, and both reconstruct the same point."
    >
      <defs>
        <marker
          id="sae-head"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 1 L 9 5 L 0 9"
            fill="none"
            stroke={K.z}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      <motion.g {...fade(!wide)}>
        <rect
          x={199}
          y={CELL.y}
          width={CELL.w}
          height={CELL.h}
          rx={5}
          fill={K.zSoft}
          stroke={K.z}
          strokeOpacity={0.6}
        />
        <Label x={220} y={CELL.y + CELL.h / 2} size={13} fill={K.z}>
          {fmt(Z0)}
        </Label>
        <Label x={220} y={CELL.y + CELL.h + 18} size={11} fill={K.muted}>
          the autoencoder&apos;s latent, shape (1,)
        </Label>
      </motion.g>
      {z.map((v, j) => {
        const on = v > 1e-6;
        return (
          <motion.g
            key={j}
            initial={false}
            animate={{ x: wide ? cellX(j) : 199, opacity: wide ? 1 : 0 }}
            transition={motionFor.spring(wide ? j * 0.03 : 0)}
          >
            <motion.rect
              y={CELL.y}
              width={CELL.w}
              height={CELL.h}
              rx={5}
              initial={false}
              animate={{
                fill: on ? K.zSoft : "#fff",
                stroke: on ? K.z : "#d1d5db",
              }}
              transition={{ duration: 0.5 }}
            />
            <Label
              x={CELL.w / 2}
              y={CELL.y + CELL.h / 2}
              size={12}
              fill={on ? K.z : "#9ca3af"}
            >
              {on ? fmt(v) : "0"}
            </Label>
            <Sym
              x={CELL.w / 2}
              y={CELL.y + CELL.h + 14}
              size={12}
              sub={String(j + 1)}
              fill={K.muted}
            >
              z
            </Sym>
          </motion.g>
        );
      })}
      <motion.g {...fade(wide)}>
        <Label
          x={cellX(N_FEATURES - 1) + CELL.w}
          y={CELL.y + CELL.h + 30}
          size={10}
          fill="#9ca3af"
          anchor="end"
          mono
        >
          (8,)
        </Label>
      </motion.g>

      <Axes pl={PL} ticks={false} />

      <motion.g {...fade(dictionary)}>
        {DICT.map((d, j) => {
          const tip = PL.p(d);
          const lab = PL.p(mul(d, 1.22));
          return (
            <g key={j}>
              <line
                x1={PL.px(0)}
                y1={PL.py(0)}
                x2={tip[0]}
                y2={tip[1]}
                stroke={K.op}
                strokeOpacity={coded ? 0.35 : 0.9}
                strokeWidth={1.5}
              />
              <circle
                cx={tip[0]}
                cy={tip[1]}
                r={2}
                fill={K.op}
                opacity={coded ? 0.35 : 0.9}
              />
              <Label x={lab[0]} y={lab[1]} size={11} fill={K.opInk}>
                {j + 1}
              </Label>
            </g>
          );
        })}
      </motion.g>

      <motion.g {...fade(coded)}>
        {links.map((l, j) => {
          const a = PL.p(l.from);
          const b = PL.p(l.to);
          return (
            <motion.line
              key={j}
              initial={false}
              animate={{
                x1: a[0],
                y1: a[1],
                x2: b[0],
                y2: b[1],
                opacity: l.on ? 1 : 0,
              }}
              transition={motionFor.spring()}
              stroke={K.z}
              strokeWidth={2}
              strokeLinecap="round"
              markerEnd="url(#sae-head)"
            />
          );
        })}
      </motion.g>

      <g {...drag}>
        <DragRing at={PL.p(x)} show={live} />
        <Dot at={PL.p(x)} r={5.5}>
          <Sym x={14} y={-12} size={16}>
            x
          </Sym>
        </Dot>
      </g>

      <motion.g {...fade(coded)}>
        <Label
          x={PL.box.x + PL.box.w - 10}
          y={PL.box.y + 16}
          size={11}
          fill={K.z}
          anchor="end"
        >
          {`${active} of ${N_FEATURES} active`}
        </Label>
        <Label
          x={PL.box.x + PL.box.w - 10}
          y={PL.box.y + 32}
          size={11}
          fill={K.grad}
          anchor="end"
        >
          {`L1 norm ${fmt(l1, 2)}`}
        </Label>
      </motion.g>
    </Figure>
  );
}
