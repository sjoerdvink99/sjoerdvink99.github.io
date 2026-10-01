"use client";

import { motion } from "motion/react";
import { C } from "./palette";
import { SvgEq } from "./Eq";

export function StateMarker({
  x,
  y,
  label,
  visible = true,
  ghost = false,
  size = 5,
}: {
  x: number;
  y: number;
  label?: string;
  visible?: boolean;
  ghost?: boolean;
  size?: number;
}) {
  return (
    <motion.g
      initial={false}
      animate={{ x, y, opacity: visible ? 1 : 0, scale: visible ? 1 : 0.4 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
    >
      {ghost ? (
        <circle r={size} fill="#fff" stroke={C.rep} strokeWidth={1.5} />
      ) : (
        <>
          <circle r={size * 2.4} fill={C.rep} opacity={0.14} />
          <circle r={size} fill={C.rep} />
        </>
      )}
      {label && (
        <SvgEq x={12} y={-14} size={16} fill={C.rep}>
          {label}
        </SvgEq>
      )}
    </motion.g>
  );
}
