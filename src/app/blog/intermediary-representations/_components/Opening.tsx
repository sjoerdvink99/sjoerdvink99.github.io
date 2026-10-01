"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { C } from "@/components/blog/palette";
import { rand, round } from "@/components/blog/random";
import { Caption, useFade, type FadeRange } from "./captions";
import { ModelGlyph } from "./ModelGlyph";

const PROMPT = "Summarize what we know about remote work";
const WORDS = PROMPT.split(" ");

interface Frame {
  at: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Layout {
  frames: Frame[];
  model: { x: number; y: number };
  human: { x: number; y: number; anchor: "end" | "middle" };
  humanArrow: string;
  modelArrow: string;
  outputArrow: string;
  response: { x: number; y: number };
  modelLabel: { x: number; y: number };
  block: Rect;
  cone: [number, number, number, number][];
  far: { x: number; y: number; anchor: "end" | "middle" };
  near: {
    human: { x: number; y: number };
    model: { x: number; y: number };
    channel: [number, number, number, number];
    gap: { cx: number; cy: number; rx: number; ry: number };
  };
}

const LANDSCAPE: Layout = {
  frames: [
    { at: 0.16, cx: -50, cy: 20, w: 780, h: 360 },
    { at: 0.5, cx: 2550, cy: 200, w: 7100, h: 4300 },
    { at: 0.74, cx: 2550, cy: 200, w: 7100, h: 4300 },
    { at: 0.86, cx: -520, cy: 20, w: 1900, h: 900 },
  ],
  model: { x: 244, y: 0 },
  human: { x: -356, y: 1, anchor: "end" },
  humanArrow: "M-346 0 H-310 M-316 -5 L-310 0 L-316 5",
  modelArrow: "M150 0 H192 M186 -5 L192 0 L186 5",
  outputArrow: "M244 36 Q244 78 150 78 M156 73 L150 78 L156 83",
  response: { x: -300, y: 58 },
  modelLabel: { x: 244, y: -44 },
  block: { x: 700, y: -1400, w: 5200, h: 2800 },
  cone: [
    [288, -32, 700, -1260],
    [288, 32, 700, 1260],
  ],
  far: { x: -440, y: 40, anchor: "end" },
  near: {
    human: { x: -1290, y: 11 },
    model: { x: 244, y: 84 },
    channel: [-1270, 0, 196, 0],
    gap: { cx: -530, cy: 0, rx: 500, ry: 290 },
  },
};

const PORTRAIT: Layout = {
  frames: [
    { at: 0.16, cx: -80, cy: 90, w: 480, h: 440 },
    { at: 0.5, cx: -80, cy: 2560, w: 3300, h: 6800 },
    { at: 0.74, cx: -80, cy: 2560, w: 3300, h: 6800 },
    { at: 0.86, cx: -80, cy: -300, w: 900, h: 1900 },
  ],
  model: { x: -80, y: 116 },
  human: { x: -80, y: -62, anchor: "middle" },
  humanArrow: "M-80 -52 V-34 M-85 -40 L-80 -34 L-75 -40",
  modelArrow: "M-80 34 V78 M-85 72 L-80 78 L-75 72",
  outputArrow: "M-80 154 V188 M-85 182 L-80 188 L-75 182",
  response: { x: -300, y: 196 },
  modelLabel: { x: 20, y: 121 },
  block: { x: -1580, y: 600, w: 3000, h: 3800 },
  cone: [
    [-124, 148, -1440, 600],
    [-36, 148, 1280, 600],
  ],
  far: { x: -80, y: -300, anchor: "middle" },
  near: {
    human: { x: -80, y: -1110 },
    model: { x: -80, y: 200 },
    channel: [-80, -1080, -80, 78],
    gap: { cx: -80, cy: -500, rx: 290, ry: 430 },
  },
};

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

function camera(frames: Frame[], p: number, aspect: number) {
  const i = frames.findIndex((f) => p < f.at);
  const a = frames[Math.max(0, i === -1 ? frames.length - 1 : i - 1)];
  const b = frames[i === -1 ? frames.length - 1 : Math.max(0, i)];
  const t =
    a === b ? 1 : ease(Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at))));
  const fit = (f: Frame) => Math.max(f.w, f.h * aspect);
  const w = Math.exp(
    Math.log(fit(a)) + (Math.log(fit(b)) - Math.log(fit(a))) * t
  );
  const h = w / aspect;
  const cx = a.cx + (b.cx - a.cx) * t;
  const cy = a.cy + (b.cy - a.cy) * t;
  return `${round(cx - w / 2)} ${round(cy - h / 2)} ${round(w)} ${round(h)}`;
}

const SQ = 40;
const SQ_GAP = 5;
const DIMS = 6;
const VLEN = DIMS * (SQ + SQ_GAP) - SQ_GAP;

interface Plan {
  wordEnd: number;
  stages: { x: number; label: string; layer: boolean }[];
  ellipsis: number;
  rowTop: number;
  rowPitch: number;
  header: number;
  font: number;
  internal: { x: number; y: number };
  output: { x: number; y: number; labelX: number; labelY: number };
}

// Stages: embeddings, then three repeated layers with an ellipsis before the last.
function plan(b: Rect, portrait: boolean): Plan {
  if (portrait) {
    const rowTop = b.y + 760;
    const rowPitch = 300;
    return {
      wordEnd: b.x + 720,
      stages: [
        { x: b.x + 1000, label: "embeddings", layer: false },
        { x: b.x + 1500, label: "layer 1", layer: true },
        { x: b.x + 2080, label: "layer 2", layer: true },
        { x: b.x + 2640, label: "layer n", layer: true },
      ],
      ellipsis: b.x + 2370,
      rowTop,
      rowPitch,
      header: b.y + 620,
      font: 90,
      internal: { x: b.x + 2560, y: rowTop + WORDS.length * rowPitch + 250 },
      output: { x: b.x + 2640, y: b.y + b.h - 260, labelX: b.x + 2360, labelY: b.y + b.h - 260 },
    };
  }
  const rowTop = b.y + 760;
  const rowPitch = 266;
  return {
    wordEnd: b.x + 900,
    stages: [
      { x: b.x + 1250, label: "embeddings", layer: false },
      { x: b.x + 1900, label: "layer 1", layer: true },
      { x: b.x + 2650, label: "layer 2", layer: true },
      { x: b.x + 3450, label: "layer n", layer: true },
    ],
    ellipsis: b.x + 3050,
    rowTop,
    rowPitch,
    header: b.y + 620,
    font: 90,
    internal: { x: b.x + 3450, y: rowTop + WORDS.length * rowPitch + 120 },
    output: {
      x: b.x + 4150,
      y: rowTop + (WORDS.length - 0.5) * rowPitch,
      labelX: b.x + 4150,
      labelY: b.y + 620,
    },
  };
}

const rowY = (pl: Plan, token: number) => round(pl.rowTop + (token + 0.5) * pl.rowPitch);

// Later layers mix information across tokens, so their rows look more alike.
const MIX = [0, 0.35, 0.55, 0.75];

function buildModel(layout: Layout, portrait: boolean) {
  const pl = plan(layout.block, portrait);
  const squares: { x: number; y: number; o: number }[] = [];
  const links: [number, number, number, number, number][] = [];
  pl.stages.forEach((stage, s) =>
    WORDS.forEach((_, i) => {
      const y = rowY(pl, i);
      for (let d = 0; d < DIMS; d++) {
        const own = rand(i * 97 + d * 7 + s * 3);
        const shared = rand(d * 31 + s * 101);
        const v = (1 - MIX[s]) * own + MIX[s] * shared;
        squares.push({
          x: round(stage.x - VLEN / 2 + d * (SQ + SQ_GAP)),
          y: y - SQ / 2,
          o: round(0.15 + v * 0.75),
        });
      }
    })
  );
  // Every token mixes in a few earlier tokens. The last token is drawn separately below.
  for (let s = 0; s < 2; s++) {
    const from = pl.stages[s];
    const to = pl.stages[s + 1];
    WORDS.forEach((_, i) => {
      for (const j of new Set([i, Math.max(0, i - 1), Math.floor(rand(i * 7 + s) * (i + 1))]))
        links.push([from.x + VLEN / 2 + 20, rowY(pl, j), to.x - VLEN / 2 - 20, rowY(pl, i), i]);
    });
  }
  return { pl, squares, links };
}

// How strongly the last word attends to each word, in layer 1 and layer 2.
const ATTENTION = [
  [0.3, 0.04, 0.04, 0.08, 0.1, 0.26, 0.18],
  [0.42, 0.03, 0.03, 0.06, 0.06, 0.2, 0.2],
];
const QUERY = WORDS.length - 1;

const MODELS = {
  landscape: buildModel(LANDSCAPE, false),
  portrait: buildModel(PORTRAIT, true),
};

function ModelInterior({ layout, portrait }: { layout: Layout; portrait: boolean }) {
  const b = layout.block;
  const { pl, squares, links } = portrait ? MODELS.portrait : MODELS.landscape;
  const last = rowY(pl, WORDS.length - 1);
  const top = pl.rowTop - 70;
  const bottom = pl.rowTop + WORDS.length * pl.rowPitch + 30;
  const lastStage = pl.stages[pl.stages.length - 1];
  const stroke = { strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };
  return (
    <g>
      <g stroke={C.space} strokeDasharray="6 8">
        {layout.cone.map(([x1, y1, x2, y2]) => (
          <line key={`${x1}${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} />
        ))}
      </g>
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={140}
        fill="#fff"
        stroke={C.space}
        strokeWidth={1.25}
        vectorEffect="non-scaling-stroke"
      />
      <text x={b.x + 160} y={b.y + 250} fontSize={150} letterSpacing={20} fill={C.ink}>
        INSIDE THE MODEL
      </text>
      <text x={b.x + 160} y={b.y + 410} fontSize={95} fill={C.muted}>
        Representations are transformed layer by layer
      </text>

      {pl.stages
        .filter((st) => st.layer)
        .map((st) => (
          <rect
            key={st.label}
            x={st.x - VLEN / 2 - 70}
            y={top}
            width={VLEN + 140}
            height={bottom - top}
            rx={50}
            fill={C.spaceSoft}
            stroke={C.space}
            strokeOpacity={0.6}
            {...stroke}
          />
        ))}

      <g stroke={C.ink} strokeOpacity={0.12}>
        {links
          .filter(([, , , , i]) => i !== QUERY)
          .map(([x1, y1, x2, y2], k) => (
            <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} />
          ))}
        {WORDS.map((_, i) => (
          <line
            key={i}
            x1={pl.wordEnd + 50}
            y1={rowY(pl, i)}
            x2={pl.stages[0].x - VLEN / 2 - 30}
            y2={rowY(pl, i)}
            {...stroke}
          />
        ))}
      </g>

      <g fill={C.space}>
        {squares.map((q, k) => (
          <rect key={k} x={q.x} y={q.y} width={SQ} height={SQ} rx={6} opacity={q.o} />
        ))}
      </g>

      <g fill="none" stroke={C.transform} strokeLinecap="round">
        {ATTENTION.map((weights, s) => {
          const x1 = pl.stages[s].x + VLEN / 2 + 20;
          const x2 = pl.stages[s + 1].x - VLEN / 2 - 20;
          const mid = (x1 + x2) / 2;
          const yq = rowY(pl, QUERY);
          return weights.map((w, j) => {
            const yj = rowY(pl, j);
            return (
              <path
                key={`${s}-${j}`}
                d={`M ${x1} ${yj} C ${mid} ${yj}, ${mid} ${yq}, ${x2} ${yq}`}
                strokeWidth={0.75 + w * 9}
                strokeOpacity={0.35 + w * 1.5}
                vectorEffect="non-scaling-stroke"
              />
            );
          });
        })}
        {pl.stages.slice(1).map((st) => (
          <rect
            key={st.label}
            x={st.x - VLEN / 2 - 16}
            y={rowY(pl, QUERY) - SQ / 2 - 16}
            width={VLEN + 32}
            height={SQ + 32}
            rx={16}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      <g fontSize={pl.font} fill={C.transformInk} textAnchor="middle">
        {ATTENTION.map((_, s) => (
          <text
            key={s}
            x={(pl.stages[s].x + pl.stages[s + 1].x) / 2}
            y={bottom + (portrait ? 70 : 90)}
          >
            attention
          </text>
        ))}
      </g>

      <text
        x={pl.ellipsis}
        y={(top + bottom) / 2}
        fontSize={140}
        fill={C.muted}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        ⋯
      </text>

      <g fontSize={portrait ? 100 : 110} fill={C.ink}>
        {WORDS.map((w, i) => (
          <text key={w} x={pl.wordEnd} y={rowY(pl, i)} textAnchor="end" dominantBaseline="middle">
            {w}
          </text>
        ))}
      </g>

      <g fontSize={pl.font} fill={C.muted} textAnchor="middle">
        <text x={pl.wordEnd - 250} y={pl.header}>
          tokens
        </text>
        {pl.stages.map((st) => (
          <text key={st.label} x={st.x} y={pl.header}>
            {st.label}
          </text>
        ))}
        <text
          x={pl.internal.x}
          y={pl.internal.y}
          fill={C.ink}
          textAnchor={portrait ? "end" : "middle"}
        >
          internal representation
        </text>
        {!portrait && (
          <text x={pl.output.labelX} y={pl.output.labelY}>
            output
          </text>
        )}
      </g>

      <g stroke={C.ink} strokeOpacity={0.5} fill="none" {...stroke}>
        {portrait ? (
          <path
            d={`M ${lastStage.x} ${bottom + 20} V ${pl.output.y - 110} M ${lastStage.x - 30} ${pl.output.y - 150} L ${lastStage.x} ${pl.output.y - 110} L ${lastStage.x + 30} ${pl.output.y - 150}`}
            {...stroke}
          />
        ) : (
          <path
            d={`M ${lastStage.x + VLEN / 2 + 110} ${last} H ${pl.output.x - 230} M ${pl.output.x - 270} ${last - 30} L ${pl.output.x - 230} ${last} L ${pl.output.x - 270} ${last + 30}`}
            {...stroke}
          />
        )}
      </g>
      <rect
        x={pl.output.x - 200}
        y={pl.output.y - 90}
        width={400}
        height={180}
        rx={90}
        fill="#f3f4f6"
      />
      <text
        x={pl.output.x}
        y={pl.output.y}
        fontSize={110}
        fill={C.ink}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        Here
      </text>
      {portrait && (
        <text
          x={pl.output.labelX}
          y={pl.output.labelY}
          fontSize={pl.font}
          fill={C.muted}
          textAnchor="end"
          dominantBaseline="middle"
        >
          output
        </text>
      )}
    </g>
  );
}

const CAPTIONS: { range: FadeRange; text: string }[] = [
  {
    range: [0.0, 0.03, 0.13, 0.17],
    text: "Most interaction with AI today looks like this.",
  },
  {
    range: [0.28, 0.32, 0.44, 0.48],
    text: "Inside the model, words become vectors. In every layer, attention lets each word draw on the words before it, and the vectors change.",
  },
  {
    range: [0.48, 0.52, 0.6, 0.63],
    text: "These high-dimensional representations are useful to the model. They are not necessarily useful as something people can work with.",
  },
  {
    range: [0.63, 0.66, 0.74, 0.77],
    text: "A text box is remarkably general. But it offers one representation, text, and one action, sending a message.",
  },
  {
    range: [0.82, 0.86],
    text: "What should exist between the human and the model?",
  },
];

function Fade({
  opacity,
  children,
}: {
  opacity: MotionValue<number>;
  children: React.ReactNode;
}) {
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

export default function Opening() {
  const ref = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const aspect = useRef(1.6);
  const [portrait, setPortrait] = useState(false);
  const [typed, setTyped] = useState(0);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const layout = portrait ? PORTRAIT : LANDSCAPE;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const resize = () => {
      aspect.current = svg.clientWidth / Math.max(1, svg.clientHeight);
      setPortrait(aspect.current < 0.9);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const draw = () =>
      svgRef.current?.setAttribute(
        "viewBox",
        camera(layout.frames, p.get(), aspect.current)
      );
    draw();
    return p.on("change", draw);
  }, [layout, p]);

  useMotionValueEvent(p, "change", (v) => {
    setTyped(Math.round(Math.min(1, Math.max(0, v / 0.1)) * PROMPT.length));
  });

  const chat = useFade(p, [0.06, 0.1, 0.22, 0.3]);
  const interior = useFade(p, [0.18, 0.34, 0.76, 0.82]);
  const box = useTransform(p, [0.74, 0.8], [1, 0]);
  const far = useFade(p, [0.32, 0.4, 0.74, 0.78]);
  const near = useFade(p, [0.8, 0.85]);
  const gap = useFade(p, [0.84, 0.9]);

  const { near: n } = layout;

  return (
    <section
      ref={ref}
      className="relative h-[700vh]"
      aria-label="Opening. From a text box to the question of what lies between human and model."
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="-440 -160 780 360"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <Fade opacity={interior}>
            <ModelInterior layout={layout} portrait={portrait} />
          </Fade>

          <Fade opacity={gap}>
            <ellipse
              cx={n.gap.cx}
              cy={n.gap.cy}
              rx={n.gap.rx}
              ry={n.gap.ry}
              fill="none"
              stroke={C.space}
              strokeWidth={1.25}
              strokeDasharray="5 7"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={n.gap.cx + (portrait ? 70 : 0)}
              y={n.gap.cy - (portrait ? 0 : 70)}
              fontSize={72}
              fontWeight={300}
              fill={C.muted}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              ?
            </text>
          </Fade>

          <Fade opacity={near}>
            <line
              x1={n.channel[0]}
              y1={n.channel[1]}
              x2={n.channel[2]}
              y2={n.channel[3]}
              stroke={C.ink}
              strokeOpacity={0.5}
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={n.human.x}
              y={n.human.y}
              fontSize={34}
              fill={C.ink}
              textAnchor={portrait ? "middle" : "end"}
            >
              Human
            </text>
            <text
              x={n.model.x}
              y={n.model.y}
              fontSize={30}
              fill={C.ink}
              textAnchor="middle"
            >
              AI model
            </text>
          </Fade>

          <Fade opacity={box}>
            <rect
              x={-300}
              y={-28}
              width={440}
              height={56}
              rx={28}
              fill="#fff"
              stroke={C.faint}
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={-272}
              y={1}
              fontSize={17}
              fill={typed ? C.ink : C.muted}
              dominantBaseline="middle"
            >
              {typed ? PROMPT.slice(0, typed) : "Ask anything"}
            </text>
            <circle cx={112} cy={0} r={15} fill={C.ink} />
            <path
              d="M106 1 L112 -5 L118 1 M112 -5 L112 6"
              stroke="#fff"
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
            />
          </Fade>

          <ModelGlyph x={layout.model.x} y={layout.model.y} />

          <Fade opacity={chat}>
            <text
              x={layout.human.x}
              y={layout.human.y}
              textAnchor={layout.human.anchor}
              dominantBaseline="middle"
              fontSize={15}
              fill={C.muted}
            >
              Human
            </text>
            <text
              x={layout.modelLabel.x}
              y={layout.modelLabel.y}
              textAnchor={portrait ? "start" : "middle"}
              fontSize={14}
              fill={C.muted}
            >
              AI model
            </text>
            <g
              stroke={C.muted}
              strokeWidth={1.25}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={layout.humanArrow} />
              <path d={layout.modelArrow} />
              <path d={layout.outputArrow} />
            </g>
            <rect
              x={layout.response.x}
              y={layout.response.y}
              width={440}
              height={40}
              rx={20}
              fill="#f3f4f6"
            />
            <text
              x={layout.response.x + 24}
              y={layout.response.y + 21}
              dominantBaseline="middle"
              fill={C.ink}
              fontSize={15}
            >
              Here is a summary of recent studies…
            </text>
          </Fade>

          <Fade opacity={far}>
            <text
              x={layout.far.x}
              y={layout.far.y}
              fontSize={150}
              fill={C.muted}
              textAnchor={layout.far.anchor}
            >
              Human
            </text>
          </Fade>
        </svg>

        <div className="pointer-events-none absolute inset-x-0 bottom-[8vh] grid">
          {CAPTIONS.map((c) => (
            <Caption key={c.text} p={p} range={c.range}>
              {c.text}
            </Caption>
          ))}
        </div>
      </div>
    </section>
  );
}
