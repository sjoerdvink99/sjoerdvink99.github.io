"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { INIT, X0, Z0, fmt } from "../model";
import { Figure, K, Label, Sym, fade, useMotion } from "../svg";

const CODE = "z = x @ W_encoder + b_encoder";

const FOCUS: Focus[][] = [
  [[0, "x"]],
  [[0, "W_encoder"]],
  [[0, "x @ W_encoder"]],
  [[0, "x @ W_encoder"]],
  [[0, "+ b_encoder"]],
  [0],
];

const W = 48;
const H = 38;
const TOP = 62;
const PAIR = [
  { stroke: K.op, fill: K.opSoft, ink: K.opInk },
  { stroke: "#64748b", fill: "#f1f5f9", ink: "#475569" },
];

const X_AT = [24, 76];
const W_AT = { x: 172, y: [TOP, TOP + H + 4] };
const B_AT = 260;
const Z_AT = 348;

const PRODUCT = X0.map((v, i) => v * INIT.wEnc[i]);

function Cell({
  x,
  y,
  value,
  color = K.x,
  fill = "#fff",
  show = true,
}: {
  x: number;
  y: number;
  value: number;
  color?: string;
  fill?: string;
  show?: boolean;
}) {
  return (
    <motion.g {...fade(show)}>
      <motion.rect
        x={x}
        y={y}
        width={W}
        height={H}
        rx={5}
        stroke={color}
        strokeOpacity={0.6}
        initial={false}
        animate={{ fill }}
        transition={{ duration: 0.5 }}
      />
      <Label x={x + W / 2} y={y + H / 2} size={14} fill={K.x}>
        {fmt(value)}
      </Label>
    </motion.g>
  );
}

export default function NeuronVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const showW = step >= 1;
  const paired = step >= 2;
  const multiplied = step >= 3;
  const summed = step >= 4;
  const collapsed = step >= 5;
  const tint = (i: number) => (paired && !collapsed ? PAIR[i].fill : "#fff");

  const rows = [
    {
      y: 218,
      lhs: `${fmt(X0[0])} × ${fmt(INIT.wEnc[0])}`,
      rhs: PRODUCT[0],
      ink: PAIR[0].ink,
      show: multiplied,
    },
    {
      y: 246,
      lhs: `${fmt(X0[1])} × (${fmt(INIT.wEnc[1])})`,
      rhs: PRODUCT[1],
      ink: PAIR[1].ink,
      show: multiplied,
    },
    { y: 274, lhs: "+ bias", rhs: INIT.bEnc, ink: K.muted, show: summed },
  ];
  const sumAt = collapsed
    ? { x: Z_AT + W / 2, y: TOP + H / 2 }
    : { x: 320, y: 306 };

  return (
    <Figure
      viewBox="0 0 420 324"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The matrix product x times W_encoder plus b_encoder, expanded into two products and a sum that equals 0.8."
    >
      {X_AT.map((x, i) => (
        <Cell key={i} x={x} y={TOP} value={X0[i]} fill={tint(i)} />
      ))}
      <Sym x={76} y={TOP + H + 22} size={18}>
        x
      </Sym>
      <Label x={76} y={TOP + H + 40} size={11} mono fill="#9ca3af">
        (2,)
      </Label>

      <motion.g {...fade(showW)}>
        <Label x={150} y={TOP + H / 2} size={16} fill={K.muted}>
          @
        </Label>
        {W_AT.y.map((y, i) => (
          <Cell
            key={i}
            x={W_AT.x}
            y={y}
            value={INIT.wEnc[i]}
            color={K.opInk}
            fill={tint(i)}
          />
        ))}
        <Sym
          x={W_AT.x + W / 2}
          y={TOP + 2 * H + 26}
          size={18}
          sub="enc"
          fill={K.opInk}
        >
          W
        </Sym>
        <Label
          x={W_AT.x + W / 2}
          y={TOP + 2 * H + 44}
          size={11}
          mono
          fill="#9ca3af"
        >
          (2, 1)
        </Label>
      </motion.g>

      <motion.g
        {...fade(paired && !collapsed)}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <motion.path
          d={`M ${X_AT[0] + W / 2} ${TOP - 3} C ${X_AT[0] + W / 2} ${TOP - 44}, ${W_AT.x + W / 2} ${TOP - 44}, ${W_AT.x + W / 2} ${TOP - 3}`}
          stroke={PAIR[0].stroke}
          initial={false}
          animate={{ pathLength: paired ? 1 : 0 }}
          transition={motionFor.draw()}
        />
        <motion.path
          d={`M ${X_AT[1] + W / 2} ${TOP + H + 3} C ${X_AT[1] + W / 2} ${TOP + H + 30}, ${W_AT.x - 30} ${W_AT.y[1] + H / 2}, ${W_AT.x - 3} ${W_AT.y[1] + H / 2}`}
          stroke={PAIR[1].stroke}
          initial={false}
          animate={{ pathLength: paired ? 1 : 0 }}
          transition={motionFor.draw(0.15)}
        />
      </motion.g>

      <motion.g {...fade(showW)}>
        <Label x={244} y={TOP + H / 2} size={16} fill={K.muted}>
          +
        </Label>
        <Cell
          x={B_AT}
          y={TOP}
          value={INIT.bEnc}
          color={K.opInk}
          fill={summed && !collapsed ? "#f3f4f6" : "#fff"}
        />
        <Sym
          x={B_AT + W / 2}
          y={TOP + H + 22}
          size={18}
          sub="enc"
          fill={K.opInk}
        >
          b
        </Sym>
        <Label x={B_AT + W / 2} y={TOP + H + 40} size={11} mono fill="#9ca3af">
          (1,)
        </Label>
      </motion.g>

      <motion.g {...fade(collapsed)}>
        <Label x={328} y={TOP + H / 2} size={16} fill={K.muted}>
          =
        </Label>
        <rect
          x={Z_AT}
          y={TOP}
          width={W}
          height={H}
          rx={5}
          fill={K.zSoft}
          stroke={K.z}
          strokeOpacity={0.6}
        />
        <Sym x={Z_AT + W / 2} y={TOP + H + 22} size={18} fill={K.z}>
          z
        </Sym>
        <Label x={Z_AT + W / 2} y={TOP + H + 40} size={11} mono fill="#9ca3af">
          (1,)
        </Label>
      </motion.g>

      {rows.map((r) => (
        <motion.g key={r.y} {...fade(r.show && !collapsed, 0.1)}>
          <Label x={236} y={r.y} size={14} fill={r.ink} anchor="end">
            {r.lhs}
          </Label>
          <Label x={262} y={r.y} size={13} fill="#9ca3af">
            →
          </Label>
          <Label x={330} y={r.y} size={14} fill={r.ink} anchor="end">
            {fmt(r.rhs)}
          </Label>
        </motion.g>
      ))}
      <motion.line
        x1={284}
        x2={336}
        y1={290}
        y2={290}
        stroke={K.muted}
        {...fade(summed && !collapsed)}
      />

      <motion.g
        initial={false}
        animate={{ x: sumAt.x, y: sumAt.y, opacity: summed ? 1 : 0 }}
        transition={collapsed ? motionFor.spring() : motionFor.ease()}
      >
        <Label x={0} y={0} size={14} fill={K.z} weight={500}>
          {fmt(Z0)}
        </Label>
      </motion.g>
    </Figure>
  );
}
