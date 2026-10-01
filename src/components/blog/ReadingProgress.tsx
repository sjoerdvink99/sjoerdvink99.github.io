"use client";

import { motion, useScroll, useSpring } from "motion/react";

export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-ir-ink"
      style={{ scaleX }}
    />
  );
}
