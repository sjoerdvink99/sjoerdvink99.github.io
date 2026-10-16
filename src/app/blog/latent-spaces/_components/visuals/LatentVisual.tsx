"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label, Sym, fade } from "@/components/blog/svg";
import { ATLAS, TOUR, decode, fmt, type Vec } from "../model";
import { Arrow, Clip, Dot, Face, Grid, Hint, K, Num, Pad, plane } from "../svg";

const CODE = `z = torch.randn(2)
face = decoder(z)

ticks = torch.linspace(-2.4, 2.4, 7)
faces = decoder(torch.cartesian_prod(ticks, ticks))`;

const FOCUS: Focus[][] = [[0, 1], [3, 4], [3, 4], [1]];
const ATLAS_OPACITY = [0, 1, 1, 0.25];

const P = plane({ x: [-3, 3], y: [-3, 3], unit: 38, left: 6, top: 8 });
const FACE = { x: 356, y: 104, r: 54 };
const onAxis = (z: Vec) => Math.abs(z[0]) < 0.01 || Math.abs(z[1]) < 0.01;

export default function LatentVisual() {
  const { step } = useStage();
  const [free, setFree] = useState<Vec>(TOUR[2]);
  const dragging = step === 3;
  const z = dragging ? free : TOUR[Math.min(step, TOUR.length - 1)];
  const look = decode(z);
  const duration = dragging ? 0 : undefined;

  return (
    <Figure
      viewBox="0 0 460 246"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      interactive={dragging}
      label="A square latent space on the left. Every point in it is turned by the decoder into a face, shown on the right. Faces drawn at a grid of points change smoothly from one corner to the other, and moving along either axis changes both the smile and the eyes at once."
      controls={<Hint hidden={!dragging}>Drag in the square, or focus it and use the arrow keys.</Hint>}
    >
      <Grid plane={P} />
      <Clip plane={P}>
        {ATLAS.map((a, i) => (
          <Face
            key={i}
            look={decode(a)}
            x={P.px(a[0])}
            y={P.py(a[1])}
            r={11}
            opacity={step === 2 && !onAxis(a) ? 0.18 : ATLAS_OPACITY[step]}
          />
        ))}
      </Clip>

      <motion.g {...fade(step === 2)}>
        <Arrow from={P.at([0, 0])} to={P.at([2.85, 0])} color={K.amber} width={1.75} />
        <Arrow from={P.at([0, 0])} to={P.at([0, 2.85])} color={K.amber} width={1.75} />
        <Sym x={P.px(2.7)} y={P.py(0) + 14} sub="1" size={14} fill={K.amberInk}>
          z
        </Sym>
        <Sym x={P.px(0) - 14} y={P.py(2.7)} sub="2" size={14} fill={K.amberInk}>
          z
        </Sym>
      </motion.g>

      <Dot at={P.at(z)} color={K.rose} r={5} duration={duration} />

      <Arrow from={[P.left + P.width + 12, FACE.y]} to={[FACE.x - FACE.r - 12, FACE.y]} color={K.muted} width={1.5} head={6} />
      <Sym x={(P.left + P.width + FACE.x - FACE.r) / 2} y={FACE.y - 14} size={15} fill={K.muted}>
        g
      </Sym>

      <Face look={look} x={FACE.x} y={FACE.y} r={FACE.r} duration={duration} />

      <Label x={FACE.x} y={FACE.y + FACE.r + 24} size={12} fill={K.ink} mono>
        {`z = [${fmt(z[0], 1)}, ${fmt(z[1], 1)}]`}
      </Label>
      <Label x={FACE.x - 30} y={FACE.y + FACE.r + 46} size={11}>
        smile
      </Label>
      <Num x={FACE.x - 30} y={FACE.y + FACE.r + 62} value={look.smile} size={12} duration={duration} />
      <Label x={FACE.x + 30} y={FACE.y + FACE.r + 46} size={11}>
        eyes
      </Label>
      <Num x={FACE.x + 30} y={FACE.y + FACE.r + 62} value={look.eyes} size={12} duration={duration} />

      <Pad plane={P} value={free} onChange={setFree} active={dragging} label="Latent point z" />
    </Figure>
  );
}
