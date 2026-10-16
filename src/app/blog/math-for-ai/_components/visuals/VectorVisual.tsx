"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText, fade } from "@/components/blog/svg";
import { ANALOGY, ARROWS, EMBEDDING, fmt } from "../model";
import { Arrow, At, Bracket, Grid, K, Num, plane } from "../svg";

const CODE = `v = np.array([3, 2])
w = np.array([-1, 1])
np.linalg.norm(v)
1.5 * v
v + w
E["king"] - E["man"] + E["woman"]`;

const FOCUS: Focus[][] = [[0], [0], [2], [3], [1, 4], [5]];
const NAMES = ["v", "v", "v", "1.5v", "v + w"];

const P = plane({ x: [-2, 5], y: [-1.5, 3.5], unit: 40, left: 172, top: 8 });
const O = P.at([0, 0]);
const COLUMN = { x: 84, title: 58, rows: [96, 124] };
const LONG = { title: 28, top: 52, gap: 21 };

export default function VectorVisual() {
  const { step } = useStage();
  const main = step === 3 ? ARROWS.long : step === 4 ? ARROWS.sum : ARROWS.v;
  const drawn = step >= 1 && step <= 4;
  const tip = P.at(step === 3 ? ARROWS.long : ARROWS.v);
  const sumTip = P.at(ARROWS.sum);
  const flipTip = P.at(ARROWS.flip);
  const corner = P.at([ARROWS.v[0], 0]);
  const vTip = P.at(ARROWS.v);

  return (
    <Figure
      viewBox="0 0 460 216"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A vector drawn as a column of numbers and as an arrow in the plane, then scaled, added, and finally shown as word embeddings."
    >
      <motion.g {...fade(step <= 4)}>
        <MathText x={COLUMN.x} y={COLUMN.title} size={16} anchor="middle">
          {NAMES[Math.min(step, 4)]}
        </MathText>
        <Bracket x={COLUMN.x} top={COLUMN.rows[0] - 16} bottom={COLUMN.rows[1] + 16} width={52} />
        {main.map((v, i) => (
          <Num key={i} x={COLUMN.x} y={COLUMN.rows[i]} value={v} digits={step === 3 ? 1 : 0} size={15} />
        ))}
      </motion.g>

      <motion.g {...fade(step === 5)}>
        <Label x={COLUMN.x} y={LONG.title} size={13} fill={K.ink} weight={500}>
          king
        </Label>
        <Bracket
          x={COLUMN.x}
          top={LONG.top - 12}
          bottom={LONG.top + LONG.gap * EMBEDDING.length + 6}
          width={60}
        />
        {EMBEDDING.map((v, i) => (
          <Label key={i} x={COLUMN.x} y={LONG.top + i * LONG.gap} size={12} fill={K.ink}>
            {fmt(v)}
          </Label>
        ))}
        <Label x={COLUMN.x} y={LONG.top + EMBEDDING.length * LONG.gap - 4} size={12} fill={K.muted}>
          ⋮
        </Label>
        <Label x={COLUMN.x} y={204} size={11}>
          768 numbers
        </Label>
      </motion.g>

      <Grid plane={P} />

      <motion.g {...fade(step === 1 || step === 2)}>
        <Arrow from={O} to={corner} color={K.out} width={step === 2 ? 2.5 : 1.5} head={0} dashed={step === 1} />
        <Arrow from={corner} to={vTip} color={K.out} width={step === 2 ? 2.5 : 1.5} head={0} dashed={step === 1} />
        <Label x={P.px(ARROWS.v[0] / 2)} y={O[1] + 12} size={12} fill={K.outInk}>
          3
        </Label>
        <Label x={corner[0] + 10} y={P.py(ARROWS.v[1] / 2)} size={12} fill={K.outInk}>
          2
        </Label>
      </motion.g>
      <motion.g {...fade(step === 2, 0.2)}>
        <MathText x={P.px(1.2)} y={P.py(1.5)} size={14} anchor="middle">
          {`‖v‖ = ${fmt(ARROWS.length)}`}
        </MathText>
      </motion.g>

      <Arrow from={O} to={P.at(ARROWS.w)} color={K.b} width={1.5} dashed opacity={step === 4 ? 0.5 : 0} />
      <Arrow from={vTip} to={sumTip} color={K.b} opacity={step === 4 ? 1 : 0} />
      <Arrow from={O} to={sumTip} color={K.out} width={2.5} opacity={step === 4 ? 1 : 0} />
      <Arrow from={O} to={flipTip} color={K.b} opacity={step === 3 ? 1 : 0} />
      <Arrow from={O} to={tip} width={2.5} opacity={drawn ? 1 : 0} />

      <At x={tip[0] + (step === 3 ? -14 : 10)} y={tip[1] - 10} opacity={drawn ? 1 : 0}>
        <MathText x={0} y={0} size={15} anchor={step === 3 ? "end" : "start"}>
          {step === 3 ? "1.5v" : "v"}
        </MathText>
      </At>
      <motion.g {...fade(step === 3)}>
        <MathText x={flipTip[0] - 6} y={flipTip[1] + 14} size={15} fill={K.b} anchor="end">
          −0.5v
        </MathText>
      </motion.g>
      <motion.g {...fade(step === 4, 0.3)}>
        <MathText x={P.px(2.75)} y={P.py(2.75)} size={15} fill={K.b}>
          w
        </MathText>
        <MathText x={sumTip[0] - 10} y={sumTip[1] - 8} size={15} fill={K.outInk} anchor="end">
          v + w
        </MathText>
      </motion.g>

      <motion.g {...fade(step === 5)}>
        {ANALOGY.map(({ word, at }) => {
          const [x, y] = P.at(at);
          return (
            <g key={word}>
              <circle cx={x} cy={y} r={4} fill={K.ink} />
              <Label x={x + 9} y={y + 1} size={12} anchor="start" fill={K.ink}>
                {word}
              </Label>
            </g>
          );
        })}
      </motion.g>
      <Arrow
        from={P.at(ANALOGY[0].at)}
        to={P.at(ANALOGY[1].at)}
        color={K.out}
        width={2}
        opacity={step === 5 ? 1 : 0}
      />
      <Arrow
        from={P.at(ANALOGY[2].at)}
        to={P.at(ANALOGY[3].at)}
        color={K.out}
        width={2}
        dashed
        opacity={step === 5 ? 1 : 0}
      />
    </Figure>
  );
}
