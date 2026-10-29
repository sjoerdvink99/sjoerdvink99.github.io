"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { useLevel } from "@/components/blog/Level";
import type { Focus } from "@/components/blog/Code";
import { Figure, Label, fade } from "@/components/blog/svg";
import { FORMATS, VALUES, encode, fmt, quantize, type Format } from "../model";
import { Box, Choice, ExpertCode, K } from "../svg";

const CODE = `x = torch.tensor(math.pi)
for dtype in (torch.float32, torch.bfloat16, torch.float16, torch.float8_e4m3fn):
    print(dtype, x.to(dtype).item())

with torch.autocast("cuda", dtype=torch.bfloat16):
    loss = model(batch)`;

const FOCUS: Focus[][] = [[0, 1, 2], [1, 2], [1, 2], [1, 2], [4, 5]];

const BITS = { x: 64, cell: 10 };
const VALUE = 398;
const ROW = (i: number) => 52 + i * 40;
const REVEAL = [0, 1, 2, 4, 4];
const FIELD = { sign: K.mem, exponent: K.cpu, mantissa: K.gpu };
const TOP = Math.max(...FORMATS.map((f) => f.tflops ?? 0));

const shown = (q: number) => (Number.isFinite(q) ? String(Number(q.toPrecision(7))) : "overflow");

function describe(error: number) {
  if (!Number.isFinite(error)) return "";
  return error === 0 ? "exact" : `error ${(error * 100).toPrecision(2)}%`;
}

function Row({ f, i, x, visible, speed }: { f: Format; i: number; x: number; visible: boolean; speed: boolean }) {
  const { reaches } = useLevel();
  const q = quantize(x, f);
  const bits = encode(q, f);
  const y = ROW(i);
  const fields = bits
    ? [
        ...[...bits.sign].map((b) => ({ b, kind: "sign" as const })),
        ...[...bits.exponent].map((b) => ({ b, kind: "exponent" as const })),
        ...[...bits.mantissa].map((b) => ({ b, kind: "mantissa" as const })),
      ]
    : null;
  const error = Number.isFinite(q) ? Math.abs(q - x) / Math.abs(x) : Infinity;
  const lost = q === 0 && x !== 0;

  return (
    <motion.g {...fade(visible)}>
      <Label x={0} y={y - 5} size={12} anchor="start" fill={K.ink} weight={600}>
        {f.name}
      </Label>
      <Label x={0} y={y + 10} size={9} anchor="start">
        {reaches("mechanics") ? `1·${f.e}·${f.m}` : `${1 + f.e + f.m} bits`}
      </Label>
      {(fields ?? Array.from({ length: 1 + f.e + f.m }, () => null)).map((c, k) => (
        <g key={k}>
          <rect
            x={BITS.x + k * BITS.cell}
            y={y - 9}
            width={BITS.cell - 1.5}
            height={18}
            rx={1.5}
            fill={c ? FIELD[c.kind] : K.cell}
            opacity={c ? (c.b === "1" ? 1 : 0.28) : 1}
          />
          {c && (
            <text
              x={BITS.x + k * BITS.cell + (BITS.cell - 1.5) / 2}
              y={y}
              fontSize={8}
              textAnchor="middle"
              dominantBaseline="central"
              fill={c.b === "1" ? "#fff" : K.ink}
              className="font-mono"
            >
              {c.b}
            </text>
          )}
        </g>
      ))}
      <motion.g {...fade(!speed)}>
        <Label x={VALUE} y={y - 5} size={12} anchor="start" fill={!bits || lost ? K.mem : K.ink} mono>
          {lost ? "0 (underflow)" : shown(q)}
        </Label>
        <Label x={VALUE} y={y + 10} size={9} anchor="start">
          {lost ? "" : describe(error)}
        </Label>
      </motion.g>
      <motion.g {...fade(speed)}>
        <Box x={VALUE} y={y - 6} width={speed && f.tflops ? (f.tflops / TOP) * 100 : 0} height={12} fill={K.gpu} />
        <Label x={VALUE + (f.tflops ? (f.tflops / TOP) * 100 + 5 : 0)} y={y} size={10} anchor="start" fill={K.ink}>
          {f.tflops ? fmt(f.tflops) : "Blackwell"}
        </Label>
      </motion.g>
    </motion.g>
  );
}

export default function BitsVisual() {
  const { step } = useStage();
  const { reaches } = useLevel();
  const [x, setX] = useState(VALUES[0].value);
  const speed = step === 4;
  const names = reaches("mechanics")
    ? ["sign", "exponent", "mantissa"]
    : ["sign", "scale", "precision"];

  return (
    <Figure
      viewBox="0 0 520 250"
      interactive
      top={<ExpertCode code={CODE} focus={FOCUS[step]} />}
      controls={<Choice label="value" options={VALUES} value={x} onChange={setX} hidden={speed} />}
      label="The same number stored in FP32, BF16, FP16, FP8 and FP4. Each format splits its bits into a sign, an exponent and a mantissa. Fewer bits round the number more coarsely, and small exponents overflow or underflow."
    >
      {Object.values(FIELD).map((fill, k) => (
        <g key={k}>
          <rect x={BITS.x + k * 90} y={8} width={10} height={10} rx={2} fill={fill} />
          <Label x={BITS.x + k * 90 + 16} y={13} size={10} anchor="start">
            {names[k]}
          </Label>
        </g>
      ))}
      <Label x={VALUE} y={13} size={10} anchor="start" fill={K.ink} weight={600}>
        {speed ? (reaches("mechanics") ? "H100 dense TFLOP/s" : "speed on one GPU") : "stored as"}
      </Label>
      {FORMATS.map((f, i) => (
        <Row key={f.name} f={f} i={i} x={x} visible={i <= REVEAL[step]} speed={speed} />
      ))}
    </Figure>
  );
}
