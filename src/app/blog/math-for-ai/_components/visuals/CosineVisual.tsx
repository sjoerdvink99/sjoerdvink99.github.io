"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { SEARCH, unit } from "../model";
import { Arrow, At, Clip, Grid, HBar, K, Num, plane } from "../svg";

const CODE = `scores = E @ q
E = E / np.linalg.norm(E, axis=1, keepdims=True)
scores = E @ (q / np.linalg.norm(q))
best = np.argsort(-scores)[:k]`;

const FOCUS: Focus[][] = [[0], [1, 2], [3]];

const P = plane({ x: [-2, 3], y: [-0.6, 2.4], unit: 56, left: 8, top: 8 });
const O = P.at([0, 0]);
const ROWS = [44, 76, 108, 140];
const BARS = { label: 300, base: 372, value: 456 };
const SCALE = { raw: 16, cosine: 42 };

const winner = (scores: number[]) => scores.indexOf(Math.max(...scores));

export default function CosineVisual() {
  const { step } = useStage();
  const normal = step >= 1;
  const scores = normal ? SEARCH.cosine : SEARCH.raw;
  const best = winner(scores);
  const q = P.at(normal ? unit(SEARCH.query) : SEARCH.query);

  return (
    <Figure
      viewBox="0 0 460 184"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Four word vectors of different lengths and a query. Their raw dot products favour the longest vector. After normalising all of them onto the unit circle, the closest direction wins."
    >
      <Grid plane={P} />
      <Clip plane={P}>
        <motion.circle
          cx={O[0]}
          cy={O[1]}
          r={P.px(1) - O[0]}
          fill="none"
          stroke={K.muted}
          strokeDasharray="3 4"
          {...fade(normal)}
        />
      </Clip>

      {SEARCH.items.map((item, i) => {
        const tip = P.at(normal ? unit(item.v) : item.v);
        const color = i === best ? K.out : K.ink;
        return (
          <g key={item.word}>
            <Arrow from={O} to={tip} color={color} width={i === best ? 2.5 : 1.75} />
            <At x={tip[0]} y={tip[1]}>
              <Label
                x={item.v[0] < 0 ? -6 : 6}
                y={-10}
                size={11}
                anchor={item.v[0] < 0 ? "end" : "start"}
                fill={color}
                weight={i === best ? 600 : undefined}
              >
                {item.word}
              </Label>
            </At>
          </g>
        );
      })}
      <Arrow from={O} to={q} color={K.b} width={2.5} />

      <text x={BARS.base} y={18} fontSize={11} textAnchor="middle" dominantBaseline="central" fill={K.muted}>
        {normal ? "cosine with " : "dot product with "}
        <tspan fill={K.b} fontWeight={600} className="font-math italic">
          q
        </tspan>
      </text>
      <line x1={BARS.base} x2={BARS.base} y1={ROWS[0] - 12} y2={ROWS[3] + 12} stroke={K.axis} />
      {SEARCH.items.map((item, i) => (
        <g key={item.word}>
          <Label
            x={BARS.label}
            y={ROWS[i]}
            size={12}
            anchor="start"
            fill={i === best ? K.outInk : K.ink}
            weight={i === best ? 600 : undefined}
          >
            {item.word}
          </Label>
          <HBar
            y={ROWS[i]}
            base={BARS.base}
            value={scores[i]}
            k={normal ? SCALE.cosine : SCALE.raw}
            fill={i === best ? K.out : K.faint}
          />
          <Num x={BARS.value} y={ROWS[i]} value={scores[i]} size={11} anchor="end" fill={K.muted} />
        </g>
      ))}
    </Figure>
  );
}
