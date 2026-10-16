"use client";

import { motion, useTransform } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import {
  BELIEFS,
  PREFERENCE,
  START,
  decode,
  degrees,
  honest,
  polar,
  query,
  update,
  type Belief,
  type Point,
} from "../model";
import { Button, Face, K, Num, useTweened } from "../svg";

const CODE = `w = torch.zeros(2, requires_grad=True)
opt = torch.optim.Adam([w], lr=0.05)
for _ in range(500):
    margin = (z_preferred - z_rejected) @ w
    loss = -F.logsigmoid(margin).mean()
    opt.zero_grad()
    loss.backward()
    opt.step()`;

const FOCUS: Focus[][] = [[[3, "z_preferred - z_rejected"]], [3], [3, 4], [4]];

const DIAL = { x: 352, y: 108, r: 76 };
const on = (angle: number, r = DIAL.r): Point => [DIAL.x + r * Math.cos(angle), DIAL.y - r * Math.sin(angle)];
const PAIR = [
  { name: "A", x: 66 },
  { name: "B", x: 178 },
];

function arcPath(center: number, half: number) {
  if (half >= Math.PI - 1e-3) {
    return `M ${DIAL.x - DIAL.r} ${DIAL.y} A ${DIAL.r} ${DIAL.r} 0 1 0 ${DIAL.x + DIAL.r} ${DIAL.y} A ${DIAL.r} ${DIAL.r} 0 1 0 ${DIAL.x - DIAL.r} ${DIAL.y}`;
  }
  const [x1, y1] = on(center - half);
  const [x2, y2] = on(center + half);
  return `M ${x1} ${y1} A ${DIAL.r} ${DIAL.r} 0 ${2 * half > Math.PI ? 1 : 0} 0 ${x2} ${y2}`;
}

const ray = (angle: number) => {
  const [x1, y1] = on(angle, 34);
  const [x2, y2] = on(angle, DIAL.r - 8);
  return `M ${x1} ${y1} L ${x2} ${y2}`;
};

export default function FeedbackVisual() {
  const { step } = useStage();
  const [history, setHistory] = useState<Belief[]>([START]);
  const playing = step >= 2;
  const mine = history[history.length - 1];
  const asked = playing ? mine : BELIEFS[step === 0 ? 0 : 4];
  const belief = playing ? mine : update(asked, honest(asked));
  const picked = playing ? null : honest(asked) ? 0 : 1;
  const pair = query(asked);
  const answers = playing ? history.length - 1 : step === 0 ? 1 : 5;

  const tweened = useTweened([belief.center, belief.half]);
  const arc = useTransform(tweened, ([c, h]) => arcPath(c, h));
  const estimate = useTransform(tweened, ([c]) => ray(c));

  const choose = (a: boolean) => setHistory((h) => [...h, update(h[h.length - 1], a)]);

  return (
    <Figure
      viewBox="0 0 460 236"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      interactive={playing}
      label="Two faces, A and B, and a dial of every direction a preference could point in. Each time a person picks one face over the other, half of the remaining directions become impossible. After five answers only a narrow arc is left, close to the hidden preference."
      controls={
        <>
          {PAIR.map((p, k) => (
            <Button key={p.name} onClick={() => choose(k === 0)} hidden={!playing}>
              {p.name}
            </Button>
          ))}
          <Button onClick={() => setHistory([START])} hidden={!playing || history.length === 1}>
            Start over
          </Button>
        </>
      }
    >
      {PAIR.map((p, k) => (
        <g key={p.name}>
          <Face look={decode(k === 0 ? pair.a : pair.b)} x={p.x} y={92} r={40} ring={picked === k ? K.violet : undefined} />
          <Label x={p.x} y={150} size={13} fill={picked === k ? K.violet : K.ink} weight={picked === k ? 600 : undefined}>
            {p.name}
          </Label>
        </g>
      ))}
      <Label x={122} y={186} size={11}>
        {playing ? "Which one is closer to what you want?" : "The person picks the face they prefer."}
      </Label>

      <circle cx={DIAL.x} cy={DIAL.y} r={DIAL.r} fill="none" stroke={K.faint} strokeWidth={6} />
      <motion.path d={arc} fill="none" stroke={K.violet} strokeWidth={6} strokeLinecap="round" />
      <motion.path d={estimate} stroke={K.violet} strokeWidth={2} strokeLinecap="round" opacity={answers > 0 ? 1 : 0} />
      <motion.g {...fade(!playing)}>
        <path d={ray(PREFERENCE)} stroke={K.rose} strokeWidth={1.75} strokeDasharray="4 4" />
        <Label x={on(PREFERENCE, DIAL.r + 14)[0]} y={on(PREFERENCE, DIAL.r + 14)[1]} size={10} fill={K.rose}>
          hidden preference
        </Label>
      </motion.g>
      <Face look={decode(polar(belief.center, answers > 0 ? 2.2 : 0))} x={DIAL.x} y={DIAL.y} r={24} />

      <Label x={DIAL.x - 40} y={DIAL.y + DIAL.r + 26} size={11}>
        answers
      </Label>
      <Num x={DIAL.x - 40} y={DIAL.y + DIAL.r + 42} value={answers} digits={0} size={12} />
      <Label x={DIAL.x + 40} y={DIAL.y + DIAL.r + 26} size={11}>
        uncertainty
      </Label>
      <Num x={DIAL.x + 40} y={DIAL.y + DIAL.r + 42} value={degrees(belief.half)} digits={0} prefix="±" suffix="°" size={12} fill={K.violet} />
    </Figure>
  );
}
