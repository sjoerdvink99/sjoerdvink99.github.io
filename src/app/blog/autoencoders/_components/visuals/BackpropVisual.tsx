"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { AFTER_ONE_STEP, GRAD, LOSS0, LR, fmt, fmtVec } from "../model";
import { Figure, K, Label, Sym, fade, useMotion } from "../svg";

const CODE = `dL_dx_hat = x_hat - x
dL_dW_decoder = np.outer(z, dL_dx_hat)
dL_db_decoder = dL_dx_hat
dL_dz = dL_dx_hat @ W_decoder.T
dL_dW_encoder = np.outer(x, dL_dz)
dL_db_encoder = dL_dz

W_encoder -= lr * dL_dW_encoder`;

const FOCUS: Focus[][] = [[], [0], [1, 2], [3], [4, 5], [7]];

const Y = 104;
const NODES = {
  x: { x: 30, name: "x" },
  z: { x: 206, name: "z" },
  xhat: { x: 346, name: "x" },
  L: { x: 414, name: "L" },
};
const OPS = { enc: 118, dec: 276 };
const PARAMS = [
  { id: "Wenc", x: 96, op: OPS.enc, name: "W", sub: "enc" },
  { id: "benc", x: 140, op: OPS.enc, name: "b", sub: "enc" },
  { id: "Wdec", x: 254, op: OPS.dec, name: "W", sub: "dec" },
  { id: "bdec", x: 298, op: OPS.dec, name: "b", sub: "dec" },
];

const REACHED: Record<string, number> = {
  L: 1,
  xhat: 1,
  dec: 2,
  Wdec: 2,
  bdec: 2,
  z: 3,
  enc: 4,
  Wenc: 4,
  benc: 4,
};

function Edge({
  d,
  back,
  delay = 0,
}: {
  d: string;
  back: boolean;
  delay?: number;
}) {
  const motionFor = useMotion();
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke="#d1d5db" strokeWidth={1.25} />
      <motion.path
        d={d}
        stroke={K.grad}
        strokeWidth={2.25}
        initial={false}
        animate={{ pathLength: back ? 1 : 0, opacity: back ? 1 : 0 }}
        transition={motionFor.draw(back ? delay : 0)}
      />
    </g>
  );
}

export default function BackpropVisual({ labels }: { labels: ReactNode[] }) {
  const { step } = useStage();
  const on = (id: string) => step >= REACHED[id];
  const updated = step >= 5;

  const rows = [
    { at: 1, value: fmtVec(GRAD.dXhat) },
    { at: 2, value: `[${fmtVec(GRAD.dWDec, 2)}]` },
    { at: 2, value: fmtVec(GRAD.dBDec) },
    { at: 3, value: fmt(GRAD.dZ) },
    { at: 4, value: `[[${fmt(GRAD.dWEnc[0])}], [${fmt(GRAD.dWEnc[1])}]]` },
    { at: 4, value: `[${fmt(GRAD.dBEnc)}]` },
  ];

  const node = (id: keyof typeof NODES) => {
    const n = NODES[id];
    const lit = id !== "x" && on(id);
    return (
      <g key={id}>
        <motion.circle
          cx={n.x}
          cy={Y}
          r={17}
          initial={false}
          animate={{
            stroke: lit ? K.grad : "#9ca3af",
            fill: lit ? K.gradSoft : "#fff",
          }}
          transition={{ duration: 0.5 }}
          strokeWidth={1.25}
        />
        <Sym
          x={n.x}
          y={Y}
          size={16}
          hat={id === "xhat"}
          fill={id === "z" ? K.z : K.x}
        >
          {n.name}
        </Sym>
      </g>
    );
  };

  return (
    <Figure
      viewBox="0 0 440 136"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A computational graph from x through the encoder to z, through the decoder to x-hat, and on to the loss. The gradient travels backward from the loss to every weight."
      controls={
        <dl className="grid w-full grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1.5 text-sm">
          {rows.map((r, i) => {
            const shown = step >= r.at;
            const cls = `transition-opacity duration-500 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`;
            return (
              <div
                key={i}
                className="contents"
                aria-hidden={!shown || undefined}
              >
                <dt className={`text-right ${cls}`}>{labels[i]}</dt>
                <dd
                  className={`font-mono text-[12.5px] tabular-nums text-ir-human ${cls}`}
                >
                  {r.value}
                </dd>
              </div>
            );
          })}
          <div className="contents" aria-hidden={!updated || undefined}>
            <dt
              className={`pt-2 text-right text-ir-ink-muted transition-opacity duration-500 ${updated ? "opacity-100" : "opacity-0"}`}
            >
              {`one update, lr = ${LR}`}
            </dt>
            <dd
              className={`pt-2 font-mono text-[12.5px] tabular-nums text-ir-ink transition-opacity duration-500 ${updated ? "opacity-100" : "opacity-0"}`}
            >
              {`loss ${fmt(LOSS0, 2)} → ${fmt(AFTER_ONE_STEP.loss, 2)}`}
            </dd>
          </div>
        </dl>
      }
    >
      <Edge d={`M ${NODES.x.x + 17} ${Y} H ${OPS.enc - 20}`} back={false} />
      <Edge
        d={`M ${NODES.z.x - 17} ${Y} H ${OPS.enc + 20}`}
        back={on("enc")}
        delay={0.1}
      />
      <Edge d={`M ${OPS.dec - 20} ${Y} H ${NODES.z.x + 17}`} back={on("z")} />
      <Edge
        d={`M ${NODES.xhat.x - 17} ${Y} H ${OPS.dec + 20}`}
        back={on("dec")}
      />
      <Edge
        d={`M ${NODES.L.x - 17} ${Y} H ${NODES.xhat.x + 17}`}
        back={on("xhat")}
      />
      {PARAMS.map((p) => (
        <Edge
          key={p.id}
          d={`M ${p.op + (p.x < p.op ? -8 : 8)} ${Y - 14} L ${p.x} ${40}`}
          back={on(p.id)}
          delay={0.35}
        />
      ))}

      {(["enc", "dec"] as const).map((id) => (
        <g key={id}>
          <motion.rect
            x={OPS[id] - 20}
            y={Y - 14}
            width={40}
            height={28}
            rx={6}
            strokeWidth={1.25}
            initial={false}
            animate={{
              stroke: on(id) ? K.grad : K.op,
              fill: on(id) ? K.gradSoft : K.opSoft,
            }}
            transition={{ duration: 0.5 }}
          />
          <Label x={OPS[id]} y={Y} size={11} fill={K.opInk}>
            {id}
          </Label>
        </g>
      ))}

      {PARAMS.map((p) => (
        <g key={p.id}>
          <motion.rect
            x={p.x - 19}
            y={10}
            width={38}
            height={30}
            rx={6}
            strokeWidth={1.25}
            initial={false}
            animate={{
              stroke: on(p.id) ? K.grad : K.op,
              fill: updated ? K.opSoft : on(p.id) ? K.gradSoft : "#fff",
            }}
            transition={{ duration: 0.5 }}
          />
          <Sym x={p.x} y={25} size={15} sub={p.sub} fill={K.opInk}>
            {p.name}
          </Sym>
        </g>
      ))}

      {(Object.keys(NODES) as (keyof typeof NODES)[]).map(node)}

      <motion.g {...fade(step === 0)}>
        <Label x={220} y={Y + 30} size={11} fill={K.muted}>
          forward: every value is known
        </Label>
      </motion.g>
      <motion.g {...fade(step >= 1 && step <= 4)}>
        <Label x={220} y={Y + 30} size={11} fill={K.grad}>
          backward: from the loss toward the input
        </Label>
      </motion.g>
      <motion.g {...fade(updated)}>
        <Label x={220} y={Y + 30} size={11} fill={K.opInk}>
          every weight moves against its gradient
        </Label>
      </motion.g>
    </Figure>
  );
}
