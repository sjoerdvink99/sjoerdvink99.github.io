"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ScrollStage, Step, useStage } from "@/components/blog/ScrollStage";
import { Eq } from "@/components/blog/Eq";
import { Tag } from "@/components/blog/Tag";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ArgumentMap, ArgumentTree, VECTOR, VectorBars } from "./reps";
import { ChapterLabel } from "./chapters";

function HumanFacing() {
  const [weight, setWeight] = useState(0.6);
  return (
    <div className="flex items-center gap-6">
      <ArgumentMap objectionWeight={weight} className="max-w-[12rem]" />
      <div className="flex flex-col gap-2">
        {(
          [
            ["rebut", 0.15],
            ["concede", 1],
          ] as const
        ).map(([label, value]) => (
          <button
            key={label}
            onClick={() => setWeight(weight === value ? 0.6 : value)}
            aria-pressed={weight === value}
            className={`rounded-full px-3 py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-human ${
              weight === value
                ? "bg-ir-human text-white"
                : "bg-ir-human-soft text-ir-human hover:brightness-95"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const LEVELS: {
  name: string;
  content: ReactNode;
  ops: string;
  cost: string;
}[] = [
  {
    name: "Embedding",
    content: <VectorBars values={VECTOR} className="max-w-[11rem]" />,
    ops: "move through vector space",
    cost: "expressive, but opaque",
  },
  {
    name: "Semantic concepts",
    content: (
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-[0.95rem] text-gray-700">
        {["remote work", "productivity", "field trial", "collaboration"].map(
          (c) => (
            <span key={c}>
              <span className="mr-1.5 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-ir-rep" />
              {c}
            </span>
          )
        )}
      </p>
    ),
    ops: "add, remove, or weigh concepts",
    cost: "readable, but loose",
  },
  {
    name: "Argument structure",
    content: <ArgumentTree className="text-gray-700" />,
    ops: "restructure claims and evidence",
    cost: "precise, but tied to one task",
  },
  {
    name: "Task interface",
    content: <HumanFacing />,
    ops: "rebut, concede, compare",
    cost: "direct, but commits to one way of working",
  },
];

function LevelLink() {
  return (
    <div
      className="flex h-6 items-center gap-2 pl-[0.15rem] text-ir-transform"
      aria-hidden
    >
      <svg width="10" height="20" viewBox="0 0 10 20">
        <path
          d="M5 2 V18 M1 6 L5 1.5 L9 6 M1 14 L5 18.5 L9 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Stack() {
  const { step } = useStage();
  const [chosen, setChosen] = useState({ step, level: LEVELS.length - 1 });

  const continuum = step >= 5;
  const meet = chosen.step === step ? chosen.level : LEVELS.length - 1;
  const focus = continuum ? meet : step >= 1 ? step - 1 : null;

  return (
    <div className="mx-auto max-w-[36rem]">
      <p className="mb-3 text-xs text-ir-ink-muted">model-oriented</p>
      <div>
        {LEVELS.map((level, i) => {
          const on = focus === null || focus === i;
          return (
            <div key={level.name}>
              {i > 0 && <LevelLink />}
              <motion.div
                className="origin-left py-1.5"
                initial={false}
                animate={{ opacity: on ? 1 : 0.25 }}
                transition={{ duration: 0.5 }}
              >
                <Tag className="mb-2 block">{level.name}</Tag>
                <div className={on ? "" : "max-lg:hidden"}>
                  {(!continuum || on) && level.content}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ir-ink-muted">human-oriented</p>

      <motion.div
        className="mt-6"
        initial={false}
        animate={{ opacity: continuum ? 1 : 0, y: continuum ? 0 : 10 }}
        inert={!continuum}
      >
        <input
          type="range"
          min={0}
          max={LEVELS.length - 1}
          step={1}
          value={meet}
          onChange={(e) => setChosen({ step, level: Number(e.target.value) })}
          className="ir-range w-full"
          aria-label="Level at which human and AI meet"
          aria-valuetext={LEVELS[meet].name}
        />
        <p className="mt-3 text-center text-sm">
          <span className="text-ir-human">{LEVELS[meet].ops}</span>
          <span className="text-ir-ink-muted"> · {LEVELS[meet].cost}</span>
        </p>
      </motion.div>
    </div>
  );
}

export default function AbstractionSection() {
  return (
    <ScrollStage visual={<Stack />}>
      <Step>
        <SectionHead
          as="h3"
          label={<ChapterLabel n={2} sub="Levels of abstraction" />}
        >
          The model’s representation does not have to be the
          human’s.
        </SectionHead>
        <P>
          The same content can be represented at several levels of
          abstraction. Transformations connect neighboring levels, in both
          directions.
        </P>
      </Step>
      <Step>
        <P>
          Inside the model, a text about remote work becomes something like{" "}
          <Eq>[0.18, −0.44, 0.91, …]</Eq>. The model computes well with this. A
          person can do little with it. What would it mean to edit dimension
          214?
        </P>
      </Step>
      <Step>
        <P>
          One level up, the same content becomes the concepts it is about.
          People can read these, but they carry little structure.
        </P>
      </Step>
      <Step>
        <P>
          Concepts can be arranged into a structure that fits the task. Here
          that is an argument, with a claim, evidence that supports it, and an
          objection that challenges it.
        </P>
      </Step>
      <Step>
        <P>
          That structure can become the place where human and AI meet. Instead
          of exposing embeddings, a system can let people rebut the objection
          and watch confidence in the claim change. This is the idea behind
          Groundwork.
        </P>
      </Step>
      <Step>
        <KeyLine>Where should human and AI meet?</KeyLine>
        <div className="mt-6">
          <P>
            Higher is not automatically better. Each level offers different
            operations and gives something up in return. Other tasks may call
            for a graph, a grammar, a map, an image, or a latent space.
            Choosing the level is a design decision.
          </P>
        </div>
      </Step>
    </ScrollStage>
  );
}
