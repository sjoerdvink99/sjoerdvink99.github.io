"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ScrollStage, Step, useStage } from "@/components/blog/ScrollStage";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { C } from "@/components/blog/palette";
import { ChapterLabel } from "./chapters";

type Kind = "claim" | "evidence" | "objection";

interface ArgNode {
  kind: Kind;
  x: number;
  y: number;
  lines: [string, string];
  w?: number;
}

const NODES = {
  claim: { kind: "claim", x: 250, y: 36, w: 190, lines: ["Remote work raises", "productivity"] },
  trial: { kind: "evidence", x: 72, y: 170, lines: ["Field trial,", "16,000 workers"] },
  objection: { kind: "objection", x: 428, y: 170, lines: ["Collaboration", "suffers"] },
  survey: { kind: "objection", x: 428, y: 300, lines: ["Survey finds", "no drop"] },
  offices: { kind: "claim", x: 72, y: 300, lines: ["Offices will", "empty out"] },
  leases: { kind: "evidence", x: 250, y: 300, lines: ["Lease data,", "40 cities"] },
} satisfies Record<string, ArgNode>;

type Id = keyof typeof NODES;

const W = 138;
const H = 70;

const RELATIONS: { from: Id; to: Id; kind: "supports" | "attacks" }[] = [
  { from: "trial", to: "claim", kind: "supports" },
  { from: "objection", to: "claim", kind: "attacks" },
  { from: "survey", to: "objection", kind: "attacks" },
  { from: "leases", to: "offices", kind: "supports" },
];

const width = (n: ArgNode) => n.w ?? W;

function edgePoints(a: ArgNode, b: ArgNode) {
  if (a.y === b.y) {
    const dir = Math.sign(b.x - a.x);
    return [a.x + (dir * width(a)) / 2, a.y, b.x - (dir * width(b)) / 2 - dir * 4, b.y];
  }
  const up = Math.sign(b.y - a.y);
  const bx = b.x + (a.x - b.x) * 0.25;
  return [a.x, a.y + (up * H) / 2, bx, b.y - (up * H) / 2 - up * 4];
}

function status(present: Set<Id>) {
  const accepted = new Map<Id, boolean>();
  const attackers = (id: Id) =>
    RELATIONS.filter((r) => r.kind === "attacks" && r.to === id && present.has(r.from)).map(
      (r) => r.from
    );
  const resolve = (id: Id): boolean => {
    if (!accepted.has(id)) accepted.set(id, attackers(id).every((a) => !resolve(a)));
    return accepted.get(id)!;
  };
  present.forEach(resolve);
  return accepted;
}

function Node({
  id,
  node,
  shown,
  accepted,
  showStatus,
  added,
  flagged,
}: {
  id: Id;
  node: ArgNode;
  shown: boolean;
  accepted: boolean;
  showStatus: boolean;
  added: boolean;
  flagged: boolean;
}) {
  const w = width(node);
  return (
    <motion.g
      initial={false}
      animate={{ opacity: shown ? (showStatus && !accepted ? 0.45 : 1) : 0 }}
      transition={{ duration: 0.5 }}
      aria-hidden={!shown}
    >
      <rect
        x={node.x - w / 2}
        y={node.y - H / 2}
        width={w}
        height={H}
        rx={10}
        fill="#fff"
        stroke={added ? C.human : C.ink}
        strokeOpacity={added ? 1 : 0.5}
        strokeWidth={added ? 1.5 : 1.25}
        strokeDasharray={flagged ? "4 4" : undefined}
      />
      <text
        x={node.x - w / 2 + 10}
        y={node.y - H / 2 + 14}
        fontSize={11}
        fontStyle="italic"
        fill={C.muted}
      >
        {node.kind}
      </text>
      <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={16} fill={C.ink}>
        <tspan x={node.x}>{node.lines[0]}</tspan>
        <tspan x={node.x} dy={19}>
          {node.lines[1]}
        </tspan>
      </text>
      {node.kind !== "evidence" && (
        <motion.text
          x={node.x + w / 2 - 10}
          y={node.y - H / 2 + 14}
          fontSize={11}
          textAnchor="end"
          fill={flagged ? C.ink : C.muted}
          fontWeight={flagged ? 500 : 400}
          initial={false}
          animate={{ opacity: showStatus || flagged ? 1 : 0 }}
          key={`${id}-${flagged}`}
        >
          {flagged ? "invalid" : accepted ? "accepted" : "rejected"}
        </motion.text>
      )}
    </motion.g>
  );
}

const RULES: { lhs: string; rhs: string[][]; edited?: string[] }[] = [
  {
    lhs: "argument",
    rhs: [["<claim>", "<reasons>"]],
    edited: ["<claim>", '"supported by"', "<evidence>", "<reasons>"],
  },
  { lhs: "reasons", rhs: [["ε"], ["<reason>", "<reasons>"]] },
  { lhs: "reason", rhs: [['"supported by"', "<evidence>"], ['"attacked by"', "<objection>"]] },
  { lhs: "objection", rhs: [["<claim>", "<reasons>"]] },
];

function Symbols({ items }: { items: string[] }) {
  return (
    <>
      {items.map((t, i) => (
        <span key={i} className={t.startsWith("<") ? "" : "text-ir-ink-muted"}>
          {i > 0 && " "}
          {t}
        </span>
      ))}
    </>
  );
}

function Grammar({ constrained }: { constrained: boolean }) {
  return (
    <figure className="mt-5">
      <figcaption className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ir-ink-muted">
        Grammar in BNF
      </figcaption>
      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-x-2 gap-y-0.5 font-mono text-[0.72rem] leading-relaxed text-ir-ink md:text-[0.8rem]">
        {RULES.map((r) =>
          r.rhs.map((alt, i) => {
            const edited = constrained && r.edited;
            return (
              <div key={`${r.lhs}-${i}`} className="contents">
                <span>{i === 0 ? `<${r.lhs}>` : ""}</span>
                <span className="text-ir-ink-muted">{i === 0 ? "::=" : "|"}</span>
                <motion.span
                  key={edited ? "edited" : "original"}
                  initial={edited ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  className={edited ? "text-ir-human" : ""}
                >
                  <Symbols items={edited ? r.edited! : alt} />
                </motion.span>
              </div>
            );
          })
        )}
      </div>
    </figure>
  );
}

function ArgumentGraph() {
  const { step } = useStage();
  const [toggles, setToggles] = useState({ step, rebut: true, support: false });
  const own = toggles.step === step ? toggles : { rebut: true, support: false };

  const interactive = step >= 4;
  const rebut = interactive ? own.rebut : step >= 3;
  const support = interactive && own.support;

  const present = new Set<Id>(["claim", "trial", "objection"]);
  if (step >= 2) present.add("offices");
  if (rebut) present.add("survey");
  if (support) present.add("leases");
  const accepted = status(present);
  const showStatus = step >= 1;


  const toggle = (key: "rebut" | "support") =>
    setToggles({ step, ...own, [key]: !own[key] });

  return (
    <div className="mx-auto max-w-[30rem]">
      <svg
        viewBox="0 0 500 342"
        className="block w-full"
        role="img"
        aria-label={`An argument graph. The claim that remote work raises productivity is ${accepted.get("claim") ? "accepted" : "rejected"}.`}
      >
        <defs>
          <marker
            id="arg-head"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M1 1 L8 5 L1 9" fill="none" stroke={C.ink} strokeOpacity={0.6} strokeWidth={1.5} />
          </marker>
        </defs>
        {RELATIONS.map((r) => {
          const [x1, y1, x2, y2] = edgePoints(NODES[r.from], NODES[r.to]);
          const shown = present.has(r.from) && present.has(r.to);
          return (
            <motion.g
              key={`${r.from}-${r.to}`}
              initial={false}
              animate={{ opacity: shown ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={C.ink}
                strokeOpacity={0.55}
                strokeWidth={1.25}
                strokeDasharray={r.kind === "attacks" ? "5 4" : undefined}
                markerEnd="url(#arg-head)"
              />
              <text
                x={(x1 + x2) / 2 + (y1 === y2 ? 0 : 8)}
                y={(y1 + y2) / 2 + (y1 === y2 ? -8 : 4)}
                fontSize={12}
                fill={C.muted}
                textAnchor={y1 === y2 ? "middle" : "start"}
              >
                {r.kind}
              </text>
            </motion.g>
          );
        })}
        {(Object.keys(NODES) as Id[]).map((id) => (
          <Node
            key={id}
            id={id}
            node={NODES[id]}
            shown={present.has(id)}
            accepted={accepted.get(id) ?? true}
            showStatus={showStatus}
            added={id === "offices" || id === "leases" || (id === "survey" && interactive)}
            flagged={id === "offices" && step >= 2 && !support}
          />
        ))}
      </svg>

      <Grammar constrained={step >= 2} />

      <motion.div
        className={`mt-5 flex-wrap gap-2 ${interactive ? "flex" : "flex max-lg:hidden"}`}
        initial={false}
        animate={{ opacity: interactive ? 1 : 0 }}
        inert={!interactive}
      >
        {(
          [
            ["rebut", "answer the objection"],
            ["support", "add evidence for the new claim"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            aria-pressed={own[key]}
            className={`rounded-full px-3 py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-human ${
              own[key]
                ? "bg-ir-human text-white"
                : "bg-ir-human-soft text-ir-human hover:brightness-95"
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>
    </div>
  );
}

export default function StructureSection() {
  return (
    <ScrollStage visual={<ArgumentGraph />}>
      <Step>
        <SectionHead as="h3" label={<ChapterLabel n={2} sub="Structure" />}>
          Structure gives a representation rules.
        </SectionHead>
        <P>
          Take the argument about remote work. As a structured representation
          it has a syntax. A small context-free grammar, written in BNF, says
          which arguments are well formed.
        </P>
      </Step>
      <Step>
        <P>
          It has a semantics. The structure itself determines what follows. An
          objection that nobody answers defeats the claim it attacks.
        </P>
      </Step>
      <Step>
        <P>
          It has constraints. Suppose every main claim needs evidence. That rule
          can be written into the grammar itself. A claim without evidence no
          longer parses, and the system can say so right away.
        </P>
      </Step>
      <Step>
        <P>
          And it composes. A second argument, a survey that finds no drop in
          teamwork, attaches to the objection. The objection is defeated, and
          the claim is accepted again.
        </P>
      </Step>
      <Step>
        <KeyLine>Structure makes a representation checkable.</KeyLine>
        <div className="mt-6">
          <P>
            Syntax, semantics, constraints, and composition give people new
            operations. They can validate an argument, edit the grammar, combine
            it with others, and verify what follows. Try the two edits in the
            figure.
          </P>
        </div>
      </Step>
    </ScrollStage>
  );
}
