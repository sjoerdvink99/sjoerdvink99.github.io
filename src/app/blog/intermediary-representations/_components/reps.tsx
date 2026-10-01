"use client";

import { motion } from "motion/react";
import { C } from "@/components/blog/palette";
import { Eq } from "@/components/blog/Eq";

export const VECTOR = [
  0.18, -0.44, 0.91, 0.07, -0.63, 0.32, 0.54, -0.21, 0.76, -0.12, 0.38, -0.57,
  0.05, 0.66, -0.34, 0.23,
];

export const formatVector = (v: number[], n = 4) =>
  `[${v
    .slice(0, n)
    .map((x) => x.toFixed(2).replace("-", "−"))
    .join(", ")}, …]`;

export function Sentence({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <p
      className={`font-math text-[1.35rem] leading-snug text-ir-ink ${className}`}
    >
      {text}
    </p>
  );
}

export function VectorBars({
  values = VECTOR,
  color = C.ink,
  showNumbers = true,
  className = "",
}: {
  values?: number[];
  color?: string;
  showNumbers?: boolean;
  className?: string;
}) {
  const w = 12;
  const gap = 5;
  const h = 44;
  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${values.length * (w + gap)} ${h * 2}`}
        className="block w-full max-w-[17rem]"
      >
        <line
          x1={0}
          x2={values.length * (w + gap)}
          y1={h}
          y2={h}
          stroke={C.faint}
        />
        {values.map((v, i) => (
          <motion.rect
            key={i}
            x={i * (w + gap)}
            width={w}
            rx={2}
            fill={color}
            fillOpacity={0.75}
            initial={false}
            animate={{
              y: v > 0 ? h - v * h : h,
              height: Math.max(1, Math.abs(v) * h),
            }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          />
        ))}
      </svg>
      {showNumbers && (
        <p className="mt-2 whitespace-nowrap font-mono text-sm text-ir-ink-muted">
          {formatVector(values, 5)}
        </p>
      )}
    </div>
  );
}

export const GRAPH_NODES = {
  dog: { x: 60, y: 80, label: "dog" },
  stick: { x: 200, y: 32, label: "stick" },
  lawn: { x: 200, y: 132, label: "lawn" },
  ball: { x: 120, y: 150, label: "ball" },
};

export type GraphNodeId = keyof typeof GRAPH_NODES;

export function SceneGraph({
  edges = [
    ["dog", "stick", "holds"],
    ["dog", "lawn", "on"],
  ],
  nodes = ["dog", "stick", "lawn"],
  highlight = [],
  children,
}: {
  edges?: [GraphNodeId, GraphNodeId, string][];
  nodes?: GraphNodeId[];
  highlight?: GraphNodeId[];
  children?: React.ReactNode;
}) {
  return (
    <svg viewBox="0 0 260 170" className="block w-full max-w-[20rem]">
      {edges.map(([a, b, label]) => {
        const p = GRAPH_NODES[a];
        const q = GRAPH_NODES[b];
        return (
          <g key={`${a}-${b}`}>
            <line
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={C.ink}
              strokeOpacity={0.5}
              strokeWidth={1.25}
            />
            <text
              x={(p.x + q.x) / 2}
              y={(p.y + q.y) / 2 - 7}
              textAnchor="middle"
              fontSize={11}
              fill={C.muted}
            >
              {label}
            </text>
          </g>
        );
      })}
      {children}
      {nodes.map((id) => {
        const n = GRAPH_NODES[id];
        const on = highlight.includes(id);
        return (
          <g key={id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={20}
              fill="#fff"
              stroke={on ? C.human : C.ink}
              strokeWidth={on ? 2.5 : 1.25}
            />
            <text
              x={n.x}
              y={n.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fill={C.ink}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Formula({
  lines,
  className = "",
}: {
  lines: string[];
  className?: string;
}) {
  return (
    <div className={`space-y-2 text-[1.3rem] text-ir-ink ${className}`}>
      {lines.map((l, i) => (
        <motion.div
          key={l}
          initial={i === 0 ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Eq>{l}</Eq>
        </motion.div>
      ))}
    </div>
  );
}

export const ARGUMENT = {
  claim: "Remote work raises productivity",
  evidence: "2023 field trial, 16,000 workers",
  objection: "Collaboration suffers",
};

export function ArgumentTree({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-2 text-[0.95rem] leading-snug ${className}`}>
      <p>
        <span className="mr-2 text-xs uppercase tracking-[0.14em] text-ir-ink-muted">
          Claim
        </span>
        {ARGUMENT.claim}
      </p>
      <p className="pl-4">
        <span className="text-ir-ink-muted">↳ supported by </span>
        <span className="mr-2 text-xs uppercase tracking-[0.14em] text-ir-ink-muted">
          Evidence
        </span>
        {ARGUMENT.evidence}
      </p>
      <p className="pl-4">
        <span className="text-ir-ink-muted">↳ challenged by </span>
        <span className="mr-2 text-xs uppercase tracking-[0.14em] text-ir-ink-muted">
          Objection
        </span>
        {ARGUMENT.objection}
      </p>
    </div>
  );
}

export function ArgumentMap({
  objectionWeight = 1,
  className = "",
}: {
  objectionWeight?: number;
  className?: string;
}) {
  const support = 0.62;
  const confidence = Math.max(
    0.1,
    Math.min(0.95, 0.55 + support * 0.4 - objectionWeight * 0.3)
  );
  return (
    <svg viewBox="40 12 220 132" className={`block w-full ${className}`}>
      <line
        x1={70}
        y1={44}
        x2={150}
        y2={92}
        stroke={C.ink}
        strokeWidth={1 + support * 3}
        strokeOpacity={0.55}
      />
      <motion.line
        x1={230}
        y1={44}
        x2={150}
        y2={92}
        stroke={C.ink}
        strokeDasharray="4 4"
        strokeOpacity={0.55}
        initial={false}
        animate={{
          strokeWidth: 0.75 + objectionWeight * 3,
          opacity: 0.25 + objectionWeight * 0.75,
        }}
      />
      <text x={104} y={78} fontSize={10} fill={C.muted} textAnchor="end">
        supports
      </text>
      <text x={196} y={78} fontSize={10} fill={C.muted}>
        challenges
      </text>
      <g fontSize={11} fill={C.ink} textAnchor="middle">
        <circle cx={70} cy={32} r={14} fill="#fff" stroke={C.ink} />
        <text x={70} y={36}>
          E
        </text>
        <motion.circle
          cx={230}
          cy={32}
          r={14}
          fill="#fff"
          stroke={C.ink}
          initial={false}
          animate={{ opacity: 0.35 + objectionWeight * 0.65 }}
        />
        <text x={230} y={36}>
          O
        </text>
        <circle
          cx={150}
          cy={104}
          r={18}
          fill="#fff"
          stroke={C.ink}
          strokeWidth={1.5}
        />
        <text x={150} y={108} fontWeight={500}>
          Claim
        </text>
      </g>
      <rect x={105} y={132} width={90} height={4} rx={2} fill={C.faint} />
      <motion.rect
        x={105}
        y={132}
        height={4}
        rx={2}
        fill={C.ink}
        initial={false}
        animate={{ width: 90 * confidence }}
      />
      <text x={200} y={137} fontSize={9} fill={C.muted}>
        confidence
      </text>
    </svg>
  );
}
