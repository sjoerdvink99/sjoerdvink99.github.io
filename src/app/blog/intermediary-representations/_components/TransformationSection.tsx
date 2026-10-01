"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ScrollStage, Step, useStage } from "@/components/blog/ScrollStage";
import { Space, SPACE_H, SPACE_W, stateCenter } from "@/components/blog/Space";
import { StateMarker } from "@/components/blog/StateMarker";
import { TransformArrow } from "@/components/blog/TransformArrow";
import { Morph } from "@/components/blog/Morph";
import { Eq, SvgEq } from "@/components/blog/Eq";
import { Tag } from "@/components/blog/Tag";
import { C } from "@/components/blog/palette";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { DogScene, type Held } from "./DogScene";
import { ChapterLabel } from "./chapters";
import {
  ArgumentMap,
  ArgumentTree,
  Sentence,
  VECTOR,
  formatVector,
} from "./reps";

const PROPERTIES = [
  "within a space",
  "between spaces",
  "learned",
  "programmed",
  "probabilistic",
] as const;
type Property = (typeof PROPERTIES)[number];

function MiniSpace({ index, label }: { index: number; label: string }) {
  const s = stateCenter(index);
  return (
    <svg
      viewBox={`-30 -30 ${SPACE_W + 60} ${SPACE_H + 60}`}
      className="block w-full"
    >
      <Space>
        <StateMarker x={s.x} y={s.y} label={label} size={7} />
      </Space>
    </svg>
  );
}

function Encoded() {
  return (
    <div>
      <svg
        viewBox={`-30 -30 ${SPACE_W + 60} ${SPACE_H + 60}`}
        className="block w-full"
      >
        <Space kind="latent">
          <StateMarker x={120} y={160} size={8} />
        </Space>
      </svg>
      <p className="mt-2 text-center font-mono text-xs text-ir-ink-muted">
        {formatVector(VECTOR, 3)}
      </p>
    </div>
  );
}

const BRANCHES: { held: Held; p: number }[] = [
  { held: "stick", p: 0.55 },
  { held: "ball", p: 0.3 },
  { held: "bone", p: 0.15 },
];

interface Case {
  from: string;
  to: string;
  name: string;
  properties: Property[];
  source: ReactNode;
  target: ReactNode;
}

const CASES: Case[] = [
  {
    from: "S_A",
    to: "S_B",
    name: "T",
    properties: [],
    source: <MiniSpace index={30} label="r_A" />,
    target: <MiniSpace index={65} label="r_B" />,
  },
  {
    from: "image space",
    to: "image space",
    name: "edit",
    properties: ["within a space", "learned"],
    source: <DogScene held="stick" className="w-full" />,
    target: <DogScene held="ball" className="w-full" />,
  },
  {
    from: "image space",
    to: "text space",
    name: "describe",
    properties: ["between spaces", "learned"],
    source: <DogScene held="stick" className="w-full" />,
    target: (
      <Sentence
        text="A dog carries a stick across the lawn."
        className="!text-lg"
      />
    ),
  },
  {
    from: "text space",
    to: "latent space",
    name: "encode",
    properties: ["between spaces", "learned"],
    source: (
      <Sentence
        text="A dog carries a stick across the lawn."
        className="!text-lg"
      />
    ),
    target: <Encoded />,
  },
  {
    from: "argument space",
    to: "diagram space",
    name: "lay out",
    properties: ["between spaces", "programmed"],
    source: <ArgumentTree className="text-[0.8rem] text-gray-700" />,
    target: <ArgumentMap objectionWeight={0.6} />,
  },
  {
    from: "text space",
    to: "image space",
    name: "generate",
    properties: ["between spaces", "learned", "probabilistic"],
    source: <Sentence text="A dog holding something." className="!text-lg" />,
    target: (
      <div className="space-y-2">
        {BRANCHES.map((b) => (
          <div key={b.held} className="flex items-center gap-3">
            <DogScene held={b.held} className="w-[4rem] md:w-[5.5rem]" />
            <Eq className="text-sm text-ir-ink-muted">{`P = ${b.p.toFixed(2)}`}</Eq>
          </div>
        ))}
      </div>
    ),
  },
];

function Connector({
  name,
  probabilistic,
}: {
  name: string;
  probabilistic: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 200"
      className="block w-full overflow-visible"
      aria-hidden
    >
      {probabilistic ? (
        BRANCHES.map((b, i) => (
          <TransformArrow
            key={b.held}
            from={[6, 100]}
            to={[92, 34 + i * 66]}
            bend={i === 1 ? 0 : (i - 1) * -12}
            width={0.6 + b.p * 5}
            head={6}
            delay={i * 0.12}
            drawOnMount
          />
        ))
      ) : (
        <TransformArrow from={[6, 100]} to={[92, 100]} bend={-16} drawOnMount />
      )}
      <motion.g
        key={name}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {name === "T" ? (
          <SvgEq
            x={50}
            y={probabilistic ? 188 : 72}
            anchor="middle"
            size={17}
            fill={C.transformInk}
          >
            T
          </SvgEq>
        ) : (
          <text
            x={50}
            y={probabilistic ? 190 : 74}
            textAnchor="middle"
            fontSize={12}
            fill={C.transformInk}
          >
            {name}
          </text>
        )}
      </motion.g>
    </svg>
  );
}

function SpaceName({ name }: { name: string }) {
  return name.includes("_") ? <Eq>{name}</Eq> : <span>{name}</span>;
}

function SpaceLabels({ from, to }: { from: string; to: string }) {
  const same = from === to;
  return (
    <div className="mt-5 grid grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] gap-3 text-center text-sm text-ir-space-ink md:grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,1fr)]">
      {same ? (
        <div className="col-span-3 border-t border-ir-space pt-2">
          <SpaceName name={from} />
        </div>
      ) : (
        <>
          <div className="border-t border-ir-space pt-2">
            <SpaceName name={from} />
          </div>
          <span />
          <div className="border-t border-ir-space pt-2">
            <SpaceName name={to} />
          </div>
        </>
      )}
    </div>
  );
}

function TransformVisual() {
  const { step } = useStage();
  const index = Math.min(step, CASES.length - 1);
  const c = CASES[index];
  const probabilistic = c.properties.includes("probabilistic");

  return (
    <div className="mx-auto max-w-[38rem]">
      <div className="mb-10 flex h-7 items-baseline justify-center gap-10 text-lg text-ir-ink">
        <Morph id={probabilistic ? "p" : "t"}>
          {probabilistic ? (
            <Eq>P(r′ | r)</Eq>
          ) : (
            <span className="flex gap-10">
              <Eq>T : S_A → S_B</Eq>
              <Eq>r_B = T(r_A)</Eq>
            </span>
          )}
        </Morph>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] items-center gap-3 md:grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,1fr)]">
        <Morph id={`s${index}`} className="items-center">
          {c.source}
        </Morph>
        <Connector key={index} name={c.name} probabilistic={probabilistic} />
        <Morph id={`t${index}`} className="items-center">
          {c.target}
        </Morph>
      </div>

      <SpaceLabels from={c.from} to={c.to} />

      <div className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {PROPERTIES.map((p) => (
          <Tag
            key={p}
            tone={c.properties.includes(p) ? "transform" : "ink"}
            className={`transition-opacity duration-500 ${c.properties.includes(p) ? "" : "opacity-40"}`}
          >
            {p}
          </Tag>
        ))}
      </div>
    </div>
  );
}

export default function TransformationSection() {
  return (
    <ScrollStage visual={<TransformVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} />}>
          A transformation maps one representation to another.
        </SectionHead>
        <P>
          A transformation <Eq>T</Eq> takes a representation <Eq>r_A</Eq> in
          one space and produces a representation <Eq>r_B</Eq>, in another
          space or in the same one.
        </P>
      </Step>
      <Step>
        <P>
          Some transformations stay within one space. An image editor turns
          one image into another.
        </P>
      </Step>
      <Step>
        <P>
          Others cross between spaces. A captioning model turns an image into
          a sentence about it.
        </P>
      </Step>
      <Step>
        <P>
          An encoder turns that sentence into a vector in a latent space. Both
          of these transformations are learned. Nobody wrote down the rule.
        </P>
      </Step>
      <Step>
        <P>
          Other transformations are programmed. A layout algorithm turns an
          argument structure into a diagram, the same way every time.
        </P>
      </Step>
      <Step>
        <P>
          Many transformations inside AI systems are probabilistic. One input
          does not fix one output. It defines a distribution over possible
          outputs, <Eq>P(r′ | r)</Eq>.
        </P>
      </Step>
      <Step>
        <KeyLine>
          Transformations decide how information, intent, and structure move
          through a system.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}
