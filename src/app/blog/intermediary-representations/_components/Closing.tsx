"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { C } from "@/components/blog/palette";
import { rand, round } from "@/components/blog/random";
import { TransformArrow } from "@/components/blog/TransformArrow";
import { Caption, type FadeRange } from "./captions";
import { ModelGlyph } from "./ModelGlyph";

const X = [90, 230, 370, 510];
const HUMAN_Y = 34;
const FORM_Y = 128;
const FRAME = { y: 226, w: 116, h: 92 };
const MODEL_Y = 486;

const PHASES = [0.16, 0.42, 0.66, 0.86];

const CAPTIONS: { range: FadeRange; text: ReactNode; className?: string }[] = [
  {
    range: [0.0, 0.03, 0.12, 0.16],
    text: "We started with a single text box between a human and a model.",
  },
  {
    range: [0.2, 0.24, 0.36, 0.4],
    text: "Opened up, that box becomes a set of design choices.",
  },
  {
    range: [0.44, 0.48, 0.6, 0.64],
    text: (
      <>
        <span className="text-ir-space-ink">Spaces</span> define what can be
        expressed. <span className="text-ir-rep">Representations</span> are the
        states people and models work with.{" "}
        <span className="text-ir-transform-ink">Transformations</span> connect
        them. <span className="text-ir-human">Interaction</span> lets people
        change both.
      </>
    ),
    className: "md:!text-[1.35rem]",
  },
  {
    range: [0.67, 0.71, 0.81, 0.85],
    text: "The question is not only what AI can do. It is what humans and AI should be able to work through together.",
  },
  {
    range: [0.87, 0.91],
    text: "The space between human and AI is a design space.",
    className: "md:!text-[2rem]",
  },
];

function Form({ kind }: { kind: number }) {
  const stroke = {
    stroke: C.human,
    strokeWidth: 1.5,
    fill: "none",
    strokeLinecap: "round" as const,
  };
  if (kind === 0)
    return (
      <g>
        <rect
          x={-32}
          y={-13}
          width={64}
          height={26}
          rx={13}
          fill="#fff"
          stroke={C.human}
          strokeWidth={1.5}
        />
        <line x1={-18} y1={-6} x2={-18} y2={6} {...stroke} />
      </g>
    );
  if (kind === 1)
    return (
      <path
        d="M-26 6 q 13 -16 26 -4 t 26 -6"
        {...stroke}
        strokeWidth={8}
        strokeOpacity={0.45}
      />
    );
  if (kind === 2)
    return (
      <g>
        <line x1={-28} y1={0} x2={28} y2={0} stroke={C.faint} strokeWidth={2} />
        <circle cx={10} cy={0} r={6} fill={C.human} />
      </g>
    );
  return (
    <g>
      <line x1={-20} y1={5} x2={20} y2={-5} {...stroke} />
      <circle
        cx={-20}
        cy={5}
        r={5}
        fill="#fff"
        stroke={C.human}
        strokeWidth={1.5}
      />
      <circle
        cx={20}
        cy={-5}
        r={5}
        fill="#fff"
        stroke={C.human}
        strokeWidth={1.5}
      />
    </g>
  );
}

const FORMS = ["type", "brush", "drag", "connect"];
const SPACES = ["text space", "image space", "graph space", "latent space"];

const TEXT_ROWS = Array.from({ length: 4 }, (_, r) => {
  let x = -46;
  return Array.from({ length: 4 }, (_, c) => {
    const w = round(12 + rand(r * 9 + c + 400) * 12);
    const bar = { x: round(x), y: -30 + r * 18, w };
    x += w + 5;
    return bar;
  });
});

const DOTS = Array.from({ length: 26 }, (_, i) => ({
  x: round((rand(i + 700) - 0.5) * 96),
  y: round((rand(i + 900) - 0.5) * 70),
}));

const MOTIF = [
  [0, -12],
  [-10, 6],
  [10, 8],
  [0, 18],
];

function Representation({ kind }: { kind: number }) {
  if (kind === 0)
    return (
      <g>
        {TEXT_ROWS.flatMap((row, r) =>
          row.map((b, c) => (
            <rect
              key={`${r}-${c}`}
              x={b.x}
              y={b.y}
              width={b.w}
              height={5}
              rx={2.5}
              fill={r === 1 ? C.rep : C.space}
              opacity={r === 1 ? 1 : 0.45}
            />
          ))
        )}
      </g>
    );
  if (kind === 1)
    return (
      <g>
        {Array.from({ length: 6 }, (_, t) => {
          const x = -48 + (t % 3) * 34;
          const y = -32 + Math.floor(t / 3) * 34;
          const on = t === 4;
          const color = on ? C.rep : C.space;
          return (
            <g key={t} opacity={on ? 1 : 0.45}>
              <rect
                x={x}
                y={y}
                width={28}
                height={28}
                rx={3}
                fill={on ? C.repSoft : C.spaceSoft}
                stroke={color}
                strokeWidth={on ? 1.25 : 0}
              />
              <rect
                x={x}
                y={y + 21}
                width={28}
                height={7}
                rx={1.5}
                fill={color}
                opacity={0.6}
              />
              <circle
                cx={x + 8 + rand(t + 50) * 12}
                cy={y + 10}
                r={4}
                fill={color}
              />
            </g>
          );
        })}
      </g>
    );
  if (kind === 2)
    return (
      <g>
        {[-34, 0, 34].map((ox, m) => {
          const color = m === 1 ? C.rep : C.space;
          const pts = MOTIF.map(([x, y]) => [
            ox + x * (m === 1 ? 1.2 : 0.8),
            y * (m === 1 ? 1.2 : 0.8),
          ]);
          return (
            <g key={m} opacity={m === 1 ? 1 : 0.45}>
              {[
                [0, 1],
                [0, 2],
                [1, 3],
                [2, 3],
              ].map(([a, b]) => (
                <line
                  key={`${a}${b}`}
                  x1={pts[a][0]}
                  y1={pts[a][1]}
                  x2={pts[b][0]}
                  y2={pts[b][1]}
                  stroke={color}
                  strokeWidth={1.25}
                />
              ))}
              {pts.map(([x, y], k) => (
                <circle key={k} cx={x} cy={y} r={3} fill={color} />
              ))}
            </g>
          );
        })}
      </g>
    );
  return (
    <g>
      {DOTS.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={2} fill={C.space} opacity={0.55} />
      ))}
      <circle cx={14} cy={-6} r={12} fill={C.rep} opacity={0.14} />
      <circle cx={14} cy={-6} r={5} fill={C.rep} />
    </g>
  );
}

function ConceptLabel({
  y,
  show,
  delay,
  color,
  children,
}: {
  y: number;
  show: boolean;
  delay: number;
  color: string;
  children: ReactNode;
}) {
  return (
    <motion.text
      x={612}
      y={y}
      fill={color}
      fontSize={12}
      fontWeight={500}
      letterSpacing="0.16em"
      dominantBaseline="middle"
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.6, delay: show ? delay : 0 }}
    >
      {children}
    </motion.text>
  );
}

export default function Closing() {
  const ref = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);
  const [wide, setWide] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const phaseOf = (v: number) => PHASES.filter((t) => v >= t).length;
  useMotionValueEvent(p, "change", (v) => setPhase(phaseOf(v)));
  useEffect(() => {
    const id = requestAnimationFrame(() => setPhase(phaseOf(p.get())));
    return () => cancelAnimationFrame(id);
  }, [p]);

  const open = phase >= 1;
  const small = wide ? 12 : 15;
  const large = wide ? 16 : 20;
  const named = phase >= 2;
  const fade = (show: boolean, delay = 0) => ({
    initial: false as const,
    animate: { opacity: show ? 1 : 0 },
    transition: { duration: 0.6, delay: show ? delay : 0 },
  });

  return (
    <section
      ref={ref}
      className="relative h-[520vh]"
      aria-label="Closing. The space between human and AI."
    >
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="min-h-0 flex-1 px-4 pt-[6vh]">
          <svg
            viewBox={wide ? "-40 0 800 560" : "0 0 600 560"}
            className="mx-auto block h-full w-full max-w-4xl"
            aria-hidden
          >
            <text
              x={300}
              y={HUMAN_Y}
              textAnchor="middle"
              fontSize={large}
              fill={C.muted}
            >
              Human
            </text>

            <motion.line
              x1={300}
              y1={HUMAN_Y + 12}
              x2={300}
              y2={FORM_Y - 16}
              stroke={C.muted}
              strokeWidth={1.25}
              {...fade(!open)}
            />
            <motion.line
              x1={300}
              y1={FORM_Y + 16}
              x2={300}
              y2={MODEL_Y - 40}
              stroke={C.muted}
              strokeWidth={1.25}
              {...fade(!open)}
            />

            {X.map((x, i) => (
              <motion.g key={`h${i}`} {...fade(open, 0.25 + i * 0.08)}>
                <line
                  x1={300}
                  y1={HUMAN_Y + 12}
                  x2={x}
                  y2={FORM_Y - 18}
                  stroke={C.human}
                  strokeOpacity={0.5}
                  strokeWidth={1}
                />
                <line
                  x1={x}
                  y1={FORM_Y + 40}
                  x2={x}
                  y2={FRAME.y - 6}
                  stroke={C.human}
                  strokeOpacity={0.6}
                  strokeWidth={1.25}
                  strokeDasharray="3 4"
                />
              </motion.g>
            ))}

            {X.map((x, i) => (
              <motion.g
                key={FORMS[i]}
                initial={false}
                animate={{
                  x: i === 0 && !open ? 300 : x,
                  opacity: i === 0 || open ? 1 : 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: open && i > 0 ? 0.1 + i * 0.1 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <g transform={`translate(0 ${FORM_Y})`}>
                  <Form kind={i} />
                  <motion.text
                    y={34}
                    textAnchor="middle"
                    fontSize={small}
                    fill={C.human}
                    {...fade(open, 0.4)}
                  >
                    {FORMS[i]}
                  </motion.text>
                </g>
              </motion.g>
            ))}

            {X.map((x, i) => (
              <motion.g key={SPACES[i]} {...fade(open, 0.35 + i * 0.1)}>
                <rect
                  x={x - FRAME.w / 2}
                  y={FRAME.y}
                  width={FRAME.w}
                  height={FRAME.h}
                  rx={12}
                  fill="#fff"
                  stroke={C.space}
                  strokeWidth={1.25}
                />
                <g transform={`translate(${x} ${FRAME.y + FRAME.h / 2})`}>
                  <Representation kind={i} />
                </g>
                <text
                  x={x}
                  y={FRAME.y + FRAME.h + 20}
                  textAnchor="middle"
                  fontSize={small}
                  fill={C.spaceInk}
                >
                  {SPACES[i]}
                </text>
              </motion.g>
            ))}

            {X.slice(0, -1).map((x, i) => (
              <TransformArrow
                key={`t${i}`}
                from={[x + FRAME.w / 2 + 4, FRAME.y + FRAME.h / 2]}
                to={[X[i + 1] - FRAME.w / 2 - 4, FRAME.y + FRAME.h / 2]}
                visible={open}
                delay={0.8 + i * 0.1}
                head={5}
              />
            ))}
            {X.map((x, i) => (
              <TransformArrow
                key={`d${i}`}
                from={[x, FRAME.y + FRAME.h + 32]}
                to={[300 + (i - 1.5) * 18, MODEL_Y - 42]}
                bend={(i - 1.5) * 10}
                visible={open}
                delay={1 + i * 0.08}
                head={6}
              />
            ))}

            <ModelGlyph x={300} y={MODEL_Y} label="AI model" labelSize={large} />

            {wide && (
              <>
                <ConceptLabel y={FORM_Y} show={named} delay={0} color={C.human}>
                  INTERACTION
                </ConceptLabel>
                <ConceptLabel y={FRAME.y + 16} show={named} delay={0.2} color={C.spaceInk}>
                  SPACE
                </ConceptLabel>
                <ConceptLabel y={FRAME.y + FRAME.h / 2 + 4} show={named} delay={0.3} color={C.rep}>
                  REPRESENTATION
                </ConceptLabel>
                <ConceptLabel
                  y={(FRAME.y + FRAME.h + MODEL_Y) / 2}
                  show={named}
                  delay={0.45}
                  color={C.transformInk}
                >
                  TRANSFORMATION
                </ConceptLabel>
              </>
            )}
          </svg>
        </div>
        <div className="pointer-events-none grid h-[24vh] place-items-center pb-[4vh]">
          {CAPTIONS.map((c, i) => (
            <Caption key={i} p={p} range={c.range} className={c.className}>
              {c.text}
            </Caption>
          ))}
        </div>
      </div>
    </section>
  );
}
