"use client";

import { motion } from "motion/react";
import { C } from "./palette";
import { round } from "./random";

type Point = [number, number];

export function TransformArrow({
  from,
  to,
  bend = 0,
  visible = true,
  color = C.transform,
  width = 1.75,
  dashed = false,
  delay = 0,
  head = 7,
  drawOnMount = false,
}: {
  from: Point;
  to: Point;
  bend?: number;
  visible?: boolean;
  color?: string;
  width?: number;
  dashed?: boolean;
  delay?: number;
  head?: number;
  drawOnMount?: boolean;
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = round((x1 + x2) / 2 - ((y2 - y1) / len) * bend);
  const cy = round((y1 + y2) / 2 + ((x2 - x1) / len) * bend);
  const angle = Math.atan2(y2 - cy, x2 - cx);
  const wing = (a: number) =>
    `${round(x2 - head * Math.cos(angle + a))} ${round(y2 - head * Math.sin(angle + a))}`;

  return (
    <g>
      <motion.path
        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? "4 5" : undefined}
        initial={drawOnMount ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
        transition={{
          duration: 0.7,
          delay: visible ? delay : 0,
          ease: [0.65, 0, 0.35, 1],
        }}
      />
      <motion.path
        d={`M ${wing(0.42)} L ${x2} ${y2} L ${wing(-0.42)}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={drawOnMount ? { opacity: 0 } : false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25, delay: visible ? delay + 0.55 : 0 }}
      />
    </g>
  );
}
