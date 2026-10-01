"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import {
  LOGVAR,
  MU,
  SIGMA,
  VAR,
  decodeShape,
  fmt,
  normal,
  type Vec2,
} from "../model";
import {
  Axes,
  Figure,
  Glyph,
  K,
  Label,
  MathText,
  Sym,
  fade,
  plane,
  useMotion,
} from "../svg";

const CODE = `h = encoder(x)
mu = mu_head(h)
logvar = logvar_head(h)`;

const FOCUS: Focus[][] = [[], [], [1, 2], [1, 2], [2]];

const PL = plane({ x: [-2.8, 2.8], y: [-2.8, 2.8] }, 150, 146, 48);

const INPUTS: { mu: Vec2; sigma: Vec2 }[] = [
  { mu: MU, sigma: SIGMA },
  { mu: [-1.6, 1.5], sigma: [0.45, 0.6] },
  { mu: [-0.7, -1.7], sigma: [0.6, 0.4] },
];
const GLYPH_Y = [200, 280, 360];
const SAMPLES = Array.from({ length: 24 }, (_, i) => normal(i + 40));

const CELL = { w: 40, h: 26 };

function Column({
  x,
  y,
  values,
  color,
  fill,
  show,
}: {
  x: number;
  y: number;
  values: number[];
  color: string;
  fill: string;
  show: boolean;
}) {
  return (
    <motion.g {...fade(show)}>
      {values.map((v, i) => (
        <g key={i}>
          <rect
            x={x}
            y={y + i * (CELL.h + 4)}
            width={CELL.w}
            height={CELL.h}
            rx={5}
            fill={fill}
            stroke={color}
            strokeOpacity={0.6}
          />
          <Label
            x={x + CELL.w / 2}
            y={y + i * (CELL.h + 4) + CELL.h / 2}
            size={12}
            fill={color}
          >
            {fmt(v, 2)}
          </Label>
        </g>
      ))}
    </motion.g>
  );
}

export default function VaeEncoderVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const regions = step >= 1;
  const heads = step >= 2;
  const focus = step >= 3;
  const logs = step >= 4;

  return (
    <Figure
      viewBox="0 0 440 424"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The encoder of a variational autoencoder outputs a mean and a log variance for each latent dimension. Together they describe an ellipse-shaped Gaussian region in the two-dimensional latent space."
    >
      <Glyph shape={decodeShape(MU)} x={30} y={62} r={16} />
      <Sym x={30} y={98} size={15}>
        x
      </Sym>
      <path d="M 54 62 H 70" stroke={K.muted} strokeWidth={1.25} />
      <path
        d="M 74 22 L 124 44 L 124 80 L 74 102 Z"
        fill={K.opSoft}
        stroke={K.op}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <Label x={99} y={118} size={11} fill={K.opInk}>
        encoder
      </Label>

      <motion.g {...fade(!heads)}>
        <path d="M 128 62 H 150" stroke={K.muted} strokeWidth={1.25} />
        <Column
          x={156}
          y={34}
          values={MU}
          color={K.z}
          fill={K.zSoft}
          show={!heads}
        />
        <Sym x={176} y={104} size={15} fill={K.z}>
          z
        </Sym>
      </motion.g>
      <motion.g {...fade(heads)}>
        <path
          d="M 128 52 C 140 52, 140 38, 152 38 M 128 72 C 140 72, 140 86, 152 86"
          stroke={K.muted}
          strokeWidth={1.25}
          fill="none"
        />
        <Column
          x={156}
          y={8}
          values={MU}
          color={K.z}
          fill={K.zSoft}
          show={heads}
        />
        <Column
          x={156}
          y={70}
          values={LOGVAR}
          color={K.opInk}
          fill="#fff"
          show={heads}
        />
        <Sym x={212} y={28} size={15} fill={K.z} anchor="start">
          μ
        </Sym>
        <MathText x={212} y={98} size={14} fill={K.opInk}>
          log σ²
        </MathText>
      </motion.g>

      <motion.g {...fade(logs)}>
        <MathText x={290} y={20} size={13} fill={K.muted}>
          log σ²
        </MathText>
        <MathText x={290} y={52} size={13} fill={K.muted}>
          σ² = exp(log σ²)
        </MathText>
        <MathText x={290} y={84} size={13} fill={K.muted}>
          σ = exp(½ log σ²)
        </MathText>
        {[LOGVAR, VAR, SIGMA].map((v, i) => (
          <Label
            key={i}
            x={434}
            y={34 + i * 32}
            size={11}
            fill={K.x}
            anchor="end"
            mono
          >
            {`[${fmt(v[0], 2)}, ${fmt(v[1], 2)}]`}
          </Label>
        ))}
      </motion.g>

      <Axes pl={PL} names={["z", "z"]} ticks={false} />

      {INPUTS.map((e, i) => {
        const shown = !focus || i === 0;
        const [cx, cy] = PL.p(e.mu);
        return (
          <motion.g
            key={i}
            initial={false}
            animate={{ opacity: shown ? 1 : 0.15 }}
            transition={{ duration: 0.5 }}
          >
            <Glyph shape={decodeShape(e.mu)} x={40} y={GLYPH_Y[i]} r={13} />
            <Sym x={68} y={GLYPH_Y[i] + 2} size={13} sup={`(${i + 1})`}>
              x
            </Sym>
            <line
              x1={84}
              y1={GLYPH_Y[i]}
              x2={cx}
              y2={cy}
              stroke={K.faint}
              strokeDasharray="3 4"
            />
            <motion.ellipse
              cx={cx}
              cy={cy}
              initial={false}
              animate={{
                rx: regions ? e.sigma[0] * PL.k : 4.5,
                ry: regions ? e.sigma[1] * PL.k : 4.5,
              }}
              transition={motionFor.spring()}
              fill={K.z}
              fillOpacity={regions ? 0.12 : 1}
              stroke={K.z}
              strokeWidth={1.25}
            />
            {!regions && (
              <Sym
                x={cx + 9}
                y={cy - 12}
                size={13}
                sup={`(${i + 1})`}
                fill={K.z}
                anchor="start"
              >
                z
              </Sym>
            )}
          </motion.g>
        );
      })}

      <motion.g {...fade(focus)}>
        <ellipse
          cx={PL.px(MU[0])}
          cy={PL.py(MU[1])}
          rx={2 * SIGMA[0] * PL.k}
          ry={2 * SIGMA[1] * PL.k}
          fill="none"
          stroke={K.z}
          strokeOpacity={0.4}
          strokeDasharray="3 4"
        />
        {SAMPLES.map(([a, b], i) => (
          <circle
            key={i}
            cx={PL.px(MU[0] + SIGMA[0] * a)}
            cy={PL.py(MU[1] + SIGMA[1] * b)}
            r={1.8}
            fill={K.z}
            opacity={0.5}
          />
        ))}
        <circle cx={PL.px(MU[0])} cy={PL.py(MU[1])} r={3} fill={K.z} />
        <Sym x={PL.px(MU[0]) - 12} y={PL.py(MU[1]) - 9} size={14} fill={K.z}>
          μ
        </Sym>
        <line
          x1={PL.px(MU[0])}
          y1={PL.py(MU[1])}
          x2={PL.px(MU[0] + SIGMA[0])}
          y2={PL.py(MU[1])}
          stroke={K.opInk}
          strokeWidth={1.5}
        />
        <line
          x1={PL.px(MU[0])}
          y1={PL.py(MU[1])}
          x2={PL.px(MU[0])}
          y2={PL.py(MU[1] - SIGMA[1])}
          stroke={K.opInk}
          strokeWidth={1.5}
        />
        <Sym
          x={PL.px(MU[0] + SIGMA[0] / 2)}
          y={PL.py(MU[1]) - 10}
          size={13}
          sub="1"
          fill={K.opInk}
        >
          σ
        </Sym>
        <Sym
          x={PL.px(MU[0]) - 13}
          y={PL.py(MU[1] - SIGMA[1] / 2)}
          size={13}
          sub="2"
          fill={K.opInk}
        >
          σ
        </Sym>
        <Label
          x={PL.box.x + PL.box.w - 8}
          y={PL.box.y + PL.box.h - 12}
          size={11}
          fill={K.muted}
          anchor="end"
        >
          z is still two numbers
        </Label>
      </motion.g>
    </Figure>
  );
}
