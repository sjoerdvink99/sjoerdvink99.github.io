"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Figure, Label, Sym, fade, useMotion } from "@/components/blog/svg";
import { ATT, HEADS, TOKENS } from "../model";
import { ColLabels, K, Mat, RowLabels, WEIGHT_MAX } from "../svg";

const CELL = { w: 28, h: 18 };
const A_Y = 120;
const SINGLE_X = 170;
const HEAD_X = [76, 300];
const X_AT = { x: 208, y: 22 };

function Projection({ x, y, label, show, delay }: { x: number; y: number; label: string; show: boolean; delay: number }) {
  return (
    <motion.g {...fade(show, delay)}>
      <rect x={x - 46} y={y - 11} width={92} height={22} rx={11} fill="#fff" stroke={K.faint} />
      <Label x={x} y={y} size={10} fill={K.muted}>
        {label}
      </Label>
    </motion.g>
  );
}

export default function HeadsVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const many = step >= 1;
  const merged = step >= 2;

  const xMid = X_AT.x + 22;
  const xBottom = X_AT.y + 26;
  const matW = 5 * CELL.w;

  return (
    <Figure
      viewBox="0 0 460 330"
      label="One input X feeds one attention operation, then two heads. Each head has its own projections and its own five by five attention pattern. The head outputs are concatenated and multiplied by W_O."
    >
      {/* the shared input */}
      <rect x={X_AT.x} y={X_AT.y} width={44} height={26} rx={3} fill="#fff" stroke={K.x} strokeOpacity={0.7} />
      <Sym x={xMid} y={X_AT.y + 13} size={15}>
        X
      </Sym>

      {/* one head */}
      <motion.g {...fade(!many)}>
        <path d={`M ${xMid} ${xBottom} V ${A_Y - 50}`} stroke={K.faint} strokeWidth={1.25} />
        <Projection x={xMid} y={A_Y - 38} label="W_Q, W_K, W_V" show={!many} delay={0} />
        <path d={`M ${xMid} ${A_Y - 27} V ${A_Y - 22}`} stroke={K.faint} strokeWidth={1.25} />
        <ColLabels x={SINGLE_X} y={A_Y - 10} labels={TOKENS} w={CELL.w} />
        <RowLabels x={SINGLE_X - 6} y={A_Y} labels={TOKENS} h={CELL.h} />
        <Mat x={SINGLE_X} y={A_Y} cell={CELL} values={ATT.weights} heat heatMax={WEIGHT_MAX} numbers={false} />
        <Label x={SINGLE_X + matW / 2} y={A_Y + 5 * CELL.h + 14} size={11} fill={K.muted}>
          one pattern
        </Label>
      </motion.g>

      {/* two heads, same X */}
      {HEADS.map((h, i) => {
        const cx = HEAD_X[i] + matW / 2;
        return (
          <g key={i}>
            <motion.path
              d={`M ${xMid} ${xBottom} C ${xMid} ${xBottom + 30}, ${cx} ${A_Y - 80}, ${cx} ${A_Y - 50}`}
              fill="none"
              stroke={K.faint}
              strokeWidth={1.25}
              initial={false}
              animate={{ pathLength: many ? 1 : 0, opacity: many ? 1 : 0 }}
              transition={motionFor.draw(i * 0.1)}
            />
            <Projection
              x={cx}
              y={A_Y - 38}
              label={`head ${i + 1} projections`}
              show={many}
              delay={0.3}
            />
            <motion.g {...fade(many, 0.45)}>
              <ColLabels x={HEAD_X[i]} y={A_Y - 10} labels={TOKENS} w={CELL.w} />
              <RowLabels x={HEAD_X[i] - 6} y={A_Y} labels={TOKENS} h={CELL.h} />
              <Mat x={HEAD_X[i]} y={A_Y} cell={CELL} values={h.weights} heat heatMax={WEIGHT_MAX} numbers={false} />
              <Label x={cx} y={A_Y + 5 * CELL.h + 14} size={11} fill={K.muted}>
                {`pattern ${i + 1}`}
              </Label>
            </motion.g>

            {/* each head's output, (T, D_head) */}
            <motion.g {...fade(merged, 0.2)}>
              <path
                d={`M ${cx} ${A_Y + 5 * CELL.h + 24} C ${cx} ${A_Y + 5 * CELL.h + 50}, ${206 + i * 24} ${250}, ${206 + i * 24} ${262}`}
                fill="none"
                stroke={K.faint}
                strokeWidth={1.25}
              />
            </motion.g>
          </g>
        );
      })}

      {/* concatenate, then W_O */}
      <motion.g {...fade(merged, 0.4)}>
        {[0, 1].map((i) => (
          <rect
            key={i}
            x={194 + i * 24}
            y={264}
            width={24}
            height={30}
            fill={K.head[i]}
            stroke={K.x}
            strokeOpacity={0.4}
          />
        ))}
        <Label x={230} y={306} size={10} fill={K.muted}>
          concat
        </Label>
        <path d={`M 248 279 H 290 M 286 276 L 290 279 L 286 282`} stroke={K.faint} strokeWidth={1.25} fill="none" />
        <Sym x={268} y={268} size={12} sub="O" fill={K.muted}>
          W
        </Sym>
        <rect x={296} y={264} width={48} height={30} fill={K.vSoft} stroke={K.v} strokeOpacity={0.6} />
        <Label x={320} y={306} size={10} fill={K.v}>
          output
        </Label>
      </motion.g>
    </Figure>
  );
}
