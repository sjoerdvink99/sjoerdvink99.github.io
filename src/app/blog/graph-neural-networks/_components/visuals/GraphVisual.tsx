"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { AGGREGATE, CLASS, EDGES, MISLEADING, NODES, X, type Edge } from "../model";
import { Clip, Dot, GraphView, Grid, K, classLook, classOf, place, plane, type NodeLook } from "../svg";

const pairs = (es: readonly Edge[]) => es.map(([u, v]) => `(${u}, ${v})`).join(", ");
const rows = (M: readonly (readonly number[])[]) =>
  M.map((r) => `[${r.map((v) => v.toFixed(1)).join(", ")}]`);

const CODE = `edges = [${pairs(EDGES.slice(0, 5))},
         ${pairs(EDGES.slice(5))}]
X = np.array([${rows(X.slice(0, 4)).join(", ")},
              ${rows(X.slice(4)).join(", ")}])
y = np.array([${CLASS.join(", ")}])`;

const FOCUS: Focus[][] = [[0, 1], [2, 3], [4], [0, 1]];

const WIDE = place(65, 22, 62);
const SIDE = place(10, 62, 36);
const P = plane({ x: [-2, 2.2], y: [-2, 2], unit: 48, left: 250, top: 10 });

const misleading = (i: number) => (MISLEADING as readonly number[]).includes(i);
const near = (i: number) => (AGGREGATE.closed as readonly number[]).includes(i);

export default function GraphVisual() {
  const { step } = useStage();
  const features = step >= 1;
  const colored = step >= 2;
  const focus = step === 3;

  const node = (i: number): NodeLook => ({
    ...(colored ? classLook(i) : {}),
    ring: colored && misleading(i) && !focus ? K.out : focus && i === AGGREGATE.v ? K.out : undefined,
    opacity: focus && !near(i) ? 0.35 : 1,
  });

  return (
    <Figure
      viewBox="0 0 460 212"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="A graph with eight nodes in two classes. Each node has a two-dimensional feature vector, drawn as a point in the plane. Nodes 1 and 6 have features that look like the other class, but their neighbours share their class."
    >
      <GraphView
        at={features ? SIDE : WIDE}
        r={features ? 10 : 13}
        node={node}
        edge={([u, v]) =>
          focus
            ? u === AGGREGATE.v || v === AGGREGATE.v
              ? { color: K.c0, width: 2.5 }
              : { opacity: 0.35 }
            : {}
        }
      />

      <motion.g {...fade(features, 0.2)}>
        <Grid plane={P} />
        <Label x={P.left + P.width - 6} y={P.py(0) - 9} size={10} anchor="end">
          feature 1
        </Label>
        <Label x={P.px(0) + 6} y={P.top + 10} size={10} anchor="start">
          feature 2
        </Label>
        <Clip plane={P}>
          {AGGREGATE.nbrs.map((u) => (
            <motion.line
              key={u}
              x1={P.at(X[AGGREGATE.v])[0]}
              y1={P.at(X[AGGREGATE.v])[1]}
              x2={P.at(X[u])[0]}
              y2={P.at(X[u])[1]}
              stroke={K.c0}
              strokeWidth={1.5}
              strokeDasharray="3 4"
              {...fade(focus)}
            />
          ))}
        </Clip>
        {NODES.map((i) => (
          <g key={i}>
            <motion.circle
              cx={P.at(X[i])[0]}
              cy={P.at(X[i])[1]}
              r={9}
              fill="none"
              stroke={K.out}
              strokeWidth={1.5}
              {...fade(colored && (focus ? i === AGGREGATE.v : misleading(i)))}
            />
            <Dot
              at={P.at(X[i])}
              color={colored ? classOf(i) : K.ink}
              label={String(i)}
              opacity={focus && !near(i) ? 0.3 : 1}
            />
          </g>
        ))}
      </motion.g>
    </Figure>
  );
}
