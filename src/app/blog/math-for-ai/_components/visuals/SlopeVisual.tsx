"use client";

import { motion, useTransform } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, fade } from "@/components/blog/svg";
import { SLOPE, fmt, range } from "../model";
import { Arrow, Clip, Grid, K, arrowPath, plane, useTweened } from "../svg";

const CODE = `f = lambda x: (x - 1) ** 2 / 3 + 0.3
slope = (f(x + h) - f(x)) / h
df = lambda x: 2 * (x - 1) / 3
x = x - lr * df(x)`;

const FOCUS: Focus[][] = [[0], [1], [1], [2], [3], [3]];

const P = plane({ x: [-2.2, 4.4], y: [-0.2, 3.6], unit: 52, left: 58, top: 8 });
const { f, x0, secant } = SLOPE;
const TANGENT = 0.0001;
const H = [SLOPE.h[0], SLOPE.h[0], SLOPE.h[1], TANGENT, TANGENT, TANGENT];
const REACH = 3;

const CURVE = range(0, 132)
  .map((i) => P.at([P.x[0] + i * 0.05, f(P.x[0] + i * 0.05)]))
  .map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`)
  .join(" ");

const onCurve = (x: number) => P.at([x, f(x)]);
const START = onCurve(x0);

function Path({ xs, color, show }: { xs: number[]; color: string; show: boolean }) {
  return (
    <g>
      {xs.slice(1).map((x, k) => (
        <motion.g key={k} {...fade(show, 0.2 + k * 0.25)}>
          <Arrow from={onCurve(xs[k])} to={onCurve(x)} color={color} width={1.75} head={7} />
          <circle cx={onCurve(x)[0]} cy={onCurve(x)[1]} r={4} fill={color} />
        </motion.g>
      ))}
    </g>
  );
}

export default function SlopeVisual() {
  const { step } = useStage();
  const h = useTweened([H[step]]);
  const line = useTransform(h, ([d]) => {
    const s = secant(d);
    return arrowPath([...P.at([x0 - REACH, f(x0) - REACH * s]), ...P.at([x0 + REACH, f(x0) + REACH * s])], 0);
  });
  const rise = useTransform(h, ([d]) => {
    const [a, b] = [P.at([x0 + d, f(x0)]), onCurve(x0 + d)];
    return `M ${START[0]} ${START[1]} H ${a[0]} V ${b[1]}`;
  });
  const cx = useTransform(h, ([d]) => onCurve(x0 + d)[0]);
  const cy = useTransform(h, ([d]) => onCurve(x0 + d)[1]);
  const dxX = useTransform(h, ([d]) => P.px(x0 + d / 2));
  const dyX = useTransform(h, ([d]) => P.px(x0 + d) + 8);
  const dyY = useTransform(h, ([d]) => P.py((f(x0) + f(x0 + d)) / 2));
  const reading = useTransform(h, ([d]) => `${d < 0.01 ? "f′(x)" : "slope"} = ${fmt(secant(d))}`);

  return (
    <Figure
      viewBox="0 0 460 214"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A curve with a line through two of its points. As the second point slides closer, the line turns into the tangent, whose slope is the derivative. Steps against the slope walk down to the minimum, or overshoot when they are too large."
    >
      <Grid plane={P} />
      <Clip plane={P}>
        <path d={CURVE} stroke={K.ink} strokeWidth={2} fill="none" />
        <motion.g {...fade(step >= 1 && step <= 3)}>
          <motion.path d={line} stroke={K.out} strokeWidth={2} fill="none" />
        </motion.g>
      </Clip>

      <motion.g {...fade(step === 1 || step === 2)}>
        <motion.path d={rise} stroke={K.muted} strokeDasharray="3 4" fill="none" />
        <motion.circle cx={cx} cy={cy} r={4.5} fill={K.out} />
        <motion.text
          x={dxX}
          y={P.py(f(x0)) + 14}
          fontSize={12}
          textAnchor="middle"
          dominantBaseline="central"
          fill={K.muted}
          className="font-math italic"
        >
          h
        </motion.text>
        <motion.text
          x={dyX}
          y={dyY}
          fontSize={12}
          dominantBaseline="central"
          fill={K.muted}
          className="font-math"
        >
          rise
        </motion.text>
      </motion.g>

      <motion.g {...fade(step >= 1 && step <= 3)}>
        <rect x={P.left + 10} y={P.top + 10} width={112} height={26} rx={5} fill="#fff" stroke={K.faint} />
        <motion.text
          x={P.left + 66}
          y={P.top + 23}
          fontSize={13}
          fontWeight={600}
          textAnchor="middle"
          dominantBaseline="central"
          fill={K.outInk}
          className="tabular-nums"
        >
          {reading}
        </motion.text>
      </motion.g>

      <Path xs={SLOPE.slow} color={K.a} show={step === 4} />
      <Path xs={SLOPE.fast} color={K.b} show={step === 5} />
      <circle cx={START[0]} cy={START[1]} r={5} fill={K.ink} />
    </Figure>
  );
}
