"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, Sym, fade } from "@/components/blog/svg";
import {
  BASE,
  EYE_DIR,
  SMILE_DIR,
  SMILE_ONLY,
  add,
  decode,
  dot,
  fmt,
  perp,
  range,
  scale,
  unit,
  type Vec,
} from "../model";
import { Arrow, Clip, Dot, Face, Grid, K, Num, plane } from "../svg";

const CODE = `probe = LogisticRegression().fit(Z, eyes_open)
n = probe.coef_[0] / np.linalg.norm(probe.coef_[0])

v_only = v - (v @ n) * n
z_edit = z + alpha * v_only`;

const FOCUS: Focus[][] = [[[4, "z_edit"]], [0, 1], [3], [3, 4]];

const P = plane({ x: [-3, 3], y: [-3, 3], unit: 38, left: 6, top: 8 });
const ALONG = perp(EYE_DIR);
const level = (c: number): [Vec, Vec] => [
  add(scale(EYE_DIR, c), scale(ALONG, -6)),
  add(scale(EYE_DIR, c), scale(ALONG, 6)),
];
const LEVELS = range(-4, 4).map((k) => k * 0.75);
const HOME_LINE = level(dot(BASE, EYE_DIR)).map(P.at);
const TIP = add(BASE, SMILE_DIR);
const FOOT = add(BASE, SMILE_ONLY);
const CORNER = (() => {
  const s = 7 / P.unit;
  const a = scale(unit(SMILE_ONLY), -s);
  const b = scale(EYE_DIR, s * Math.sign(dot(SMILE_DIR, EYE_DIR)));
  return [add(FOOT, a), add(add(FOOT, a), b), add(FOOT, b)].map(P.at);
})();

const COLUMNS = [
  { name: "start", z: BASE, from: 0 },
  { name: "+ v", z: TIP, from: 0 },
  { name: "+ v⊥", z: FOOT, from: 3 },
];
const colX = (k: number) => 304 + k * 62;

export default function IndependenceVisual() {
  const { step } = useStage();
  return (
    <Figure
      viewBox="0 0 460 246"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The smile direction is not parallel to the lines along which eye openness stays constant, so following it also closes the eyes. Splitting it into a part along the eye direction and a part along the constant-eyes lines, and keeping only the second, gives an edit that adds a smile and leaves the eyes alone."
    >
      <Grid plane={P} axes={false} />
      <Clip plane={P}>
        <motion.g {...fade(step >= 1)}>
          {LEVELS.map((c) => {
            const [a, b] = level(c);
            return (
              <line
                key={c}
                x1={P.px(a[0])}
                y1={P.py(a[1])}
                x2={P.px(b[0])}
                y2={P.py(b[1])}
                stroke={K.slate}
                strokeOpacity={0.3}
              />
            );
          })}
        </motion.g>
        <motion.g {...fade(step === 3)}>
          <line
            x1={HOME_LINE[0][0]}
            y1={HOME_LINE[0][1]}
            x2={HOME_LINE[1][0]}
            y2={HOME_LINE[1][1]}
            stroke={K.blue}
            strokeOpacity={0.35}
            strokeWidth={5}
          />
        </motion.g>
      </Clip>

      <motion.g {...fade(step === 1)}>
        <Arrow from={P.at([0, 0])} to={P.at(scale(EYE_DIR, 1.6))} color={K.slate} width={2} />
        <Sym x={P.px(EYE_DIR[0] * 1.6) - 6} y={P.py(EYE_DIR[1] * 1.6) - 12} size={15} fill={K.slate}>
          n
        </Sym>
        <Label x={P.px(EYE_DIR[0] * 1.6) + 6} y={P.py(EYE_DIR[1] * 1.6) - 12} size={10} anchor="start" fill={K.slate}>
          eyes open
        </Label>
      </motion.g>

      <Arrow from={P.at(BASE)} to={P.at(TIP)} color={K.amber} width={2.25} opacity={step === 3 ? 0.35 : 1} />
      <Sym x={P.px(TIP[0]) + 4} y={P.py(TIP[1]) + 14} size={15} fill={K.amberInk}>
        v
      </Sym>

      <motion.g {...fade(step >= 2)}>
        <path
          d={`M ${P.px(FOOT[0])} ${P.py(FOOT[1])} L ${P.px(TIP[0])} ${P.py(TIP[1])}`}
          stroke={K.rose}
          strokeWidth={1.75}
          strokeDasharray="4 4"
        />
        <path
          d={`M ${CORNER.map(([x, y]) => `${x} ${y}`).join(" L ")}`}
          fill="none"
          stroke={K.muted}
          strokeWidth={1}
        />
        <Arrow from={P.at(BASE)} to={P.at(FOOT)} color={K.blue} width={2.5} />
        <Sym x={P.px(FOOT[0]) + 4} y={P.py(FOOT[1]) - 14} size={15} fill={K.blue} sub="⊥">
          v
        </Sym>
        <Label x={P.px((FOOT[0] + TIP[0]) / 2) + 10} y={P.py((FOOT[1] + TIP[1]) / 2)} size={10} anchor="start" fill={K.rose}>
          (v · n) n
        </Label>
      </motion.g>

      <Dot at={P.at(BASE)} color={K.rose} r={4.5} />

      <Label x={272} y={146} size={10} anchor="end">
        smile
      </Label>
      <Label x={272} y={164} size={10} anchor="end">
        eyes
      </Label>
      {COLUMNS.map((c, k) => {
        const look = decode(c.z);
        return (
          <motion.g key={c.name} {...fade(step >= c.from)}>
            <Face look={look} x={colX(k)} y={88} r={23} ring={k === 2 ? K.blue : k === 1 ? K.amber : undefined} />
            <Label x={colX(k)} y={124} size={11} fill={K.ink}>
              {c.name}
            </Label>
            <Num x={colX(k)} y={146} value={look.smile} size={11} />
            <Num x={colX(k)} y={164} value={look.eyes} size={11} fill={k === 1 ? K.rose : K.ink} />
          </motion.g>
        );
      })}
      <motion.g {...fade(step === 2)}>
        <Label x={366} y={200} size={11} fill={K.rose}>
          {`v · n = ${fmt(dot(SMILE_DIR, EYE_DIR))}`}
        </Label>
      </motion.g>
    </Figure>
  );
}
