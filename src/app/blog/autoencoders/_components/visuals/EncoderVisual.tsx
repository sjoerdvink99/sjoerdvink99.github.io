"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { INIT, SAMPLE, dot, fmt, mul, snap, type Vec2 } from "../model";
import {
  Axes,
  Dot,
  Figure,
  K,
  Label,
  SPRING,
  Slider,
  Sym,
  Vector,
  fade,
} from "../svg";
import { INPUT_PLANE, LATENT_AXIS, LatentAxis, zx } from "../frames";

const CODE = "z = x @ W_encoder + b_encoder";
const FOCUS: Focus[][] = [
  [[0, "x"]],
  [[0, "W_encoder"]],
  [[0, "x @ W_encoder"]],
  [0],
  [[0, "W_encoder"]],
];

const PL = INPUT_PLANE;
const AXIS = LATENT_AXIS;

const NORM = snap(Math.hypot(...INIT.wEnc));
const BASE_ANGLE = Math.round(
  (Math.atan2(INIT.wEnc[1], INIT.wEnc[0]) * 180) / Math.PI,
);
const LEVELS = Array.from({ length: 13 }, (_, i) => -2.4 + i * 0.4);

function directionAt(deg: number): Vec2 {
  const a = (deg * Math.PI) / 180;
  return deg === BASE_ANGLE
    ? INIT.wEnc
    : [snap(NORM * Math.cos(a)), snap(NORM * Math.sin(a))];
}

export default function EncoderVisual() {
  const { step } = useStage();
  const [angle, setAngle] = useState(BASE_ANGLE);
  const free = step >= 4;
  const w = directionAt(free ? angle : BASE_ANGLE);
  const b = INIT.bEnc;
  const encodeWith = (x: Vec2) => dot(x, w) + b;
  const n2 = dot(w, w);
  const across: Vec2 = [-w[1] / Math.sqrt(n2), w[0] / Math.sqrt(n2)];

  const levelLine = (c: number) => {
    const base = mul(w, (c - b) / n2);
    return {
      a: PL.p([base[0] - across[0] * 8, base[1] - across[1] * 8]),
      b: PL.p([base[0] + across[0] * 8, base[1] + across[1] * 8]),
    };
  };

  const position = (x: Vec2): Vec2 => {
    if (step <= 1) return PL.p(x);
    if (step === 2) return PL.p(mul(w, dot(x, w) / n2));
    return [zx(encodeWith(x)), AXIS.y];
  };

  const z0 = encodeWith(SAMPLE[0]);
  const l0 = levelLine(z0);
  const wEnd = PL.p(mul(w, 1.6 / Math.sqrt(n2)));

  return (
    <Figure
      viewBox="0 0 420 392"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Seven two-dimensional points are mapped onto a one-dimensional latent axis. Points on the same line perpendicular to the encoder weights receive the same value of z."
      controls={
        <Slider
          label="direction"
          value={angle}
          min={-180}
          max={180}
          step={1}
          onChange={setAngle}
          display={`${angle}°`}
          hidden={!free}
        />
      }
    >
      <defs>
        <clipPath id="enc-clip">
          <rect
            x={PL.box.x}
            y={PL.box.y}
            width={PL.box.w}
            height={PL.box.h}
            rx={6}
          />
        </clipPath>
      </defs>
      <Axes pl={PL} />

      <motion.g {...fade(step >= 1)} clipPath="url(#enc-clip)">
        {LEVELS.map((c) => {
          const l = levelLine(c);
          return (
            <line
              key={c}
              x1={l.a[0]}
              y1={l.a[1]}
              x2={l.b[0]}
              y2={l.b[1]}
              stroke={K.z}
              strokeOpacity={0.14}
            />
          );
        })}
        <line
          x1={l0.a[0]}
          y1={l0.a[1]}
          x2={l0.b[0]}
          y2={l0.b[1]}
          stroke={K.z}
          strokeOpacity={0.55}
          strokeDasharray="4 4"
        />
        <line
          x1={PL.p(mul(w, -8 / Math.sqrt(n2)))[0]}
          y1={PL.p(mul(w, -8 / Math.sqrt(n2)))[1]}
          x2={PL.p(mul(w, 8 / Math.sqrt(n2)))[0]}
          y2={PL.p(mul(w, 8 / Math.sqrt(n2)))[1]}
          stroke={K.op}
          strokeOpacity={0.35}
        />
      </motion.g>
      <motion.g {...fade(step >= 1)}>
        <Vector from={PL.p([0, 0])} to={wEnd} color={K.op} />
        <Sym
          x={wEnd[0] + 14}
          y={wEnd[1] + 12}
          size={15}
          sub="enc"
          fill={K.opInk}
          anchor="start"
        >
          W
        </Sym>
      </motion.g>
      <motion.g {...fade(step === 1 || step === 2)}>
        <Label
          x={PL.box.x + PL.box.w - 8}
          y={PL.box.y + 14}
          size={12}
          fill={K.z}
          anchor="end"
        >
          {`every point on the dashed line has z = ${fmt(z0)}`}
        </Label>
      </motion.g>

      <motion.g {...fade(step >= 2)}>
        {SAMPLE.map((x, i) => {
          const [gx, gy] = PL.p(x);
          const [tx, ty] = PL.p(mul(w, dot(x, w) / n2));
          return (
            <g key={i}>
              <motion.line
                x1={gx}
                y1={gy}
                x2={tx}
                y2={ty}
                stroke={K.muted}
                strokeOpacity={step === 2 ? 0.45 : 0}
                strokeDasharray="2 3"
              />
              <circle
                cx={gx}
                cy={gy}
                r={i === 0 ? 5 : 4}
                fill="none"
                stroke={K.faint}
              />
            </g>
          );
        })}
      </motion.g>

      <LatentAxis />

      {SAMPLE.map((x, i) => (
        <Dot
          key={i}
          at={position(x)}
          r={i === 0 ? 5.5 : 4}
          color={step >= 3 ? K.z : K.x}
          opacity={i === 0 ? 1 : 0.55}
        />
      ))}
      <motion.g
        initial={false}
        animate={{ x: position(SAMPLE[0])[0], y: position(SAMPLE[0])[1] }}
        transition={SPRING}
      >
        <Sym
          x={step >= 3 ? 0 : step === 2 ? -14 : 13}
          y={step >= 3 ? -17 : step === 2 ? -12 : 12}
          size={15}
          fill={step >= 3 ? K.z : K.x}
        >
          {step >= 3 ? "z" : "x"}
        </Sym>
      </motion.g>
      <motion.g {...fade(step === 3)}>
        <Label x={zx(z0)} y={AXIS.y + 30} size={12} fill={K.z}>
          {fmt(z0)}
        </Label>
      </motion.g>
    </Figure>
  );
}
