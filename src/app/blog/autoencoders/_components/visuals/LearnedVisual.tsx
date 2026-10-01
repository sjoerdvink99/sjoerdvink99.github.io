"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import {
  DATA,
  INIT,
  TRAINED,
  decode,
  encode,
  fmt,
  fmtVec,
  snap,
} from "../model";
import {
  Axes,
  Figure,
  K,
  Label,
  Slider,
  Sym,
  fade,
  plane,
  useMotion,
} from "../svg";

const PL = plane({ x: [0.2, 3.8], y: [-0.1, 2.5] }, 40, 8, 100);
const AXIS = { y: 318, x0: PL.box.x, x1: PL.box.x + PL.box.w, dom: [0, 2.7] };
const zx = (z: number) =>
  AXIS.x0 +
  ((z - AXIS.dom[0]) / (AXIS.dom[1] - AXIS.dom[0])) * (AXIS.x1 - AXIS.x0);

const Z = DATA.map((x) => encode(TRAINED, x));
const XHAT = Z.map((z) => decode(TRAINED, z));
const line = (p: typeof INIT) => [decode(p, -3), decode(p, 5)].map(PL.p);
const TRAINED_LINE = line(TRAINED);
const INIT_LINE = line(INIT);

const nearest = (z: number) =>
  Z.reduce(
    (best, zi, i) => (Math.abs(zi - z) < Math.abs(Z[best] - z) ? i : best),
    0,
  );

export default function LearnedVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const [z, setZ] = useState(Z[0]);
  const inspecting = step >= 3;
  const sel = nearest(z);
  const at = (i: number): [number, number] =>
    step === 0
      ? PL.p(DATA[i])
      : step === 1
        ? [zx(Z[i]), AXIS.y]
        : PL.p(XHAT[i]);

  const x = PL.p(DATA[sel]);
  const h = PL.p(XHAT[sel]);
  const zs = zx(Z[sel]);
  const gap = snap(Math.hypot(x[0] - h[0], x[1] - h[1])) || 1;
  const away = [(x[0] - h[0]) / gap, (x[1] - h[1]) / gap];

  return (
    <Figure
      viewBox="0 0 420 346"
      label="One hundred points are encoded to a single number each and decoded back. The reconstructions lie on the line the autoencoder has learned, which follows the direction in which the data varies."
      controls={
        <Slider
          label={<span className="font-math italic">z</span>}
          value={z}
          min={AXIS.dom[0]}
          max={AXIS.dom[1]}
          step={0.01}
          onChange={setZ}
          display={fmt(z, 2)}
          hidden={!inspecting}
        />
      }
    >
      <defs>
        <clipPath id="learned-clip">
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

      <g clipPath="url(#learned-clip)">
        <motion.g {...fade(step >= 2)}>
          <line
            x1={INIT_LINE[0][0]}
            y1={INIT_LINE[0][1]}
            x2={INIT_LINE[1][0]}
            y2={INIT_LINE[1][1]}
            stroke={K.muted}
            strokeOpacity={0.4}
            strokeDasharray="4 5"
          />
          <line
            x1={TRAINED_LINE[0][0]}
            y1={TRAINED_LINE[0][1]}
            x2={TRAINED_LINE[1][0]}
            y2={TRAINED_LINE[1][1]}
            stroke={K.op}
            strokeWidth={1.5}
          />
        </motion.g>
      </g>
      <motion.g {...fade(step === 2)}>
        <Label
          x={PL.box.x + 36}
          y={PL.box.y + 16}
          size={11}
          fill={K.muted}
          anchor="start"
        >
          dashed line, before training
        </Label>
        <Label
          x={PL.box.x + 36}
          y={PL.box.y + 32}
          size={11}
          fill={K.opInk}
          anchor="start"
        >
          solid line, after training
        </Label>
      </motion.g>

      <motion.g {...fade(step >= 1)}>
        {DATA.map((d, i) => (
          <circle
            key={i}
            cx={PL.p(d)[0]}
            cy={PL.p(d)[1]}
            r={2.5}
            fill={K.x}
            opacity={inspecting ? 0.28 : 0.14}
          />
        ))}
      </motion.g>

      <line
        x1={AXIS.x0}
        x2={AXIS.x1}
        y1={AXIS.y}
        y2={AXIS.y}
        stroke="#c4c9d1"
      />
      {[0, 1, 2].map((v) => (
        <g key={v}>
          <line
            x1={zx(v)}
            x2={zx(v)}
            y1={AXIS.y - 3}
            y2={AXIS.y + 3}
            stroke="#c4c9d1"
          />
          <Label x={zx(v)} y={AXIS.y + 15} size={10} fill="#9ca3af">
            {v}
          </Label>
        </g>
      ))}
      <Sym x={AXIS.x1 + 14} y={AXIS.y} size={15} fill={K.z}>
        z
      </Sym>
      <motion.g {...fade(step >= 2)}>
        {Z.map((zi, i) => (
          <circle
            key={i}
            cx={zx(zi)}
            cy={AXIS.y}
            r={2.5}
            fill={K.z}
            opacity={0.3}
          />
        ))}
      </motion.g>

      {DATA.map((_, i) => (
        <motion.circle
          key={i}
          r={step === 1 ? 3 : 2.75}
          initial={false}
          animate={{
            cx: at(i)[0],
            cy: at(i)[1],
            fill: step === 1 ? K.z : step >= 2 ? "#ffffff" : K.x,
            stroke: step >= 2 ? K.x : "rgba(0,0,0,0)",
            opacity:
              step === 0 ? 0.55 : step === 1 ? 0.7 : inspecting ? 0.45 : 0.8,
          }}
          strokeWidth={1}
          transition={motionFor.spring((i % 20) * 0.012)}
        />
      ))}

      <motion.g {...fade(inspecting)} pointerEvents="none">
        <line
          x1={x[0]}
          y1={x[1]}
          x2={h[0]}
          y2={h[1]}
          stroke={K.grad}
          strokeWidth={1.5}
        />
        <line
          x1={zs}
          y1={AXIS.y}
          x2={h[0]}
          y2={h[1]}
          stroke={K.z}
          strokeOpacity={0.35}
          strokeDasharray="3 4"
        />
        <circle cx={x[0]} cy={x[1]} r={5} fill={K.x} />
        <circle
          cx={h[0]}
          cy={h[1]}
          r={5.5}
          fill="#fff"
          stroke={K.x}
          strokeWidth={1.75}
        />
        <circle cx={zs} cy={AXIS.y} r={5.5} fill={K.z} />
        <Sym x={x[0] + away[0] * 16} y={x[1] + away[1] * 16} size={15}>
          x
        </Sym>
        <Sym x={h[0] - away[0] * 16} y={h[1] - away[1] * 16} size={15} hat>
          x
        </Sym>
        <Label
          x={PL.box.x + 36}
          y={PL.box.y + 16}
          size={11}
          fill={K.x}
          anchor="start"
          mono
        >
          {`x     = ${fmtVec(DATA[sel], 2)}`}
        </Label>
        <Label
          x={PL.box.x + 36}
          y={PL.box.y + 32}
          size={11}
          fill={K.z}
          anchor="start"
          mono
        >
          {`z     = ${fmt(Z[sel], 2)}`}
        </Label>
        <Label
          x={PL.box.x + 36}
          y={PL.box.y + 48}
          size={11}
          fill={K.x}
          anchor="start"
          mono
        >
          {`x_hat = ${fmtVec(XHAT[sel], 2)}`}
        </Label>
      </motion.g>

      {inspecting && (
        <g>
          {DATA.map((d, i) => (
            <circle
              key={i}
              cx={PL.p(d)[0]}
              cy={PL.p(d)[1]}
              r={7}
              fill="transparent"
              className="cursor-pointer"
              onPointerEnter={() => setZ(Z[i])}
              onPointerDown={() => setZ(Z[i])}
            />
          ))}
        </g>
      )}
    </Figure>
  );
}
