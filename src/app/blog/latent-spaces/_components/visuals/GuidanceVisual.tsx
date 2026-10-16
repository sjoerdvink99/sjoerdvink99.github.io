"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label } from "@/components/blog/svg";
import { GUIDANCE_STEPS, MIXTURE, decode, fmt, sample, summarize, type Vec } from "../model";
import { Clip, Face, Grid, K, Num, Slider, plane, useTween } from "../svg";

const CODE = `eps_uncond = model(x_t, t, prompt=None)
eps_cond = model(x_t, t, prompt="a smiling face")
eps = eps_uncond + w * (eps_cond - eps_uncond)`;

const FOCUS: Focus[][] = [[0], [1], [2], [2]];

const P = plane({ x: [-3.2, 3.2], y: [-3.2, 3.2], unit: 36, left: 6, top: 8 });
const BLOBS = [
  { color: K.slate, soft: K.slateSoft, name: "frowning" },
  { color: K.blue, soft: K.blueSoft, name: "smiling" },
];
const GALLERY = { x: 272, y: 34, gap: 34, cols: 6 };

const pathOf = (points: Vec[]) =>
  points.map((z, i) => `${i ? "L" : "M"} ${P.px(z[0]).toFixed(1)} ${P.py(z[1]).toFixed(1)}`).join(" ");

export default function GuidanceVisual() {
  const { step } = useStage();
  const [free, setFree] = useState(2);
  const sliding = step === 3;
  const w = sliding ? free : GUIDANCE_STEPS[step];
  const paths = useMemo(() => sample(w), [w]);
  const { ends, smiling, average, spread } = summarize(paths);
  const transition = useTween(sliding ? 0.35 : undefined);
  const duration = sliding ? 0.35 : undefined;

  return (
    <Figure
      viewBox="0 0 460 246"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      interactive={sliding}
      label="A diffusion model turns noise into samples by following its score. Without guidance the samples land in both the frowning and the smiling cluster. With guidance weight one they all land in the smiling cluster. Larger weights push them past its centre and squeeze them together, so every face becomes the same broad grin."
      controls={
        <Slider
          label={<span className="font-math italic">w</span>}
          value={free}
          min={0}
          max={8}
          step={0.5}
          onChange={setFree}
          display={fmt(free, 1)}
          hidden={!sliding}
        />
      }
    >
      <Grid plane={P} axes={false} />
      <Clip plane={P}>
        {MIXTURE.means.map((m, k) => (
          <g key={k}>
            {[2, 1].map((s) => (
              <circle
                key={s}
                cx={P.px(m[0])}
                cy={P.py(m[1])}
                r={s * MIXTURE.sd * P.unit}
                fill={BLOBS[k].soft}
                fillOpacity={s === 2 ? 0.6 : 1}
              />
            ))}
          </g>
        ))}
        {paths.map((path, i) => (
          <motion.path
            key={i}
            fill="none"
            stroke={K.ink}
            strokeOpacity={0.28}
            strokeWidth={1}
            initial={false}
            animate={{ d: pathOf(path) }}
            transition={transition}
          />
        ))}
        {paths.map((path, i) => (
          <circle key={i} cx={P.px(path[0][0])} cy={P.py(path[0][1])} r={2} fill={K.muted} />
        ))}
        {ends.map((z, i) => (
          <motion.circle
            key={i}
            r={3.5}
            fill={K.green}
            stroke="#fff"
            initial={false}
            animate={{ cx: P.px(z[0]), cy: P.py(z[1]) }}
            transition={transition}
          />
        ))}
      </Clip>
      {MIXTURE.means.map((m, k) => (
        <Label key={k} x={P.px(m[0])} y={P.py(m[1]) + 2.4 * MIXTURE.sd * P.unit} size={10} fill={BLOBS[k].color}>
          {BLOBS[k].name}
        </Label>
      ))}

      <Label x={GALLERY.x - 10} y={GALLERY.y - 22} size={11} anchor="start" fill={K.ink}>
        samples
      </Label>
      {ends.map((z, i) => (
        <Face
          key={i}
          look={decode(z)}
          x={GALLERY.x + (i % GALLERY.cols) * GALLERY.gap}
          y={GALLERY.y + Math.floor(i / GALLERY.cols) * GALLERY.gap}
          r={13}
          duration={duration}
        />
      ))}

      {[
        { name: "smiling", value: smiling * 100, digits: 0, suffix: "%" },
        { name: "mean smile", value: average, digits: 2, suffix: "" },
        { name: "spread", value: spread, digits: 2, suffix: "" },
      ].map((row, k) => (
        <g key={row.name}>
          <Label x={GALLERY.x - 10} y={150 + k * 20} size={11} anchor="start">
            {row.name}
          </Label>
          <Num
            x={444}
            y={150 + k * 20}
            value={row.value}
            digits={row.digits}
            suffix={row.suffix}
            size={12}
            anchor="end"
            duration={duration}
          />
        </g>
      ))}
      <Num x={GALLERY.x - 10} y={222} value={w} digits={1} prefix="w = " size={13} anchor="start" fill={K.green} duration={duration} />
    </Figure>
  );
}
