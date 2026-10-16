"use client";

import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, MathText, fade } from "@/components/blog/svg";
import { BOWL, add, fmt, scale, type Vec } from "../model";
import { Arrow, Clip, K, plane, useTween } from "../svg";

const CODE = `loss = w[0] ** 2 / 2 + 2 * w[1] ** 2
loss.backward()
with torch.no_grad():
    w -= lr * w.grad
    w.grad.zero_()`;

const FOCUS: Focus[][] = [[0], [1], [1], [3], [3], [1, 3, 4]];

const UNIT = 56;
const P = plane({ x: [-3.8, 3.8], y: [-1.9, 1.9], unit: UNIT, left: 17, top: 8 });
const O = P.at([0, 0]);
const SHRINK = 0.25;
const { start, grad, levels } = BOWL;
const g = grad(start);
const here = P.at(start);
const tip = (v: Vec) => P.at(add(start, scale(v, SHRINK)));

const ellipse = (c: number) => ({ rx: Math.sqrt(2 * c) * UNIT, ry: Math.sqrt(c / 2) * UNIT });
const through = ellipse(BOWL.loss(start));

const polyline = (ps: Vec[]) =>
  ps.map((p, i) => `${i ? "L" : "M"} ${P.at(p).map((v) => v.toFixed(1)).join(" ")}`).join(" ");

function Descent({ path, color, show }: { path: Vec[]; color: string; show: boolean }) {
  const transition = useTween(show ? 1.4 : 0.3);
  return (
    <g>
      <motion.path
        d={polyline(path)}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
        transition={transition}
      />
      {path.slice(1).map((p, k) => (
        <motion.circle
          key={k}
          cx={P.at(p)[0]}
          cy={P.at(p)[1]}
          r={3}
          fill={color}
          {...fade(show, 0.1 + k * 0.1)}
        />
      ))}
    </g>
  );
}

export default function GradientVisual() {
  const { step } = useStage();
  const partial = step === 1 ? 1 : step === 2 ? 0.35 : 0;

  return (
    <Figure
      viewBox="0 0 460 230"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="Contour lines of a loss over two weights. The partial derivatives at a point combine into the gradient, which is perpendicular to the contour. Gradient descent follows the negative gradient to the minimum, and zigzags when the step is too large."
    >
      <rect x={P.left} y={P.top} width={P.width} height={P.height} rx={6} fill="#fff" stroke={K.faint} />
      <Clip plane={P}>
        {[...levels].reverse().map((c) => (
          <ellipse
            key={c}
            cx={O[0]}
            cy={O[1]}
            {...ellipse(c)}
            fill={K.a}
            fillOpacity={0.06}
            stroke={K.a}
            strokeOpacity={0.35}
          />
        ))}
        <g stroke={K.axis}>
          <line x1={P.left} x2={P.left + P.width} y1={O[1]} y2={O[1]} />
          <line x1={O[0]} x2={O[0]} y1={P.top} y2={P.top + P.height} />
        </g>
        <motion.ellipse
          cx={O[0]}
          cy={O[1]}
          {...through}
          fill="none"
          stroke={K.ink}
          strokeDasharray="4 4"
          {...fade(step === 2)}
        />
        <motion.g {...fade(step === 1)}>
          <line x1={P.left} x2={P.left + P.width} y1={here[1]} y2={here[1]} stroke={K.a} strokeDasharray="3 4" />
          <line x1={here[0]} x2={here[0]} y1={P.top} y2={P.top + P.height} stroke={K.b} strokeDasharray="3 4" />
        </motion.g>
      </Clip>

      <MathText x={P.left + P.width - 10} y={O[1] - 12} size={13} anchor="end" fill={K.muted}>
        w₁
      </MathText>
      <MathText x={O[0] + 10} y={P.top + 14} size={13} fill={K.muted}>
        w₂
      </MathText>

      <Arrow from={here} to={tip([g[0], 0])} color={K.a} width={2.5} opacity={partial} />
      <Arrow from={here} to={tip([0, g[1]])} color={K.b} width={2.5} opacity={partial} />
      <motion.g {...fade(step === 1)}>
        <MathText x={P.left + P.width - 12} y={P.top + P.height - 34} size={12} anchor="end" fill={K.a}>
          {`∂L/∂w₁ = ${fmt(g[0], 1)}`}
        </MathText>
        <MathText x={P.left + P.width - 12} y={P.top + P.height - 14} size={12} anchor="end" fill={K.b}>
          {`∂L/∂w₂ = ${fmt(g[1], 1)}`}
        </MathText>
      </motion.g>

      <Arrow from={here} to={tip(g)} color={K.ink} width={2.5} opacity={step === 2 ? 1 : 0} />
      <Arrow from={here} to={tip(scale(g, -1))} color={K.out} width={2.5} opacity={step === 2 ? 1 : 0} />
      <motion.g {...fade(step === 2, 0.3)}>
        <MathText x={tip(g)[0] + 10} y={tip(g)[1] + 2} size={13}>
          ∇L
        </MathText>
        <MathText x={tip(scale(g, -1))[0] + 4} y={tip(scale(g, -1))[1] + 14} size={13} fill={K.outInk}>
          −∇L
        </MathText>
      </motion.g>

      <Descent path={BOWL.slow} color={K.out} show={step === 3 || step === 5} />
      <Descent path={BOWL.fast} color={K.b} show={step === 4} />
      <circle cx={here[0]} cy={here[1]} r={5} fill={K.ink} />
      <circle cx={O[0]} cy={O[1]} r={3} fill={K.a} />
    </Figure>
  );
}
