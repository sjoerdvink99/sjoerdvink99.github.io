"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";

export type FadeRange = [number, number] | [number, number, number, number];

const hold = (range: FadeRange) => (range.length === 2 ? [...range, 1] : range);

export function useFade(p: MotionValue<number>, range: FadeRange) {
  return useTransform(
    p,
    hold(range),
    range.length === 2 ? [0, 1, 1] : [0, 1, 1, 0]
  );
}

export function Caption({
  p,
  range,
  className = "",
  children,
}: {
  p: MotionValue<number>;
  range: FadeRange;
  className?: string;
  children: ReactNode;
}) {
  const opacity = useFade(p, range);
  const y = useTransform(
    p,
    hold(range),
    range.length === 2 ? [12, 0, 0] : [12, 0, 0, -12]
  );
  return (
    <motion.p
      className={`mx-auto max-w-xl text-balance px-6 text-center text-xl font-light leading-snug text-ir-ink [grid-area:1/1] [text-shadow:0_0_14px_#fff,0_0_6px_#fff,0_0_2px_#fff] md:text-[1.6rem] ${className}`}
      style={{ opacity, y }}
    >
      {children}
    </motion.p>
  );
}
