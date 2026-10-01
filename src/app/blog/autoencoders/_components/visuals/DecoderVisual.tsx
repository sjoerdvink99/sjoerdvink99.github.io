"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import {
  INIT,
  SAMPLE,
  X0,
  XHAT0,
  Z0,
  decode,
  encode,
  fmt,
  fmtVec,
  mul,
} from "../model";
import { Axes, Dot, Figure, K, Label, Slider, Sym, Vector, fade } from "../svg";
import { INPUT_PLANE as PL, LATENT_AXIS, LatentAxis, zx } from "../frames";

const CODE = "x_hat = z @ W_decoder + b_decoder";
const FOCUS: Focus[][] = [
  [[0, "z"]],
  [[0, "z @ W_decoder"]],
  [[0, "+ b_decoder"]],
  [0],
  [[0, "x_hat"]],
];

const LINE = [decode(INIT, -3), decode(INIT, 4)].map(PL.p);

export default function DecoderVisual() {
  const { step } = useStage();
  const [picked, setPicked] = useState(Z0);
  const z = step === 3 ? picked : Z0;
  const scaled = mul(INIT.wDec, z);
  const xhat = decode(INIT, z);
  const origin = PL.p([0, 0]);

  return (
    <Figure
      viewBox="0 0 420 392"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The decoder maps the latent value z back to a point in the plane. Every value of z lands on one line, so the reconstruction x-hat can only lie on that line."
      controls={
        <Slider
          label={<span className="font-math italic">z</span>}
          value={picked}
          min={-1.5}
          max={2.5}
          step={0.05}
          onChange={setPicked}
          display={fmt(picked, 2)}
          hidden={step !== 3}
        />
      }
    >
      <defs>
        <clipPath id="dec-clip">
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
      <LatentAxis />

      <motion.g {...fade(step >= 3)} clipPath="url(#dec-clip)">
        <line
          x1={LINE[0][0]}
          y1={LINE[0][1]}
          x2={LINE[1][0]}
          y2={LINE[1][1]}
          stroke={K.op}
          strokeOpacity={0.55}
        />
      </motion.g>
      <motion.g {...fade(step === 3)}>
        <Label
          x={PL.box.x + PL.box.w - 8}
          y={PL.box.y + 14}
          size={12}
          fill={K.opInk}
          anchor="end"
        >
          every z decodes to a point on this line
        </Label>
      </motion.g>

      {SAMPLE.slice(1).map((x, i) => {
        const zi = encode(INIT, x);
        const r = PL.p(decode(INIT, zi));
        const o = PL.p(x);
        return (
          <g key={i}>
            <motion.g {...fade(step >= 4)}>
              <line
                x1={o[0]}
                y1={o[1]}
                x2={r[0]}
                y2={r[1]}
                stroke={K.grad}
                strokeOpacity={0.5}
              />
              <circle cx={o[0]} cy={o[1]} r={3.5} fill={K.x} opacity={0.45} />
            </motion.g>
            <motion.g {...fade(step >= 3)}>
              <circle
                cx={r[0]}
                cy={r[1]}
                r={3.5}
                fill="#fff"
                stroke={K.x}
                strokeOpacity={0.5}
                strokeWidth={1.25}
              />
            </motion.g>
            <circle
              cx={zx(zi)}
              cy={LATENT_AXIS.y}
              r={3.5}
              fill={K.z}
              opacity={0.35}
            />
          </g>
        );
      })}

      <motion.g {...fade(step >= 1 && step <= 3)}>
        <Vector from={origin} to={PL.p(scaled)} color={K.op} />
      </motion.g>
      <motion.g {...fade(step === 1)}>
        <Label
          x={PL.box.x + PL.box.w - 8}
          y={PL.box.y + 14}
          size={11}
          fill={K.opInk}
          anchor="end"
          mono
        >
          {`z @ W_decoder = ${fmtVec(scaled, 2)}`}
        </Label>
      </motion.g>
      <motion.g {...fade(step >= 2 && step <= 3)}>
        <Vector
          from={PL.p(scaled)}
          to={PL.p(xhat)}
          color={K.op}
          width={1.5}
          head={5}
        />
      </motion.g>
      <motion.g {...fade(step === 2)}>
        <Label
          x={PL.box.x + PL.box.w - 8}
          y={PL.box.y + 14}
          size={11}
          fill={K.opInk}
          anchor="end"
          mono
        >
          {`+ b_decoder = ${fmtVec(INIT.bDec)}`}
        </Label>
      </motion.g>

      <motion.g {...fade(step >= 4)}>
        <line
          x1={PL.p(X0)[0]}
          y1={PL.p(X0)[1]}
          x2={PL.p(XHAT0)[0]}
          y2={PL.p(XHAT0)[1]}
          stroke={K.grad}
          strokeWidth={1.5}
        />
        <Dot at={PL.p(X0)} r={5.5}>
          <Sym x={14} y={-10} size={16}>
            x
          </Sym>
        </Dot>
      </motion.g>
      <Dot
        at={step >= 2 ? PL.p(xhat) : PL.p(scaled)}
        kind="xhat"
        r={5.5}
        opacity={step >= 2 ? 1 : 0}
      >
        <Sym x={-14} y={-12} size={16} hat>
          x
        </Sym>
      </Dot>
      <Dot at={[zx(z), LATENT_AXIS.y]} kind="z" r={5.5}>
        <Label x={0} y={-15} size={12} fill={K.z}>
          {fmt(z, step === 3 ? 2 : 1)}
        </Label>
      </Dot>

      <motion.g {...fade(step >= 4)}>
        <Sym
          x={PL.box.x + 14}
          y={PL.box.y + PL.box.h - 40}
          size={15}
          anchor="start"
        >
          x
        </Sym>
        <Label
          x={PL.box.x + 32}
          y={PL.box.y + PL.box.h - 40}
          size={12}
          fill={K.x}
          anchor="start"
        >
          {`= ${fmtVec(X0)}`}
        </Label>
        <Sym
          x={PL.box.x + 14}
          y={PL.box.y + PL.box.h - 18}
          size={15}
          anchor="start"
          hat
        >
          x
        </Sym>
        <Label
          x={PL.box.x + 32}
          y={PL.box.y + PL.box.h - 18}
          size={12}
          fill={K.x}
          anchor="start"
        >
          {`= ${fmtVec(XHAT0)}`}
        </Label>
      </motion.g>
    </Figure>
  );
}
