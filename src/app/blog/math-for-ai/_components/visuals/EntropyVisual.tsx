"use client";

import { motion, useTransform } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText } from "@/components/blog/svg";
import { NEXT, SURPRISE, fmt, range } from "../model";
import { At, Clip, K, Num, VBar, plane, useTweened } from "../svg";

const CODE = `loss = -np.log(p[target])
loss = F.cross_entropy(logits, target)
grad = p - np.eye(len(p))[target]`;

const FOCUS: Focus[][] = [[0], [0], [1], [2]];

const P = plane({ x: [0, 1], y: [0, 4], unit: [200, 40], left: 40, top: 18 });
const CURVE = range(0, 100)
  .map((i) => 0.016 + (i / 100) * 0.984)
  .map((p, i) => `${i ? "L" : "M"} ${P.px(p).toFixed(1)} ${P.py(-Math.log(p)).toFixed(1)}`)
  .join(" ");

const CENTERS = [300, 340, 380, 420];
const WIDTH = 30;
const BARS = { k: 110, base: 150, gradBase: 110, tokens: 172 };

export default function EntropyVisual() {
  const { step } = useStage();
  const gradient = step === 3;
  const p = SURPRISE.cases[gradient ? 0 : step];
  const values = gradient ? SURPRISE.grad : p;
  const base = gradient ? BARS.gradBase : BARS.base;

  const chance = useTweened([p[SURPRISE.target]]);
  const cx = useTransform(chance, ([q]) => P.px(q));
  const cy = useTransform(chance, ([q]) => P.py(-Math.log(q)));
  const guide = useTransform(
    chance,
    ([q]) => `M ${P.px(q)} ${P.py(0)} V ${P.py(-Math.log(q))} H ${P.px(0)}`,
  );
  const reading = useTransform(chance, ([q]) => `p = ${fmt(q)} · −log p = ${fmt(-Math.log(q))}`);

  return (
    <Figure
      viewBox="0 0 460 200"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The curve minus log p, with a marker at the probability the model gave the correct word. Next to it, the model's probabilities for four words, and finally the gradient p minus y."
    >
      <rect x={P.left} y={P.top} width={P.width} height={P.height} fill="#fff" stroke={K.faint} rx={4} />
      {[1, 2, 3].map((t) => (
        <line key={t} x1={P.left} x2={P.left + P.width} y1={P.py(t)} y2={P.py(t)} stroke={K.grid} />
      ))}
      {[0, 2, 4].map((t) => (
        <Label key={t} x={P.left - 8} y={P.py(t)} size={10} anchor="end">
          {t}
        </Label>
      ))}
      {[0, 0.5, 1].map((t) => (
        <Label key={t} x={P.px(t)} y={P.py(0) + 12} size={10}>
          {t}
        </Label>
      ))}
      <MathText x={P.left + P.width} y={P.py(0) + 12} size={12} anchor="start" fill={K.muted}>
        {" p"}
      </MathText>
      <Clip plane={P}>
        <path d={CURVE} stroke={K.ink} strokeWidth={2} fill="none" />
        <motion.path d={guide} stroke={K.green} strokeDasharray="3 4" fill="none" />
      </Clip>
      <motion.circle cx={cx} cy={cy} r={5.5} fill={K.green} />
      <motion.text
        x={P.left + P.width - 8}
        y={P.top + 14}
        fontSize={12}
        fontWeight={600}
        textAnchor="end"
        dominantBaseline="central"
        fill={K.green}
        className="tabular-nums"
      >
        {reading}
      </motion.text>

      <Label x={360} y={10} size={12} fill={K.ink} weight={600}>
        {gradient ? "p − y" : "p"}
      </Label>
      <At x={0} y={base}>
        <line x1={280} x2={440} y1={0} y2={0} stroke={K.axis} strokeWidth={1.5} />
      </At>
      {NEXT.tokens.map((token, i) => {
        const v = values[i];
        const target = i === SURPRISE.target;
        const label = v < 0 ? base + Math.abs(v) * BARS.k + 10 : base - v * BARS.k - 10;
        return (
          <g key={token}>
            <VBar
              x={CENTERS[i] - WIDTH / 2}
              base={base}
              value={v}
              k={BARS.k}
              width={WIDTH}
              fill={target ? K.green : gradient ? K.b : K.ink}
              opacity={target ? 1 : 0.7}
            />
            <At x={CENTERS[i]} y={label}>
              <Num x={0} y={0} value={v} size={11} />
            </At>
            <Label x={CENTERS[i]} y={BARS.tokens} size={11} fill={K.ink} weight={target ? 600 : undefined}>
              {token}
            </Label>
          </g>
        );
      })}
    </Figure>
  );
}
