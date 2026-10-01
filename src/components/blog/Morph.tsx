"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export function Morph({
  id,
  children,
  className = "",
}: {
  id: string | number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid ${className}`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={id}
          className="[grid-area:1/1]"
          initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
