"use client";

import { useState } from "react";
import { useStage } from "@/components/blog/ScrollStage";
import { Code, type Focus } from "@/components/blog/Code";
import { Figure, Label } from "@/components/blog/svg";
import { NEXT, softmax, sum } from "../model";
import { At, K, Num, Slider, VBar } from "../svg";

const CODE = `logits = np.array([${NEXT.logits.map((v) => v.toFixed(1)).join(", ")}])
e = np.exp(logits / T)
p = e / e.sum()`;

const FOCUS: Focus[][] = [[0], [1], [2], [[1, "/ T"]]];

const CENTERS = [125, 195, 265, 335];
const WIDTH = 46;
const HEIGHT = 128;
const TOKENS_Y = 192;

const STAGES = [
  { name: "logits", base: 130, k: 26, digits: 1 },
  { name: "exp(logit)", base: 168, k: HEIGHT / Math.max(...NEXT.exps), digits: 2 },
  { name: "probability", base: 168, k: HEIGHT, digits: 2 },
  { name: "probability", base: 168, k: HEIGHT, digits: 2 },
];

export default function SoftmaxVisual() {
  const { step } = useStage();
  const [temperature, setTemperature] = useState(1);
  const stage = STAGES[step];
  const values =
    step === 0 ? NEXT.logits : step === 1 ? NEXT.exps : softmax(NEXT.logits, step === 3 ? temperature : 1);
  const total = sum(values);

  return (
    <Figure
      viewBox="0 0 460 206"
      top={<Code code={CODE} focus={FOCUS[step]} />}
      interactive={step === 3}
      label="Four candidate next words with their scores. Exponentiating makes every score positive, and dividing by the total turns them into probabilities that sum to one. A temperature sharpens or flattens the distribution."
      controls={
        <Slider
          label="T"
          value={temperature}
          min={0.25}
          max={3}
          step={0.05}
          onChange={setTemperature}
          display={temperature.toFixed(2)}
          hidden={step !== 3}
        />
      }
    >
      <Label x={16} y={14} size={12} anchor="start" fill={K.muted}>
        the cat sat on the …
      </Label>
      <Label x={444} y={14} size={12} anchor="end" fill={K.ink} weight={600}>
        {stage.name}
      </Label>

      <At x={0} y={stage.base}>
        <line x1={92} x2={368} y1={0} y2={0} stroke={K.axis} strokeWidth={1.5} />
      </At>

      {NEXT.tokens.map((token, i) => {
        const v = values[i];
        const top = v < 0 ? stage.base + Math.abs(v) * stage.k + 11 : stage.base - v * stage.k - 11;
        return (
          <g key={token}>
            <VBar
              x={CENTERS[i] - WIDTH / 2}
              base={stage.base}
              value={v}
              k={stage.k}
              width={WIDTH}
              fill={i === 0 ? K.green : v < 0 ? K.b : K.ink}
              opacity={i === 0 ? 1 : 0.75}
            />
            <At x={CENTERS[i]} y={top}>
              <Num x={0} y={0} value={v} digits={stage.digits} size={12} fill={K.ink} />
            </At>
            <Label x={CENTERS[i]} y={TOKENS_Y} size={12} fill={K.ink} weight={i === 0 ? 600 : undefined}>
              {token}
            </Label>
          </g>
        );
      })}

      {step >= 1 && (
        <Label x={444} y={34} size={11} anchor="end">
          {`sum = ${total.toFixed(2)}`}
        </Label>
      )}
    </Figure>
  );
}
