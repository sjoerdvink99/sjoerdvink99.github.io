"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, fade } from "@/components/blog/svg";
import { AGGREGATE, BOUNDARY, MEANS, NODES, X, list } from "../model";
import { Arrow, Calc, Clip, Dot, GraphView, Grid, K, classLook, classOf, place, plane, type Line } from "../svg";

const { v, nbrs, total, mean, self, steps, closed } = AGGREGATE;

const CODE = `nbrs = [${nbrs.join(", ")}]
total = X[nbrs].sum(axis=0)
mean = total / len(nbrs)
h = X[[${v}] + nbrs].mean(axis=0)
H = np.stack([X[[u] + adj[u]].mean(axis=0) for u in range(n)])`;

const FOCUS: Focus[][] = [[0], [1], [2], [3], [4]];

const GRAPH = place(8, 62, 34);
const P = plane({ x: [-2.5, 2.2], y: [-2, 3], unit: 40, left: 264, top: 8 });
const O = P.at([0, 0]);
const at = (p: readonly number[]) => P.at(p);

const LINES: Line[][] = [
  [`N(${v}) = {${nbrs.join(", ")}}`],
  [
    `X[${nbrs[0]}] + X[${nbrs[1]}]`,
    `= ${list(X[nbrs[0]], 1)} + ${list(X[nbrs[1]], 1)}`,
    { text: `= ${list(total)}`, color: K.outInk },
  ],
  [`${list(total)} / ${nbrs.length}`, { text: `= ${list(mean)}`, color: K.outInk }],
  [`(X[${v}] + X[${nbrs[0]}] + X[${nbrs[1]}]) / ${closed.length}`, { text: `= ${list(self)}`, color: K.outInk }],
  [`node 1: ${list(X[1])} → ${list(MEANS[1])}`, `node 6: ${list(X[6])} → ${list(MEANS[6])}`],
];

const boundary = (x: number) => BOUNDARY.slope * x + BOUNDARY.offset;

export default function AggregateVisual() {
  const { step } = useStage();
  const all = step === 4;
  const inside = (i: number) => (closed as readonly number[]).includes(i);
  const counted = (i: number) => (step === 3 ? inside(i) : nbrs.includes(i));
  const loop = GRAPH[v];

  return (
    <Figure
      viewBox="0 0 460 228"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Node 1 collects the feature vectors of its neighbours 0 and 3. Their sum is drawn tip to tail, their mean is the midpoint, and including node 1 itself gives the centroid of the triangle. Doing this for every node pulls the two classes apart."
    >
      <GraphView
        at={GRAPH}
        r={9}
        node={(i) => ({
          ...classLook(i),
          ring: !all && i === v ? K.out : undefined,
          opacity: all || counted(i) || i === v ? 1 : 0.35,
        })}
        edge={([a, b]) =>
          all ? {} : a === v || b === v ? { color: K.out, width: 2.5 } : { opacity: 0.35 }
        }
      />
      <motion.circle
        cx={loop[0]}
        cy={loop[1] - 15}
        r={7}
        fill="none"
        stroke={K.out}
        strokeWidth={2}
        {...fade(step === 3)}
      />

      <Grid plane={P} />
      <Clip plane={P}>
        <motion.line
          x1={P.px(P.x[0])}
          y1={P.py(boundary(P.x[0]))}
          x2={P.px(P.x[1])}
          y2={P.py(boundary(P.x[1]))}
          stroke={K.ink}
          strokeOpacity={0.5}
          strokeDasharray="5 5"
          {...fade(all, 0.6)}
        />
        <motion.g {...fade(step === 0)}>
          {nbrs.map((u) => (
            <line
              key={u}
              x1={at(X[v])[0]}
              y1={at(X[v])[1]}
              x2={at(X[u])[0]}
              y2={at(X[u])[1]}
              stroke={K.c0}
              strokeWidth={1.5}
              strokeDasharray="3 4"
            />
          ))}
        </motion.g>
        <motion.g {...fade(step === 2)}>
          <line
            x1={at(X[nbrs[0]])[0]}
            y1={at(X[nbrs[0]])[1]}
            x2={at(X[nbrs[1]])[0]}
            y2={at(X[nbrs[1]])[1]}
            stroke={K.out}
            strokeDasharray="3 4"
          />
        </motion.g>
        <motion.polygon
          points={closed.map((i) => at(X[i]).join(",")).join(" ")}
          fill={K.outSoft}
          fillOpacity={0.7}
          stroke={K.out}
          strokeOpacity={0.6}
          {...fade(step === 3)}
        />
        <motion.g {...fade(all)}>
          {NODES.map((i) => (
            <line
              key={i}
              x1={at(X[i])[0]}
              y1={at(X[i])[1]}
              x2={at(MEANS[i])[0]}
              y2={at(MEANS[i])[1]}
              stroke={classOf(i)}
              strokeOpacity={0.35}
            />
          ))}
        </motion.g>
      </Clip>

      {nbrs.map((u, k) => (
        <Arrow
          key={u}
          from={at(step >= 1 && step <= 2 ? steps[k] : [0, 0])}
          to={at(step >= 1 && step <= 2 ? steps[k + 1] : [0, 0])}
          color={K.c0}
          width={1.5}
          opacity={step === 1 ? 0.8 : step === 2 ? 0.3 : 0}
        />
      ))}
      <Arrow
        from={O}
        to={at(step === 1 ? total : step === 2 ? mean : [0, 0])}
        color={K.out}
        width={2.5}
        opacity={step === 1 || step === 2 ? 1 : 0}
      />

      {NODES.map((i) => (
        <Dot
          key={`ghost${i}`}
          at={at(X[i])}
          color={classOf(i)}
          hollow
          r={4}
          opacity={all ? 0.45 : 0}
        />
      ))}
      {NODES.map((i) => (
        <Dot
          key={i}
          at={at(all ? MEANS[i] : X[i])}
          color={classOf(i)}
          label={String(i)}
          opacity={all || inside(i) ? 1 : 0.2}
        />
      ))}
      <Dot at={at(mean)} color={K.out} r={5} hollow opacity={step === 2 ? 1 : 0} />
      <Dot at={at(self)} color={K.out} r={5} opacity={step === 3 ? 1 : 0} />

      <Calc x={8} y={160} steps={LINES} step={step} size={10.5} gap={18} />
    </Figure>
  );
}
