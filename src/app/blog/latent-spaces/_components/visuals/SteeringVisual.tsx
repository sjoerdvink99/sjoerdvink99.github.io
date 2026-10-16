"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, Sym, fade } from "@/components/blog/svg";
import {
  ACTIVATIONS,
  HARMFUL,
  HARMLESS,
  add,
  dot,
  fmt,
  perp,
  refuses,
  scale,
  type Vec,
} from "../model";
import { Arrow, Clip, Cross, Dot, Grid, K, Num, Slider, plane, useTween } from "../svg";

const CODE = `_, cache = model.run_with_cache(prompts)
acts = cache["resid_post", 12][:, -1]
r = acts[harmful].mean(0) - acts[harmless].mean(0)
r_hat = r / r.norm()

steer = lambda h, hook: h + alpha * r
ablate = lambda h, hook: h - (h @ r_hat)[..., None] * r_hat

hook = ("blocks.12.hook_resid_post", steer)
with model.hooks(fwd_hooks=[hook]):
    model.generate(prompt)`;

const FOCUS: Focus[][] = [[0, 1], [2, 3], [5, 8, 9, 10], [6]];

const { means, r, rHat, threshold, ablate } = ACTIVATIONS;
const P = plane({ x: [-1.2, 3.2], y: [-2.6, 1.8], unit: 50, left: 6, top: 8 });
const ACROSS = perp(rHat);
const STEERED = 0;
const LABEL = P.at(add(scale(add(means[0], means[1]), 0.5), scale(ACROSS, 0.3)));
const SETS = [
  { points: HARMLESS, color: K.blue, hollow: true, name: "harmless prompts" },
  { points: HARMFUL, color: K.rose, hollow: false, name: "harmful prompts" },
];

const pts = (...vs: Vec[]) => vs.map((v) => P.at(v).join(" ")).join(" L ");
const REGION = `M ${pts(
  add(scale(rHat, threshold), scale(ACROSS, -8)),
  add(scale(rHat, threshold + 8), scale(ACROSS, -8)),
  add(scale(rHat, threshold + 8), scale(ACROSS, 8)),
  add(scale(rHat, threshold), scale(ACROSS, 8)),
)} Z`;
const BOUNDARY = `M ${pts(add(scale(rHat, threshold), scale(ACROSS, -8)), add(scale(rHat, threshold), scale(ACROSS, 8)))}`;
const HYPERPLANE = `M ${pts(scale(ACROSS, -8), scale(ACROSS, 8))}`;

const GAUGE = { x0: 270, x1: 446, y: 116, lo: -1, hi: 3 };
const gx = (s: number) => GAUGE.x0 + ((s - GAUGE.lo) / (GAUGE.hi - GAUGE.lo)) * (GAUGE.x1 - GAUGE.x0);

export default function SteeringVisual() {
  const { step } = useStage();
  const [alpha, setAlpha] = useState(0.8);
  const steering = step === 2;
  const ablating = step === 3;
  const where = (h: Vec) => (ablating ? ablate(h) : h);
  const steered = add(HARMLESS[STEERED], scale(r, steering ? alpha : 0));
  const steeredRefuses = refuses(steered);
  const refusals = HARMFUL.filter((h) => refuses(where(h))).length;
  const transition = useTween();
  const quick = useTween(0.25);

  return (
    <Figure
      viewBox="0 0 460 246"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      interactive={steering}
      label="Activations of a language model, projected to two dimensions. Harmful and harmless prompts form two clusters, and the difference of their means is the refusal direction. Adding it to a harmless prompt makes the model refuse. Removing it from every activation flattens all prompts onto one line, and the model refuses nothing."
      controls={
        <Slider
          label={<span className="font-math italic">α</span>}
          value={alpha}
          min={0}
          max={1.5}
          step={0.05}
          onChange={setAlpha}
          display={fmt(alpha)}
          hidden={!steering}
        />
      }
    >
      <Grid plane={P} />
      <Clip plane={P}>
        <motion.g {...fade(step >= 1)}>
          <path d={REGION} fill={K.roseSoft} fillOpacity={0.7} />
          <path d={BOUNDARY} stroke={K.rose} strokeWidth={1.25} strokeDasharray="4 4" />
        </motion.g>
        <motion.g {...fade(ablating)}>
          <path d={HYPERPLANE} stroke={K.ink} strokeWidth={1.5} />
        </motion.g>
        {SETS.map((set) =>
          set.points.map((h, i) => (
            <Dot
              key={`${set.name}${i}`}
              at={P.at(where(h))}
              color={set.color}
              hollow={set.hollow}
              r={3.75}
              opacity={steering && !(set.hollow && i === STEERED) ? 0.35 : 1}
            />
          )),
        )}
      </Clip>

      <motion.g {...fade(step >= 1)}>
        <Label x={P.px(2.7)} y={P.py(-2.3)} size={11} fill={K.rose}>
          refuses
        </Label>
      </motion.g>

      <motion.g {...fade(step === 1)}>
        {means.map((m, k) => (
          <Cross key={k} at={P.at(m)} color={SETS[k].color} />
        ))}
        <Arrow from={P.at(means[0])} to={P.at(means[1])} color={K.amber} width={2.25} />
        <Sym x={LABEL[0]} y={LABEL[1]} size={16} fill={K.amberInk}>
          r
        </Sym>
      </motion.g>

      <motion.g {...fade(steering)}>
        <Arrow from={P.at(HARMLESS[STEERED])} to={P.at(steered)} color={K.amber} width={2.25} duration={0.25} />
        <Dot at={P.at(steered)} color={steeredRefuses ? K.rose : K.blue} r={5} duration={0.25} />
      </motion.g>

      {SETS.map((set, k) => (
        <g key={set.name}>
          <circle cx={276} cy={30 + k * 20} r={3.75} fill={set.hollow ? "#fff" : set.color} stroke={set.color} strokeWidth={1.5} />
          <Label x={288} y={30 + k * 20} size={11} anchor="start" fill={K.ink}>
            {set.name}
          </Label>
        </g>
      ))}

      <motion.g {...fade(step >= 1)}>
        <line x1={GAUGE.x0} x2={GAUGE.x1} y1={GAUGE.y} y2={GAUGE.y} stroke={K.amber} strokeWidth={1.5} />
        <line x1={gx(threshold)} x2={gx(threshold)} y1={GAUGE.y - 30} y2={GAUGE.y + 6} stroke={K.rose} strokeDasharray="3 3" />
        {[0, 2].map((s) => (
          <Label key={s} x={gx(s)} y={GAUGE.y + 14} size={9}>
            {String(s)}
          </Label>
        ))}
        {SETS.map((set, k) =>
          set.points.map((h, i) => (
            <motion.circle
              key={`${set.name}${i}`}
              cy={GAUGE.y - 9 - k * 9}
              r={3}
              fill={set.hollow ? "#fff" : set.color}
              stroke={set.color}
              strokeWidth={1.25}
              initial={false}
              animate={{ cx: gx(dot(where(h), rHat)), opacity: steering && !(set.hollow && i === STEERED) ? 0.3 : 1 }}
              transition={transition}
            />
          )),
        )}
        <motion.circle
          cy={GAUGE.y - 9}
          r={4.5}
          initial={false}
          animate={{ cx: gx(dot(steered, rHat)), opacity: steering ? 1 : 0, fill: steeredRefuses ? K.rose : K.blue }}
          transition={quick}
        />
        <Label x={(GAUGE.x0 + GAUGE.x1) / 2} y={GAUGE.y + 32} size={11} fill={K.ink}>
          {"h · r̂, read out at layer 12"}
        </Label>
      </motion.g>

      <motion.g {...fade(steering)}>
        <Label x={276} y={188} size={11} anchor="start">
          steered prompt
        </Label>
        <Label x={444} y={188} size={12} anchor="end" fill={steeredRefuses ? K.rose : K.blue}>
          {steeredRefuses ? "refuses" : "answers"}
        </Label>
      </motion.g>
      <motion.g {...fade(ablating || step === 1)}>
        <Label x={276} y={188} size={11} anchor="start">
          harmful refused
        </Label>
        <Num x={444} y={188} value={refusals} digits={0} suffix={` of ${HARMFUL.length}`} size={12} anchor="end" fill={K.rose} />
      </motion.g>
    </Figure>
  );
}
