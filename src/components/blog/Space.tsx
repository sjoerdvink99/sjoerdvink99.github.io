"use client";

import type { ReactNode } from "react";
import { C } from "./palette";
import { gauss, rand, round } from "./random";
import { SvgEq } from "./Eq";

export type SpaceKind = "abstract" | "latent";

export const SPACE_W = 360;
export const SPACE_H = 256;

const COLS = 12;
const ROWS = 8;
const CW = SPACE_W / COLS;
const CH = SPACE_H / ROWS;
const N = COLS * ROWS;

const CLUSTERS = [
  [95, 90],
  [250, 70],
  [210, 190],
];

function position(kind: SpaceKind, i: number) {
  if (kind === "latent") {
    const [cx, cy] = CLUSTERS[i % 3];
    return {
      x: round(Math.min(SPACE_W - 4, Math.max(4, cx + gauss(i) * 90))),
      y: round(Math.min(SPACE_H - 4, Math.max(4, cy + gauss(i + 57) * 60))),
    };
  }
  return {
    x: round(((i % COLS) + 0.5) * CW + (rand(i) - 0.5) * 14),
    y: round((Math.floor(i / COLS) + 0.5) * CH + (rand(i + 101) - 0.5) * 14),
  };
}

export function stateCenter(i: number, kind: SpaceKind = "abstract") {
  return position(kind, i);
}

export function Space({
  kind = "abstract",
  children,
}: {
  kind?: SpaceKind;
  children?: ReactNode;
}) {
  return (
    <g>
      <rect
        x={-14}
        y={-14}
        width={SPACE_W + 28}
        height={SPACE_H + 28}
        rx={18}
        fill="none"
        stroke={C.space}
        strokeWidth={1.25}
      />
      <g stroke={C.space} strokeOpacity={0.18}>
        {[1, 2, 3].map((k) => (
          <line
            key={`v${k}`}
            x1={(SPACE_W / 4) * k}
            x2={(SPACE_W / 4) * k}
            y1={-14}
            y2={SPACE_H + 14}
          />
        ))}
        {[1, 2].map((k) => (
          <line
            key={`h${k}`}
            y1={(SPACE_H / 3) * k}
            y2={(SPACE_H / 3) * k}
            x1={-14}
            x2={SPACE_W + 14}
          />
        ))}
      </g>
      <SvgEq x={SPACE_W + 4} y={-32} size={18} fill={C.spaceInk} anchor="end">
        S
      </SvgEq>
      <g fill={C.space}>
        {Array.from({ length: N }, (_, i) => {
          const p = position(kind, i);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={kind === "latent" ? 2.2 : 2}
              opacity={kind === "latent" ? 0.6 : 0.5}
            />
          );
        })}
      </g>
      {children}
    </g>
  );
}
