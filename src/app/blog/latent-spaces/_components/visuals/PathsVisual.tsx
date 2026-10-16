"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, Sym, fade } from "@/components/blog/svg";
import {
  DIMS,
  PATH_ENDS,
  PATH_STEPS,
  add,
  clamp,
  decode,
  fmt,
  lerpNorm,
  lerpVec,
  polar,
  scale,
  shell,
  slerpWeights,
  typicality,
  type Point,
  type Vec,
} from "../model";
import { Face, K, Slider, useTween } from "../svg";

const CODE = `def lerp(a, b, t):
    return (1 - t) * a + t * b

def slerp(a, b, t):
    cos = a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
    omega = np.arccos(cos)
    wa = np.sin((1 - t) * omega) / np.sin(omega)
    wb = np.sin(t * omega) / np.sin(omega)
    return wa * a + wb * b`;

const FOCUS: Focus[][] = [[0, 1], [0, 1], [3, 4, 5, 6, 7, 8], [5, 6, 7, 8]];
const STEP_DIMS = [0, 4, 4];

const RING = { x: 106, y: 100, r: 66 };
const BAND = "#e2e8f0";
const ring = (p: Vec): Point => [RING.x + p[0] * RING.r, RING.y - p[1] * RING.r];
const A = polar((3 * Math.PI) / 4);
const B = polar(Math.PI / 4);

const CHART = { x: 262, y: 26, w: 182, h: 120, lo: 0.5, hi: 1.3 };
const cx = (t: number) => CHART.x + t * CHART.w;
const cy = (v: number) =>
  CHART.y + CHART.h - ((clamp(v, CHART.lo, CHART.hi) - CHART.lo) / (CHART.hi - CHART.lo)) * CHART.h;
const SAMPLES = Array.from({ length: 41 }, (_, i) => i / 40);

const ROWS = [
  { name: "lerp", y: 216, color: K.amber },
  { name: "slerp", y: 256, color: K.blue },
];
const faceX = (t: number) => 92 + t * 340;

const polyline = (points: Point[]) =>
  points.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

export default function PathsVisual() {
  const { step } = useStage();
  const [free, setFree] = useState(4);
  const sliding = step === 3;
  const d = DIMS[sliding ? free : STEP_DIMS[step]];
  const { mean: m, sd } = shell(d);
  const inner = Math.max(m - 2 * sd, 0);
  const outer = Math.min(m + 2 * sd, 1.3);
  const showSlerp = step >= 2;
  const transition = useTween(sliding ? 0.35 : undefined);

  const chord = SAMPLES.map((t) => ring(scale(lerpVec(A, B, t), m)));
  const arc = SAMPLES.map((t) => {
    const [wa, wb] = slerpWeights(t);
    return ring(scale(add(scale(A, wa), scale(B, wb)), m));
  });
  const bandTop = cy(outer);
  const bandBottom = cy(inner);

  return (
    <Figure
      viewBox="0 0 460 276"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      interactive={sliding}
      label="A cross-section of a high-dimensional Gaussian. Samples lie in a thin shell, drawn as a shaded ring. The straight line between two samples dips through the empty middle, where faces come out faint, while the arc stays on the shell and every face along it stays sharp."
      controls={
        <Slider
          label={<span className="font-math italic">d</span>}
          value={free}
          min={0}
          max={DIMS.length - 1}
          step={1}
          onChange={setFree}
          display={String(DIMS[free])}
          hidden={!sliding}
        />
      }
    >
      <motion.circle
        cx={RING.x}
        cy={RING.y}
        fill="none"
        stroke={BAND}
        initial={false}
        animate={{ r: ((inner + outer) / 2) * RING.r, strokeWidth: (outer - inner) * RING.r }}
        transition={transition}
      />
      <motion.circle
        cx={RING.x}
        cy={RING.y}
        fill="none"
        stroke={K.slate}
        strokeDasharray="3 4"
        initial={false}
        animate={{ r: m * RING.r }}
        transition={transition}
      />
      <circle cx={RING.x} cy={RING.y} r={2.5} fill={K.slate} />
      <Label x={RING.x} y={RING.y + 13} size={10}>
        0
      </Label>

      <motion.path
        fill="none"
        stroke={K.amber}
        strokeWidth={2}
        initial={false}
        animate={{ d: polyline(chord) }}
        transition={transition}
      />
      <motion.path
        fill="none"
        stroke={K.amber}
        strokeWidth={1}
        strokeDasharray="2 3"
        initial={false}
        animate={{ d: polyline([[RING.x, RING.y], chord[20]]) }}
        transition={transition}
      />
      <motion.g initial={false} animate={{ x: chord[20][0], y: (RING.y + chord[20][1]) / 2 }} transition={transition}>
        <Label x={6} y={0} size={10} anchor="start" fill={K.amberInk}>
          {fmt(lerpNorm(0.5) * m)}
        </Label>
      </motion.g>
      <motion.g {...fade(showSlerp)}>
        <motion.path
          fill="none"
          stroke={K.blue}
          strokeWidth={2}
          initial={false}
          animate={{ d: polyline(arc) }}
          transition={transition}
        />
      </motion.g>
      {PATH_STEPS.map((t) => {
        const [wa, wb] = slerpWeights(t);
        const [lx, ly] = ring(scale(lerpVec(A, B, t), m));
        const [sx, sy] = ring(scale(add(scale(A, wa), scale(B, wb)), m));
        return (
          <g key={t}>
            <motion.circle r={3} fill={K.amber} initial={false} animate={{ cx: lx, cy: ly }} transition={transition} />
            <motion.circle
              r={3}
              fill={K.blue}
              initial={false}
              animate={{ cx: sx, cy: sy, opacity: showSlerp ? 1 : 0 }}
              transition={transition}
            />
          </g>
        );
      })}
      <motion.g initial={false} animate={{ x: ring(scale(A, m))[0], y: ring(scale(A, m))[1] }} transition={transition}>
        <Sym x={-12} y={-10} size={15}>
          a
        </Sym>
      </motion.g>
      <motion.g initial={false} animate={{ x: ring(scale(B, m))[0], y: ring(scale(B, m))[1] }} transition={transition}>
        <Sym x={12} y={-10} size={15}>
          b
        </Sym>
      </motion.g>
      <Label x={CHART.x + CHART.w / 2} y={CHART.y + CHART.h + 46} size={11} fill={K.slate}>
        {`shell of a ${d}-dimensional Gaussian`}
      </Label>

      <motion.rect
        x={CHART.x}
        width={CHART.w}
        fill={BAND}
        initial={false}
        animate={{ y: bandTop, height: bandBottom - bandTop }}
        transition={transition}
      />
      <line x1={CHART.x} x2={CHART.x} y1={CHART.y} y2={CHART.y + CHART.h} stroke={K.axis} />
      <line x1={CHART.x} x2={CHART.x + CHART.w} y1={CHART.y + CHART.h} y2={CHART.y + CHART.h} stroke={K.axis} />
      {[0.5, 1].map((v) => (
        <Label key={v} x={CHART.x - 6} y={cy(v)} size={9} anchor="end">
          {v.toFixed(1)}
        </Label>
      ))}
      {[0, 0.5, 1].map((t) => (
        <Label key={t} x={cx(t)} y={CHART.y + CHART.h + 11} size={9}>
          {String(t)}
        </Label>
      ))}
      <Label x={CHART.x + CHART.w / 2} y={CHART.y + CHART.h + 26} size={10}>
        t
      </Label>
      <Label x={CHART.x} y={CHART.y - 12} size={10} anchor="start">
        ‖z(t)‖ / √d
      </Label>
      <motion.path
        fill="none"
        stroke={K.amber}
        strokeWidth={2}
        initial={false}
        animate={{ d: polyline(SAMPLES.map((t) => [cx(t), cy(m * lerpNorm(t))])) }}
        transition={transition}
      />
      <motion.g {...fade(showSlerp)}>
        <motion.line
          x1={cx(0)}
          x2={cx(1)}
          stroke={K.blue}
          strokeWidth={2}
          initial={false}
          animate={{ y1: cy(m), y2: cy(m) }}
          transition={transition}
        />
      </motion.g>

      {ROWS.map((row, k) => (
        <motion.g key={row.name} {...fade(k === 0 || showSlerp)}>
          <Label x={8} y={row.y} size={11} anchor="start" fill={row.color}>
            {row.name}
          </Label>
          {PATH_STEPS.map((t) => {
            const r = k === 0 ? m * lerpNorm(t) : m;
            return (
              <Face
                key={t}
                look={decode(lerpVec(PATH_ENDS[0], PATH_ENDS[1], t))}
                x={faceX(t)}
                y={row.y}
                r={15}
                opacity={Math.max(0.08, typicality(r, d))}
                duration={sliding ? 0.35 : undefined}
              />
            );
          })}
        </motion.g>
      ))}
    </Figure>
  );
}
