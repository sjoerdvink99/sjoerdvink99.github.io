"use client";

import { motion, useTransform } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, MathText, fade } from "@/components/blog/svg";
import { DOT, dot, fmt, norm, radians, scale, tex, times, type Point } from "../model";
import { Arrow, Calc, Clip, Grid, K, Slider, arrowPath, plane, useTweened, type Line } from "../svg";

const P = plane({ x: [-3, 3.6], y: [-1, 2.6], unit: 50, left: 65, top: 6 });
const O = P.at([0, 0]);
const A_TIP = P.at(DOT.a);
const GAUGE = { y: 218, from: 80, to: 380 };
const ARC = 26;

const gx = (v: number) => GAUGE.from + ((v + DOT.max) / (2 * DOT.max)) * (GAUGE.to - GAUGE.from);
const around = (deg: number, r: number): Point => [
  O[0] + r * Math.cos(DOT.base + radians(deg)),
  O[1] - r * Math.sin(DOT.base + radians(deg)),
];
const arc = (deg: number) => {
  const [x0, y0] = around(0, ARC);
  const [x1, y1] = around(deg, ARC);
  return `M ${x0} ${y0} A ${ARC} ${ARC} 0 0 0 ${x1} ${y1}`;
};
const shadow = (deg: number) => scale(DOT.a, DOT.at(deg) / dot(DOT.a, DOT.a));

const code = (deg: number) => {
  const b = deg === 45 ? DOT.b.map((v) => tex(v, 0)) : DOT.turn(deg).map((v) => tex(v));
  return `a = np.array([3, 1])
b = np.array([${b.join(", ")}])
a @ b
norm(a) * norm(b) * np.cos(theta)
a @ b / norm(a)`;
};

const FOCUS: Focus[][] = [[2], [3], [4], [2], [2], [2]];

const rotated = (deg: number): Line[] => [
  `θ = ${Math.round(deg)}°   cos θ = ${fmt(Math.cos(radians(deg)))}   a · b = ${fmt(DOT.at(deg))}`,
];

const la = norm(DOT.a);
const value = DOT.at(45);
const LINES: Line[][] = [
  [`a · b = ${times(DOT.a[0], DOT.b[0])} + ${times(DOT.a[1], DOT.b[1])} = ${fmt(value, 0)}`],
  [`‖a‖ ‖b‖ cos θ = √${dot(DOT.a, DOT.a)} × √${dot(DOT.b, DOT.b)} × cos 45° = ${fmt(value, 0)}`],
  [`shadow = a · b / ‖a‖ = ${fmt(value, 0)} / ${fmt(la)} = ${fmt(value / la)}`],
  rotated(DOT.angles[3]),
  rotated(DOT.angles[4]),
];

export default function DotVisual() {
  const { step } = useStage();
  const [free, setFree] = useState(45);
  const angle = step === 5 ? free : DOT.angles[step];
  const turned = useTweened([angle]);

  const bPath = useTransform(turned, ([deg]) => arrowPath([...O, ...P.at(DOT.turn(deg))]));
  const bx = useTransform(turned, ([deg]) => P.at(DOT.turn(deg))[0]);
  const by = useTransform(turned, ([deg]) => P.at(DOT.turn(deg))[1]);
  const arcPath = useTransform(turned, ([deg]) => arc(deg));
  const thetaX = useTransform(turned, ([deg]) => around(deg / 2, ARC + 13)[0]);
  const thetaY = useTransform(turned, ([deg]) => around(deg / 2, ARC + 13)[1]);
  const shadowPath = useTransform(turned, ([deg]) => arrowPath([...O, ...P.at(shadow(deg))], 0));
  const dropPath = useTransform(turned, ([deg]) =>
    arrowPath([...P.at(DOT.turn(deg)), ...P.at(shadow(deg))], 0),
  );
  const markerX = useTransform(turned, ([deg]) => gx(DOT.at(deg)));
  const reading = useTransform(turned, ([deg]) => fmt(DOT.at(deg)));

  const lines = [...LINES, rotated(free)];

  return (
    <Figure
      viewBox="0 0 460 272"
      top={<Code code={code(angle)} focus={FOCUS[step]} />}
      interactive={step === 5}
      label="Two vectors a and b with the angle between them. The shadow of b on a, times the length of a, is the dot product, shown on a scale below."
      controls={
        <Slider
          label="θ"
          value={free}
          min={0}
          max={180}
          step={1}
          onChange={setFree}
          display={`${free}°`}
          hidden={step !== 5}
        />
      }
    >
      <Grid plane={P} />

      <Clip plane={P}>
        <motion.g {...fade(step >= 2)}>
          <line
            x1={P.at(scale(DOT.a, -2))[0]}
            y1={P.at(scale(DOT.a, -2))[1]}
            x2={P.at(scale(DOT.a, 2))[0]}
            y2={P.at(scale(DOT.a, 2))[1]}
            stroke={K.a}
            strokeOpacity={0.3}
            strokeDasharray="3 5"
          />
          <motion.path d={dropPath} stroke={K.muted} strokeDasharray="3 4" fill="none" />
          <motion.path
            d={shadowPath}
            stroke={K.out}
            strokeWidth={5}
            strokeOpacity={0.75}
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
      </Clip>

      <motion.g {...fade(step >= 1)}>
        <motion.path d={arcPath} stroke={K.muted} fill="none" />
        <motion.g style={{ x: thetaX, y: thetaY }}>
          <MathText x={0} y={0} size={13} fill={K.muted} anchor="middle">
            θ
          </MathText>
        </motion.g>
      </motion.g>

      <Arrow from={O} to={A_TIP} color={K.a} width={2.5} />
      <MathText x={A_TIP[0] + 8} y={A_TIP[1] - 8} size={16} fill={K.a}>
        a
      </MathText>
      <motion.path
        d={bPath}
        stroke={K.b}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.g style={{ x: bx, y: by }}>
        <MathText x={8} y={-8} size={16} fill={K.b}>
          b
        </MathText>
      </motion.g>

      <g>
        <line x1={GAUGE.from} x2={GAUGE.to} y1={GAUGE.y} y2={GAUGE.y} stroke={K.faint} strokeWidth={2} />
        {[-5, 0, 5].map((t) => (
          <g key={t}>
            <line x1={gx(t)} x2={gx(t)} y1={GAUGE.y - 4} y2={GAUGE.y + 4} stroke={K.axis} />
            <Label x={gx(t)} y={GAUGE.y + 15} size={10}>
              {fmt(t, 0)}
            </Label>
          </g>
        ))}
        <Label x={GAUGE.from - 10} y={GAUGE.y} size={11} anchor="end" fill={K.ink}>
          a · b
        </Label>
        <motion.g style={{ x: markerX }}>
          <circle cx={0} cy={GAUGE.y} r={5.5} fill={K.out} />
          <motion.text
            x={0}
            y={GAUGE.y - 15}
            fontSize={12}
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="central"
            fill={K.outInk}
            className="tabular-nums"
          >
            {reading}
          </motion.text>
        </motion.g>
      </g>

      <Calc x={230} y={258} steps={lines} step={step} anchor="middle" />
    </Figure>
  );
}
