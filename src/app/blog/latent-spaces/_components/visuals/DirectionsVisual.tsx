"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, Sym, fade } from "@/components/blog/svg";
import {
  BASE,
  EDIT_STEPS,
  FACES,
  SMILE_DIR,
  SMILE_MEANS,
  SMILING,
  add,
  decode,
  dot,
  fmt,
  project,
  scale,
  unit,
} from "../model";
import { Arrow, Clip, Cross, Dot, Face, Grid, K, Num, Slider, plane } from "../svg";

const CODE = `v = Z[smiling].mean(0) - Z[~smiling].mean(0)
z_edit = z + alpha * v
score = Z @ v / np.linalg.norm(v)`;

const FOCUS: Focus[][] = [[[0, "Z[smiling]"]], [0], [1], [1], [2]];

const P = plane({ x: [-3, 3], y: [-3, 3], unit: 38, left: 6, top: 8 });
const V_HAT = unit(SMILE_DIR);
const COUNTS = [SMILING.filter((s) => !s).length, SMILING.filter(Boolean).length];
const LINE = { x0: 268, x1: 448, y: 112, k: 20 };
const scoreX = (s: number) => (LINE.x0 + LINE.x1) / 2 + s * LINE.k;
const GROUPS = [
  { color: K.slate, hollow: true, name: "not smiling" },
  { color: K.blue, hollow: false, name: "smiling" },
];

export default function DirectionsVisual() {
  const { step } = useStage();
  const [free, setFree] = useState(1);
  const sliding = step === 3;
  const alpha = sliding ? free : EDIT_STEPS[Math.min(step, 3)];
  const edited = add(BASE, scale(SMILE_DIR, alpha));
  const editing = step === 2 || step === 3;
  const measuring = step === 4;
  const duration = sliding ? 0.25 : undefined;

  return (
    <Figure
      viewBox="0 0 460 246"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      interactive={sliding}
      label="Forty example faces as points in the latent space, filled when smiling. The arrow between the mean of the smiling points and the mean of the others is the smile direction. Adding it to a frowning face makes it smile, and projecting every point onto it gives a smile score that mostly separates the two groups."
      controls={
        <Slider
          label={<span className="font-math italic">α</span>}
          value={free}
          min={-0.6}
          max={1.5}
          step={0.05}
          onChange={setFree}
          display={fmt(free)}
          hidden={!sliding}
        />
      }
    >
      <Grid plane={P} />
      <Clip plane={P}>
        <motion.g {...fade(measuring)}>
          <line
            x1={P.px(-4 * V_HAT[0])}
            y1={P.py(-4 * V_HAT[1])}
            x2={P.px(4 * V_HAT[0])}
            y2={P.py(4 * V_HAT[1])}
            stroke={K.amber}
            strokeWidth={1.5}
          />
          {FACES.map((z, i) => {
            const [fx, fy] = P.at(project(z, SMILE_DIR));
            return (
              <line
                key={i}
                x1={P.px(z[0])}
                y1={P.py(z[1])}
                x2={fx}
                y2={fy}
                stroke={GROUPS[Number(SMILING[i])].color}
                strokeOpacity={0.35}
                strokeDasharray="2 3"
              />
            );
          })}
        </motion.g>
        {FACES.map((z, i) => {
          const g = GROUPS[Number(SMILING[i])];
          return (
            <Dot key={i} at={P.at(z)} color={g.color} hollow={g.hollow} r={3.5} opacity={editing ? 0.3 : 1} />
          );
        })}
      </Clip>

      <motion.g {...fade(step >= 1 && step <= 3)}>
        {SMILE_MEANS.map((m, k) => (
          <Cross key={k} at={P.at(m)} color={GROUPS[k].color} />
        ))}
      </motion.g>
      <motion.g {...fade(step === 1)}>
        <Arrow from={P.at(SMILE_MEANS[0])} to={P.at(SMILE_MEANS[1])} color={K.amber} width={2.25} />
        <Sym x={P.px((SMILE_MEANS[0][0] + SMILE_MEANS[1][0]) / 2)} y={P.py(SMILE_MEANS[0][1]) - 16} size={16} fill={K.amberInk}>
          v
        </Sym>
      </motion.g>

      <motion.g {...fade(editing)}>
        <Dot at={P.at(BASE)} color={K.rose} hollow r={4.5} />
        <Arrow from={P.at(BASE)} to={P.at(edited)} color={K.amber} width={2.25} duration={duration} />
        <Dot at={P.at(edited)} color={K.rose} r={5} duration={duration} />
      </motion.g>

      <motion.g {...fade(step === 0)}>
        {GROUPS.map((g, k) => (
          <g key={g.name}>
            <circle cx={300} cy={88 + k * 26} r={4} fill={g.hollow ? "#fff" : g.color} stroke={g.color} strokeWidth={1.5} />
            <Label x={312} y={88 + k * 26} anchor="start" size={12} fill={K.ink}>
              {`${g.name} (${COUNTS[k]})`}
            </Label>
          </g>
        ))}
        <Label x={300} y={150} anchor="start" size={11}>
          labelled by a person
        </Label>
      </motion.g>

      <motion.g {...fade(step === 1)}>
        <Label x={358} y={52} size={11} fill={K.ink}>
          the face at each mean
        </Label>
        {SMILE_MEANS.map((m, k) => (
          <g key={k}>
            <Face look={decode(m)} x={312 + k * 92} y={100} r={30} />
            <Label x={312 + k * 92} y={148} size={11} fill={GROUPS[k].color}>
              {GROUPS[k].name}
            </Label>
          </g>
        ))}
      </motion.g>

      <motion.g {...fade(editing)}>
        <Face look={decode(edited)} x={356} y={92} r={50} duration={duration} />
        <Num x={356} y={164} value={alpha} prefix="α = " size={12} duration={duration} />
        <Label x={326} y={190} size={11}>
          smile
        </Label>
        <Num x={326} y={206} value={decode(edited).smile} size={12} duration={duration} />
        <Label x={386} y={190} size={11}>
          eyes
        </Label>
        <Num x={386} y={206} value={decode(edited).eyes} size={12} duration={duration} />
      </motion.g>

      <motion.g {...fade(measuring)}>
        <line x1={LINE.x0} x2={LINE.x1} y1={LINE.y} y2={LINE.y} stroke={K.amber} strokeWidth={1.5} />
        {[-2, 0, 2].map((s) => (
          <g key={s}>
            <line x1={scoreX(s)} x2={scoreX(s)} y1={LINE.y - 3} y2={LINE.y + 3} stroke={K.amber} />
            <Label x={scoreX(s)} y={LINE.y + 14} size={9}>
              {fmt(s, 0)}
            </Label>
          </g>
        ))}
        {FACES.map((z, i) => {
          const g = GROUPS[Number(SMILING[i])];
          return (
            <circle
              key={i}
              cx={scoreX(dot(z, V_HAT))}
              cy={LINE.y - 10 - (SMILING[i] ? 0 : 8)}
              r={3}
              fill={g.hollow ? "#fff" : g.color}
              stroke={g.color}
              strokeWidth={1.25}
            />
          );
        })}
        <Label x={(LINE.x0 + LINE.x1) / 2} y={LINE.y + 34} size={11} fill={K.ink}>
          smile score
        </Label>
        <Face look={decode(scale(V_HAT, -2.6))} x={LINE.x0 + 6} y={LINE.y + 74} r={18} />
        <Face look={decode(scale(V_HAT, 2.6))} x={LINE.x1 - 6} y={LINE.y + 74} r={18} />
      </motion.g>
    </Figure>
  );
}
