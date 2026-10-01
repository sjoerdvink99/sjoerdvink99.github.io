"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ScrollStage, Step, useStage } from "@/components/blog/ScrollStage";
import { Space, SPACE_H, SPACE_W, stateCenter } from "@/components/blog/Space";
import { StateMarker } from "@/components/blog/StateMarker";
import { TransformArrow } from "@/components/blog/TransformArrow";
import { Morph } from "@/components/blog/Morph";
import { Eq } from "@/components/blog/Eq";
import { Tag } from "@/components/blog/Tag";
import { C } from "@/components/blog/palette";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { DogScene } from "./DogScene";
import { Formula, SceneGraph, VECTOR, formatVector } from "./reps";
import { ChapterLabel } from "./chapters";

const REPS = [
  {
    id: "text",
    name: "Language",
    space: "text space",
    ops: ["type", "rewrite", "select", "structure"],
  },
  {
    id: "image",
    name: "Image",
    space: "image space",
    ops: ["point", "brush", "crop", "annotate"],
  },
  {
    id: "graph",
    name: "Graph",
    space: "graph space",
    ops: ["select node", "connect", "trace path"],
  },
  {
    id: "latent",
    name: "Embedding",
    space: "latent space",
    ops: ["drag", "interpolate", "follow direction"],
  },
  {
    id: "formal",
    name: "Formal",
    space: "space of logical formulas",
    ops: ["constrain", "compose", "verify"],
  },
] as const;

type RepId = (typeof REPS)[number]["id"];

const S_INDEX = 38;

const draw = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: { duration: 0.7, ease: "easeInOut" },
} as const;

const PARTS = [
  ["A dog", "agent"],
  ["carries", "action"],
  ["a stick", "object"],
  ["across the lawn.", "path"],
];

function TextRep({ op }: { op: string | null }) {
  if (op === "structure")
    return (
      <p className="flex flex-wrap gap-x-3 gap-y-3 font-math text-[1.45rem] leading-snug text-ir-ink">
        {PARTS.map(([text, role]) => (
          <motion.span
            key={text}
            className="inline-flex flex-col"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
          >
            <span className="border-b border-ir-human pb-0.5">{text}</span>
            <span className="mt-1 font-sans text-xs text-ir-human">{role}</span>
          </motion.span>
        ))}
      </p>
    );
  const word = op === "rewrite" ? "fetches" : "carries";
  return (
    <p className="font-math text-[1.45rem] leading-snug text-ir-ink">
      A dog{" "}
      <span className={op === "rewrite" ? "text-ir-human" : ""}>{word}</span> a{" "}
      <span
        className={`rounded-sm px-0.5 transition-colors ${op === "select" ? "bg-ir-human-soft" : ""}`}
      >
        stick
      </span>{" "}
      across the lawn.
      {op === "type" && (
        <motion.span
          className="text-ir-human"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {" "}
          It drops it at your feet.
        </motion.span>
      )}
    </p>
  );
}

function ImageRep({ op }: { op: string | null }) {
  return (
    <DogScene className="w-full max-w-[19rem]">
      {op === "point" && (
        <motion.g
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: "201px 94px" }}
        >
          <circle
            cx={201}
            cy={94}
            r={26}
            fill="none"
            stroke={C.human}
            strokeWidth={2}
          />
          <path
            d="M216 110 l0 18 l5 -5 l6 10 l4 -2 l-6 -10 l7 -1 z"
            fill={C.human}
          />
        </motion.g>
      )}
      {op === "brush" && (
        <motion.path
          d="M166 106 Q 200 90 234 84"
          stroke={C.human}
          strokeOpacity={0.4}
          strokeWidth={18}
          strokeLinecap="round"
          fill="none"
          {...draw}
        />
      )}
      {op === "annotate" && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <circle cx={214} cy={90} r={4} fill={C.human} />
          <motion.path
            d="M214 90 L200 44 H182"
            fill="none"
            stroke={C.human}
            strokeWidth={1.5}
            {...draw}
          />
          <text x={178} y={48} textAnchor="end" fontSize={13} fill={C.human}>
            stick
          </text>
        </motion.g>
      )}
      {op === "crop" && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <path
            d="M0 0 H240 V200 H0 Z M130 40 V130 H236 V40 Z"
            fill="#fff"
            fillOpacity={0.75}
            fillRule="evenodd"
          />
          <rect
            x={130}
            y={40}
            width={106}
            height={90}
            fill="none"
            stroke={C.human}
            strokeWidth={1.75}
            strokeDasharray="5 4"
          />
        </motion.g>
      )}
    </DogScene>
  );
}

function GraphRep({ op }: { op: string | null }) {
  if (op === "connect")
    return (
      <SceneGraph nodes={["dog", "stick", "lawn", "ball"]} highlight={["ball"]}>
        <motion.line
          x1={60}
          y1={80}
          x2={120}
          y2={150}
          stroke={C.human}
          strokeWidth={2}
          {...draw}
        />
        <text x={80} y={124} fontSize={11} fill={C.human} textAnchor="end">
          wants
        </text>
      </SceneGraph>
    );
  return (
    <SceneGraph highlight={op === "select node" ? ["stick"] : []}>
      {op === "trace path" && (
        <motion.path
          d="M200 132 L60 80 L200 32"
          fill="none"
          stroke={C.human}
          strokeWidth={3}
          strokeOpacity={0.6}
          {...draw}
          transition={{ duration: 1.2 }}
        />
      )}
    </SceneGraph>
  );
}

const DOG = { x: 120, y: 160 };
const CAT = { x: 285, y: 70 };
const RUNNING = { x: 70, y: -46 };

const LATENT_OPS: Record<
  string,
  { to: { x: number; y: number }; vector: number[] }
> = {
  drag: {
    to: { x: 205, y: 190 },
    vector: VECTOR.map((v, i) => (i === 2 ? -0.35 : v)),
  },
  interpolate: {
    to: { x: (DOG.x + CAT.x) / 2, y: (DOG.y + CAT.y) / 2 },
    vector: VECTOR.map((v, i) => (v + VECTOR[(i + 5) % VECTOR.length]) / 2),
  },
  "follow direction": {
    to: { x: DOG.x + RUNNING.x, y: DOG.y + RUNNING.y },
    vector: VECTOR.map((v, i) =>
      Math.max(-1, Math.min(1, v + (i % 3 ? 0.2 : -0.1)))
    ),
  },
};

function LatentRep({ op }: { op: string | null }) {
  const change = op ? LATENT_OPS[op] : undefined;
  const at = change?.to ?? DOG;
  return (
    <div className="w-full max-w-[22rem]">
      <svg
        viewBox={`-24 -24 ${SPACE_W + 48} ${SPACE_H + 48}`}
        className="block w-full"
      >
        <Space kind="latent">
          {op === "interpolate" && (
            <g>
              <line
                x1={DOG.x}
                y1={DOG.y}
                x2={CAT.x}
                y2={CAT.y}
                stroke={C.human}
                strokeDasharray="4 5"
                strokeWidth={1.5}
              />
              <circle
                cx={CAT.x}
                cy={CAT.y}
                r={5}
                fill="#fff"
                stroke={C.rep}
                strokeWidth={1.5}
              />
              <text x={CAT.x + 10} y={CAT.y + 4} fontSize={13} fill={C.muted}>
                cat
              </text>
            </g>
          )}
          {op === "follow direction" && (
            <text
              x={DOG.x + RUNNING.x + 12}
              y={DOG.y + RUNNING.y}
              fontSize={13}
              fill={C.human}
            >
              + running
            </text>
          )}
          <StateMarker x={DOG.x} y={DOG.y} visible={!!change} ghost />
          <TransformArrow
            key={op ?? "none"}
            from={[DOG.x, DOG.y]}
            to={[at.x, at.y]}
            visible={!!change && op !== "interpolate"}
            drawOnMount
            head={9}
          />
          <StateMarker x={at.x} y={at.y} size={6} />
          <text
            x={DOG.x}
            y={DOG.y + 30}
            fontSize={13}
            fill={C.muted}
            textAnchor="middle"
          >
            dog
          </text>
        </Space>
      </svg>
      <p className="mt-2 font-mono text-sm text-ir-ink-muted">
        {formatVector(change?.vector ?? VECTOR, 5)}
      </p>
    </div>
  );
}

function FormalRep({ op }: { op: string | null }) {
  const extra = {
    constrain: "∀x. holds(dog, x) ⇒ small(x)",
    verify: "✓ consistent",
    compose: "holds ∘ on ⇒ on(stick, lawn)",
  }[op ?? ""];
  return (
    <Formula
      lines={["holds(dog, stick) ∧ on(dog, lawn)", ...(extra ? [extra] : [])]}
    />
  );
}

const VIEWS: Record<RepId, (props: { op: string | null }) => React.ReactNode> =
  {
    text: TextRep,
    image: ImageRep,
    graph: GraphRep,
    latent: LatentRep,
    formal: FormalRep,
  };

function Explorer() {
  const { step } = useStage();
  const [choice, setChoice] = useState<{
    step: number;
    rep: number | null;
    pinned: string | null;
  }>({ step, rep: null, pinned: null });
  const [hovered, setHovered] = useState<string | null>(null);

  const current = choice.step === step ? choice : { rep: null, pinned: null };
  const intro = step === 0;
  const index = current.rep ?? Math.min(Math.max(step - 1, 0), REPS.length - 1);
  const rep = REPS[index];
  const op = hovered ?? current.pinned;
  const View = VIEWS[rep.id];
  const s = stateCenter(S_INDEX);

  return (
    <div className="mx-auto max-w-[36rem]">
      <motion.div
        className="mb-8 flex flex-wrap gap-x-5 gap-y-1 md:mb-10 md:gap-x-6"
        initial={false}
        animate={{ opacity: intro ? 0 : 1, y: intro ? 8 : 0 }}
        role="group"
        aria-label="Representation"
        inert={intro}
      >
        {REPS.map((r, i) => (
          <button
            key={r.id}
            aria-pressed={i === index}
            onClick={() => setChoice({ step, rep: i, pinned: null })}
            className={`relative py-1.5 text-sm transition-colors ${i === index ? "text-ir-ink" : "text-ir-ink-muted hover:text-ir-ink"}`}
          >
            {r.name}
            {i === index && (
              <motion.span
                layoutId="rep-tab"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-ir-rep"
              />
            )}
          </button>
        ))}
      </motion.div>

      <Morph
        id={intro ? "intro" : `${rep.id}`}
        className="min-h-[12rem] items-center md:min-h-[16rem]"
      >
        {intro ? (
          <svg
            viewBox={`-40 -40 ${SPACE_W + 80} ${SPACE_H + 80}`}
            className="block w-full max-w-[26rem]"
            role="img"
            aria-label="A space with one state marked r"
          >
            <Space>
              <StateMarker x={s.x} y={s.y} label="r" />
            </Space>
          </svg>
        ) : (
          <View op={op} />
        )}
      </Morph>
      <p
        className={`mt-4 text-sm text-ir-space-ink transition-opacity duration-500 ${intro ? "opacity-0" : "opacity-100"}`}
        aria-hidden={intro}
      >
        one representation in {rep.space}
      </p>

      <motion.div
        className="mt-6 md:mt-8"
        initial={false}
        animate={{ opacity: intro ? 0 : 1 }}
        inert={intro}
      >
        <Tag tone="human" className="mb-3 block">
          Operations
        </Tag>
        <div className="flex flex-wrap gap-2">
          {rep.ops.map((o) => (
            <button
              key={o}
              onMouseEnter={() => setHovered(o)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(o)}
              onBlur={() => setHovered(null)}
              onClick={() =>
                setChoice({
                  step,
                  rep: current.rep,
                  pinned: current.pinned === o ? null : o,
                })
              }
              aria-pressed={current.pinned === o}
              className={`rounded-full px-3 py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-human ${
                op === o
                  ? "bg-ir-human text-white"
                  : "bg-ir-human-soft text-ir-human hover:brightness-95"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function RepresentationSection() {
  return (
    <ScrollStage visual={<Explorer />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} />}>
          A representation is a state that stands for something.
        </SectionHead>
        <P>
          Each medium has a space of its own, such as all possible sentences
          or all possible images. A representation <Eq>r</Eq> is one state in
          such a space, chosen to stand for a state of the problem.
        </P>
        <P>
          Take the state from before, a dog with a stick on a lawn. It can be
          expressed in many spaces, and each expression is a different
          representation.
        </P>
      </Step>
      <Step>
        <P>
          Say it in language, and it becomes a sentence. You can read it, quote
          it, and rephrase it.
        </P>
      </Step>
      <Step>
        <P>
          Draw it, and it becomes an image. Where things are is now explicit.
        </P>
      </Step>
      <Step>
        <P>
          Structure it, and it becomes a graph of entities and relations. Who
          does what to whom is now explicit.
        </P>
      </Step>
      <Step>
        <P>
          Encode it, and it becomes a vector. Similar scenes lie close together
          in the latent space.
        </P>
      </Step>
      <Step>
        <P>
          Formalize it, and it becomes a logical statement that can be checked
          and combined with others.
        </P>
      </Step>
      <Step>
        <KeyLine>
          The representation decides what is easy to see, change, and
          communicate.
        </KeyLine>
        <div className="mt-6">
          <P>
            Each representation offers its own operations, its{" "}
            <em>representational affordances</em>. Pick a representation and
            try them.
          </P>
        </div>
      </Step>
    </ScrollStage>
  );
}
