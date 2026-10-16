"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label } from "@/components/blog/svg";
import { CLASS_GAP, CLASS_MEANS, CLASS_SPREAD, NODES, SMOOTH, SMOOTH_MAX, range } from "../model";
import { At, CLASS_COLOR, Clip, Dot, Grid, K, Num, Slider, classOf, plane, useTween } from "../svg";

const CODE = `H = X
for _ in range(k):
    H = A_hat @ H / deg`;

const FOCUS: Focus[][] = [[1, 2], [1, 2], [1, 2], [0, 1, 2]];
const LAYERS = [1, 4, SMOOTH_MAX];

const P = plane({ x: [-2, 2.2], y: [-2, 2], unit: 50, left: 8, top: 8 });
const CHART = { x: 264, y: 26, w: 180, h: 110 };
const TOP = Math.max(...CLASS_GAP, ...CLASS_SPREAD);
const cx = (k: number) => CHART.x + Math.sqrt(k / SMOOTH_MAX) * CHART.w;
const cy = (v: number) => CHART.y + CHART.h - (v / TOP) * CHART.h;
const curve = (values: readonly number[]) =>
  values.map((v, k) => `${k ? "L" : "M"} ${cx(k).toFixed(1)} ${cy(v).toFixed(1)}`).join(" ");

const SERIES = [
  { name: "between classes", values: CLASS_GAP, color: K.out, ink: K.outInk },
  { name: "within a class", values: CLASS_SPREAD, color: K.slate, ink: K.slate },
];

const TRAILS = NODES.map((i) =>
  range(0, SMOOTH_MAX)
    .map((s) => P.at(SMOOTH[s][i]))
    .map(([x, y], s) => `${s ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" "),
);

export default function SmoothingVisual() {
  const { step } = useStage();
  const [free, setFree] = useState(2);
  const k = step === 3 ? free : LAYERS[step];
  const transition = useTween();

  return (
    <Figure
      viewBox="0 0 460 228"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      interactive={step === 3}
      label="Repeated averaging first pulls each class together, then pulls everything together. After many rounds every node has nearly the same vector, and the gap between the classes is gone."
      controls={
        <Slider
          label="rounds"
          value={free}
          min={0}
          max={SMOOTH_MAX}
          step={1}
          onChange={setFree}
          display={String(free)}
          hidden={step !== 3}
        />
      }
    >
      <Grid plane={P} />
      <Clip plane={P}>
        {NODES.map((i) => (
          <path key={i} d={TRAILS[i]} fill="none" stroke={classOf(i)} strokeOpacity={0.25} />
        ))}
      </Clip>
      {CLASS_MEANS[k].map((m, c) => (
        <At key={c} x={P.at(m)[0]} y={P.at(m)[1]}>
          <path d="M -6 -6 L 6 6 M -6 6 L 6 -6" stroke={CLASS_COLOR[c]} strokeWidth={2} strokeLinecap="round" />
        </At>
      ))}
      {NODES.map((i) => (
        <Dot
          key={i}
          at={P.at(SMOOTH[k][i])}
          color={classOf(i)}
          label={String(i)}
          labelOpacity={k < 8 ? 1 : 0}
        />
      ))}

      <line x1={CHART.x} x2={CHART.x + CHART.w} y1={CHART.y + CHART.h} y2={CHART.y + CHART.h} stroke={K.axis} />
      <line x1={CHART.x} x2={CHART.x} y1={CHART.y} y2={CHART.y + CHART.h} stroke={K.axis} />
      {[0, 1, 4, 8, 16, 32].map((t) => (
        <Label key={t} x={cx(t)} y={CHART.y + CHART.h + 12} size={9}>
          {t}
        </Label>
      ))}
      <Label x={CHART.x + CHART.w / 2} y={CHART.y + CHART.h + 27} size={10}>
        rounds of averaging
      </Label>
      {SERIES.map((s) => (
        <path key={s.name} d={curve(s.values)} fill="none" stroke={s.color} strokeWidth={2} />
      ))}
      <At x={cx(k)} y={0}>
        <line y1={CHART.y} y2={CHART.y + CHART.h} stroke={K.ink} strokeOpacity={0.25} />
        {SERIES.map((s) => (
          <motion.circle
            key={s.name}
            r={3.5}
            fill={s.color}
            initial={false}
            animate={{ cy: cy(s.values[k]) }}
            transition={transition}
          />
        ))}
      </At>

      {SERIES.map((s, n) => (
        <g key={s.name}>
          <rect x={CHART.x} y={CHART.y + CHART.h + 46 + n * 20} width={10} height={3} rx={1.5} fill={s.color} />
          <Label x={CHART.x + 16} y={CHART.y + CHART.h + 47 + n * 20} size={11} anchor="start" fill={K.ink}>
            {s.name}
          </Label>
          <Num
            x={CHART.x + CHART.w}
            y={CHART.y + CHART.h + 47 + n * 20}
            value={s.values[k]}
            size={11}
            anchor="end"
            fill={s.ink}
          />
        </g>
      ))}
    </Figure>
  );
}
