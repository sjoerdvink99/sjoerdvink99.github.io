"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export default function Essay({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
