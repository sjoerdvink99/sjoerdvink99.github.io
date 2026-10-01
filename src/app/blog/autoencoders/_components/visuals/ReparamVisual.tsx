"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { EPS, MU, SIGMA, fmtVec, normal, reparam, type Vec2 } from "../model";
import {
  Axes,
  Button,
  Figure,
  K,
  Label,
  MathText,
  Sym,
  fade,
  plane,
  useMotion,
} from "../svg";

const CODE = `std = torch.exp(0.5 * logvar)
epsilon = torch.randn_like(std)
z = mu + std * epsilon`;

const FOCUS: Focus[][] = [
  [],
  [0],
  [1],
  [[2, "std * epsilon"]],
  [[2, "z = mu +"]],
  [2],
  [1, 2],
];

const PL = plane({ x: [-3, 3], y: [-3, 3] }, 82, 6, 46);
const ONE: Vec2 = [1, 1];
const ORIGIN: Vec2 = [0, 0];

function Node({
  x,
  y,
  children,
  color = K.x,
  r = 15,
}: {
  x: number;
  y: number;
  children: string;
  color?: string;
  r?: number;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="#fff"
        stroke={color}
        strokeWidth={1.25}
      />
      <Sym x={x} y={y} size={14} fill={color}>
        {children}
      </Sym>
    </g>
  );
}

function Edge({
  d,
  color = "#c4c9d1",
  width = 1.25,
  dashed = false,
}: {
  d: string;
  color?: string;
  width?: number;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? "4 4" : undefined}
      strokeLinecap="round"
    />
  );
}

function DirectGraph({ blocked }: { blocked: boolean }) {
  return (
    <g>
      <Edge d="M 115 330 C 160 330, 170 362, 205 362" />
      <Edge d="M 115 396 C 160 396, 170 362, 205 362" />
      <Edge d="M 275 362 H 338" />
      <rect
        x={205}
        y={344}
        width={70}
        height={36}
        rx={8}
        fill="#f3f4f6"
        stroke="#9ca3af"
      />
      <Label x={240} y={362} size={12} fill={K.x}>
        sample
      </Label>
      <Node x={100} y={330} color={K.z}>
        μ
      </Node>
      <Node x={100} y={396} color={K.opInk}>
        σ
      </Node>
      <Node x={354} y={362} color={K.z}>
        z
      </Node>
      <motion.g {...fade(blocked)}>
        <Edge d="M 336 372 H 280" color={K.grad} width={2} />
        <path
          d="M 226 348 l 28 28 M 254 348 l -28 28"
          stroke={K.grad}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Label x={240} y={404} size={11} fill={K.grad}>
          no gradient through a random draw
        </Label>
      </motion.g>
    </g>
  );
}

function ReparamGraph({ flowing }: { flowing: boolean }) {
  return (
    <g>
      <Edge d="M 115 322 H 244" />
      <Edge d="M 115 388 H 176" />
      <Edge d="M 190 430 V 403" dashed />
      <Edge d="M 204 388 C 226 388, 244 360, 252 338" />
      <Edge d="M 274 322 H 338" />
      <circle cx={190} cy={388} r={13} fill="#fff" stroke={K.muted} />
      <Label x={190} y={388} size={13} fill={K.x}>
        ×
      </Label>
      <circle cx={259} cy={322} r={13} fill="#fff" stroke={K.muted} />
      <Label x={259} y={322} size={13} fill={K.x}>
        +
      </Label>
      <Node x={100} y={322} color={K.z}>
        μ
      </Node>
      <Node x={100} y={388} color={K.opInk}>
        σ
      </Node>
      <Node x={190} y={444} r={12}>
        ε
      </Node>
      <Label x={210} y={444} size={11} fill={K.muted} anchor="start">
        random, but outside the path
      </Label>
      <Node x={354} y={322} color={K.z}>
        z
      </Node>
      <motion.g {...fade(flowing)}>
        <Edge d="M 336 312 H 276" color={K.grad} width={2} />
        <Edge d="M 244 312 H 118" color={K.grad} width={2} />
        <Edge
          d="M 250 346 C 242 368, 226 378, 206 378"
          color={K.grad}
          width={2}
        />
        <Edge d="M 176 378 H 118" color={K.grad} width={2} />
        <MathText x={180} y={300} size={12} fill={K.grad} anchor="middle">
          ∂z/∂μ = 1
        </MathText>
        <MathText x={146} y={366} size={12} fill={K.grad} anchor="middle">
          ∂z/∂σ = ε
        </MathText>
      </motion.g>
    </g>
  );
}

export default function ReparamVisual() {
  const motionFor = useMotion();
  const { step } = useStage();
  const [draws, setDraws] = useState<Vec2[]>([]);
  const live = step >= 6;
  const eps = live && draws.length ? draws[draws.length - 1] : EPS;
  const scaled: Vec2 = [SIGMA[0] * eps[0], SIGMA[1] * eps[1]];
  const z = reparam(MU, SIGMA, eps);

  const shape =
    step <= 2
      ? { c: ORIGIN, r: ONE }
      : step === 3
        ? { c: ORIGIN, r: SIGMA }
        : { c: MU, r: SIGMA };
  const point = step <= 2 ? eps : step === 3 ? scaled : z;
  const pointLabel = step <= 2 ? "ε" : step === 3 ? "σ ⊙ ε" : "z";

  const sample = () =>
    setDraws((d) => [...d.slice(-40), normal(d.length + 101)]);

  return (
    <Figure
      viewBox="0 0 440 460"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      label="The reparameterization trick. A standard normal sample epsilon is scaled by sigma and shifted by mu to produce z. Because the randomness enters from outside, gradients reach mu and sigma."
      controls={
        <Button onClick={sample} hidden={!live}>
          Draw a new ε
        </Button>
      }
    >
      <Axes pl={PL} names={["z", "z"]} ticks={false} />

      <ellipse
        cx={PL.px(MU[0])}
        cy={PL.py(MU[1])}
        rx={SIGMA[0] * PL.k}
        ry={SIGMA[1] * PL.k}
        fill={K.z}
        fillOpacity={0.07}
        stroke={K.z}
        strokeOpacity={0.5}
        strokeDasharray="4 4"
      />
      <circle cx={PL.px(MU[0])} cy={PL.py(MU[1])} r={2.5} fill={K.z} />
      <Sym x={PL.px(MU[0]) + 2} y={PL.py(MU[1]) - 12} size={13} fill={K.z}>
        μ
      </Sym>

      {live &&
        draws.slice(0, -1).map((d, i) => {
          const p = PL.p(reparam(MU, SIGMA, d));
          return (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r={2.2}
              fill={K.z}
              opacity={0.35}
            />
          );
        })}

      <motion.ellipse
        initial={false}
        animate={{
          cx: PL.px(shape.c[0]),
          cy: PL.py(shape.c[1]),
          rx: shape.r[0] * PL.k,
          ry: shape.r[1] * PL.k,
          opacity: step >= 2 ? 1 : 0,
        }}
        transition={motionFor.spring()}
        fill="none"
        stroke={K.x}
        strokeWidth={1.25}
      />
      <motion.g {...fade(step === 2)}>
        <MathText
          x={PL.px(0) - 4}
          y={PL.py(-1) + 14}
          size={12}
          fill={K.muted}
          anchor="middle"
        >
          N(0, I)
        </MathText>
      </motion.g>

      <motion.g {...fade(step >= 3)}>
        <circle
          cx={PL.px(eps[0])}
          cy={PL.py(eps[1])}
          r={3}
          fill="#fff"
          stroke={K.muted}
        />
        <line
          x1={PL.px(eps[0])}
          y1={PL.py(eps[1])}
          x2={PL.px(scaled[0])}
          y2={PL.py(scaled[1])}
          stroke={K.muted}
          strokeDasharray="2 3"
        />
      </motion.g>
      <motion.g {...fade(step >= 4)}>
        <circle
          cx={PL.px(scaled[0])}
          cy={PL.py(scaled[1])}
          r={3}
          fill="#fff"
          stroke={K.muted}
        />
        <line
          x1={PL.px(scaled[0])}
          y1={PL.py(scaled[1])}
          x2={PL.px(z[0])}
          y2={PL.py(z[1])}
          stroke={K.muted}
          strokeDasharray="2 3"
        />
        <line
          x1={PL.px(0)}
          y1={PL.py(0)}
          x2={PL.px(MU[0])}
          y2={PL.py(MU[1])}
          stroke={K.z}
          strokeOpacity={0.5}
        />
      </motion.g>

      <motion.g
        initial={false}
        animate={{
          x: PL.px(point[0]),
          y: PL.py(point[1]),
          opacity: step >= 2 ? 1 : 0,
        }}
        transition={motionFor.spring()}
      >
        <circle r={5} fill={step >= 4 ? K.z : K.x} />
        <MathText x={9} y={-11} size={13} fill={step >= 4 ? K.z : K.x}>
          {pointLabel}
        </MathText>
      </motion.g>

      <g>
        <motion.g {...fade(step >= 1)}>
          <MathText
            x={PL.box.x + 10}
            y={PL.box.y + 16}
            size={12}
            fill={K.opInk}
          >
            σ
          </MathText>
          <Label
            x={PL.box.x + 22}
            y={PL.box.y + 16}
            size={11}
            fill={K.opInk}
            anchor="start"
            mono
          >
            {`= ${fmtVec(SIGMA, 2)}`}
          </Label>
        </motion.g>
        <motion.g {...fade(step >= 2)}>
          <MathText x={PL.box.x + 10} y={PL.box.y + 34} size={12}>
            ε
          </MathText>
          <Label
            x={PL.box.x + 22}
            y={PL.box.y + 34}
            size={11}
            fill={K.x}
            anchor="start"
            mono
          >
            {`= ${fmtVec(eps, 2)}`}
          </Label>
        </motion.g>
        <motion.g {...fade(step >= 4)}>
          <MathText x={PL.box.x + 10} y={PL.box.y + 52} size={12} fill={K.z}>
            z
          </MathText>
          <Label
            x={PL.box.x + 22}
            y={PL.box.y + 52}
            size={11}
            fill={K.z}
            anchor="start"
            mono
          >
            {`= ${fmtVec(z, 2)}`}
          </Label>
        </motion.g>
      </g>

      <motion.g {...fade(step === 0)}>
        <DirectGraph blocked={step === 0} />
      </motion.g>
      <motion.g {...fade(step >= 1)}>
        <ReparamGraph flowing={step >= 5} />
      </motion.g>
    </Figure>
  );
}
