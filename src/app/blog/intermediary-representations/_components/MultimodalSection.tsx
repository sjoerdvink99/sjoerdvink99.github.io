"use client";

import { useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { ScrollStage, Step, useStage } from "@/components/blog/ScrollStage";
import { TransformArrow } from "@/components/blog/TransformArrow";
import { C } from "@/components/blog/palette";
import { round } from "@/components/blog/random";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { DogScene, SCENE_H, SCENE_W, STICK } from "./DogScene";
import { ChapterLabel } from "./chapters";

const IMG = { x: 0, y: 132, w: SCENE_W, h: SCENE_H };
const PATCH = 40;
const COLS = SCENE_W / PATCH;
const PATCHES = COLS * (SCENE_H / PATCH);
const CHIP = { y: 34, h: 28, gap: 6 };

type Region = "dog" | "stick" | "ground";

const REGIONS: Record<Region, number[]> = {
  dog: [7, 9, 10, 13, 14, 15, 16, 19, 20, 21, 25, 26, 27],
  stick: [16, 17],
  ground: [24, 25, 26, 27, 28, 29],
};

const HEAD = [9, 10, 16];
const LEGS = [19, 20, 21];

function weights(parts: [number[], number][]) {
  const raw = Array.from({ length: PATCHES }, (_, p) =>
    parts.reduce((w, [patches, v]) => w + (patches.includes(p) ? v : 0), 0.1)
  );
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((w) => w / sum);
}

const UNIFORM = weights([]);

const ATTENTION: Record<string, number[]> = {
  dog: weights([
    [REGIONS.dog, 3],
    [REGIONS.stick, 0.5],
  ]),
  holding: weights([
    [REGIONS.stick, 6],
    [HEAD, 2],
  ]),
  standing: weights([
    [REGIONS.ground, 3],
    [[25, 26, 27], 2],
    [LEGS, 2],
  ]),
  on: weights([
    [REGIONS.ground, 4],
    [[25, 26, 27], 2],
  ]),
};

const QUESTIONS = {
  original: ["What", "is", "the", "dog", "holding", "?"],
  edited: ["What", "is", "the", "dog", "standing", "on", "?"],
};

const BRUSH: Record<Region, string> = {
  stick: `M ${STICK.x1 - 2} ${STICK.y1 + 3} Q 200 ${STICK.y2 + 6} ${STICK.x2 + 2} ${STICK.y2}`,
  dog: "M 62 114 Q 106 98 152 106",
  ground: "M 24 182 Q 120 176 216 182",
};

const attentionOf = (token: string) =>
  ATTENTION[token.toLowerCase()] ?? UNIFORM;

const patchCenter = (p: number) => ({
  x: IMG.x + ((p % COLS) + 0.5) * PATCH,
  y: IMG.y + (Math.floor(p / COLS) + 0.5) * PATCH,
});

function centroid(w: number[]) {
  const sq = w.map((v) => v * v);
  const total = sq.reduce((a, b) => a + b, 0);
  return sq.reduce(
    (c, v, p) => {
      const { x, y } = patchCenter(p);
      return { x: c.x + (x * v) / total, y: c.y + (y * v) / total };
    },
    { x: 0, y: 0 }
  );
}

function chips(tokens: string[]) {
  let x = 0;
  return tokens.map((t) => {
    const w = round(t.length * 8.6 + 16);
    const chip = { t, x, w };
    x += w + CHIP.gap;
    return chip;
  });
}

type View =
  | { mode: "none" }
  | { mode: "forward"; token: number }
  | { mode: "reverse"; region: Region };

const DEFAULTS: View[] = [
  { mode: "none" },
  { mode: "forward", token: 4 },
  { mode: "reverse", region: "stick" },
  { mode: "forward", token: 4 },
  { mode: "forward", token: 4 },
];

function pressable(enabled: boolean, label: string, onPress: () => void) {
  if (!enabled) return {};
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    onClick: onPress,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPress();
      }
    },
  };
}

function Affordances({ y, items, strong }: { y: number; items: string; strong: boolean }) {
  return (
    <motion.text
      x={0}
      y={y}
      fontSize={10}
      letterSpacing="0.14em"
      fill={C.human}
      initial={false}
      animate={{ opacity: strong ? 1 : 0.45 }}
    >
      {items.toUpperCase()}
    </motion.text>
  );
}

function CrossAttention() {
  const { step } = useStage();
  const [picked, setPicked] = useState<{ step: number; view: View } | null>(null);

  const interactive = step >= 4;
  const edited = step >= 3;
  const tokens = edited ? QUESTIONS.edited : QUESTIONS.original;
  const row = chips(tokens);
  const view =
    picked && picked.step === step ? picked.view : DEFAULTS[Math.min(step, DEFAULTS.length - 1)];
  const pick = (v: View) => setPicked({ step, view: v });

  const heat =
    view.mode === "forward" ? attentionOf(tokens[view.token]) : null;
  const scores =
    view.mode === "reverse"
      ? tokens.map((t) =>
          REGIONS[view.region].reduce((s, p) => s + attentionOf(t)[p], 0)
        )
      : null;
  const best = scores ? Math.max(...scores) : 1;

  const chipBottom = (i: number) =>
    [row[i].x + row[i].w / 2, CHIP.y + CHIP.h + 4] as [number, number];

  const arrows: { key: string; from: [number, number]; to: [number, number]; width: number }[] = [];
  if (view.mode === "forward" && heat) {
    const c = centroid(heat);
    arrows.push({
      key: `f-${tokens[view.token]}`,
      from: chipBottom(view.token),
      to: [round(c.x), round(c.y)],
      width: 2,
    });
  }
  if (view.mode === "reverse" && scores) {
    const c = centroid(
      Array.from({ length: PATCHES }, (_, p) => (REGIONS[view.region].includes(p) ? 1 : 0))
    );
    scores.forEach((s, i) => {
      if (s / best > 0.3)
        arrows.push({
          key: `r-${view.region}-${tokens[i]}`,
          from: [round(c.x), round(c.y - 14)],
          to: chipBottom(i),
          width: 0.75 + (s / best) * 1.5,
        });
    });
  }

  return (
    <svg
      viewBox="-8 0 364 368"
      className="mx-auto block w-full max-w-[28rem]"
      role="group"
      aria-label="Cross-attention between a question in text space and an image in image space"
    >
      <text x={0} y={20} fontSize={10} letterSpacing="0.14em" fill={C.spaceInk}>
        TEXT SPACE
      </text>
      {row.map((c, i) => {
        const isEdit = edited && (c.t === "standing" || c.t === "on");
        const active = view.mode === "forward" && view.token === i;
        const score = scores ? scores[i] / best : null;
        return (
          <g
            key={`${c.t}-${i}`}
            className={interactive ? "cursor-pointer outline-none [&:focus-visible>rect]:[stroke:#e11d48]" : undefined}
            {...pressable(interactive, `Show where “${c.t}” attends in the image`, () =>
              pick({ mode: "forward", token: i })
            )}
          >
            <rect
              x={c.x}
              y={CHIP.y}
              width={c.w}
              height={CHIP.h}
              rx={6}
              fill="#fff"
              stroke={active || (score ?? 0) > 0.3 ? C.transform : C.faint}
              strokeWidth={active || (score ?? 0) > 0.3 ? 1.5 : 1}
            />
            <motion.text
              x={c.x + c.w / 2}
              y={CHIP.y + CHIP.h / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={16}
              className="font-math"
              fill={isEdit ? C.human : C.ink}
              initial={false}
              animate={{
                opacity:
                  view.mode === "none"
                    ? 1
                    : score !== null
                      ? 0.35 + 0.65 * score
                      : active
                        ? 1
                        : 0.45,
              }}
            >
              {c.t}
            </motion.text>
          </g>
        );
      })}
      <Affordances y={86} items="type · rewrite · select" strong={step === 0 || interactive} />

      <text x={0} y={IMG.y - 12} fontSize={10} letterSpacing="0.14em" fill={C.spaceInk}>
        IMAGE SPACE
      </text>
      <DogScene held="stick" x={IMG.x} y={IMG.y} width={IMG.w} height={IMG.h} />
      <g>
        {Array.from({ length: PATCHES }, (_, p) => (
          <motion.rect
            key={p}
            x={IMG.x + (p % COLS) * PATCH}
            y={IMG.y + Math.floor(p / COLS) * PATCH}
            width={PATCH}
            height={PATCH}
            fill={C.transform}
            stroke={C.space}
            strokeWidth={0.5}
            initial={false}
            animate={{
              fillOpacity: heat ? Math.min(0.6, heat[p] * 3) : 0,
              strokeOpacity: step >= 1 ? 0.35 : 0,
            }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </g>
      {view.mode === "reverse" && (
        <motion.path
          key={view.region}
          d={BRUSH[view.region]}
          transform={`translate(${IMG.x} ${IMG.y})`}
          stroke={C.human}
          strokeOpacity={0.45}
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {interactive && (
        <g transform={`translate(${IMG.x} ${IMG.y})`}>
          {(
            [
              ["dog", <ellipse key="d" cx={118} cy={112} rx={84} ry={46} />],
              ["ground", <rect key="g" x={8} y={164} width={224} height={30} rx={6} />],
              [
                "stick",
                <line
                  key="s"
                  {...STICK}
                  strokeWidth={22}
                  strokeLinecap="round"
                  pointerEvents="stroke"
                />,
              ],
            ] as const
          ).map(([region, shape]) => (
            <g
              key={region}
              fill="#000"
              fillOpacity={0}
              stroke={C.human}
              strokeOpacity={0}
              className="cursor-pointer outline-none focus-visible:[stroke-opacity:0.35]"
              {...pressable(true, `Brush the ${region} and show which words refer to it`, () =>
                pick({ mode: "reverse", region })
              )}
            >
              {shape}
            </g>
          ))}
        </g>
      )}
      <Affordances y={IMG.y + IMG.h + 22} items="point · brush · annotate" strong={step === 0 || interactive} />

      {arrows.map((a) => (
        <TransformArrow key={a.key} from={a.from} to={a.to} bend={-18} width={a.width} head={6} drawOnMount />
      ))}
      <motion.text
        x={IMG.x + IMG.w + 12}
        y={IMG.y + 12}
        fontSize={11}
        fill={C.transformInk}
        initial={false}
        animate={{ opacity: step >= 1 ? 1 : 0 }}
      >
        cross-attention
      </motion.text>
    </svg>
  );
}

export default function MultimodalSection() {
  return (
    <ScrollStage visual={<CrossAttention />}>
      <Step>
        <SectionHead as="h3" label={<ChapterLabel n={4} sub="Many spaces" />}>
          Different spaces afford different actions.
        </SectionHead>
        <P>
          Multimodal systems work across several spaces at once. Here there
          are two, a question in text space and a photo in image space.
        </P>
        <P>
          Text affords typing, rewriting, and selecting. Images afford
          pointing, brushing, and spatial annotation.
        </P>
      </Step>
      <Step>
        <P>
          The model connects the two spaces. In cross-attention, each word of
          the question is matched against every region of the image. The
          word <em>holding</em> attends to the stick in the dog’s mouth.
        </P>
      </Step>
      <Step>
        <P>
          The connection also runs the other way. Brush the stick, and the
          system can show which words in the question are about that region.
        </P>
      </Step>
      <Step>
        <P>
          Now act on the text. Rewrite <em>holding</em> as{" "}
          <em>standing on</em>, and the attention moves to the ground under the
          dog’s feet.
        </P>
      </Step>
      <Step>
        <KeyLine>
          Multimodal interaction is not only about accepting several kinds of
          input.
        </KeyLine>
        <div className="mt-6">
          <P>
            It connects spaces that afford different actions. Graphs afford
            editing nodes and edges. Latent spaces afford movement and
            interpolation. Formal representations afford constraints and
            verification. Correspondences such as cross-attention link them.
          </P>
          <P>Select a word or a region of the image to try it.</P>
        </div>
      </Step>
    </ScrollStage>
  );
}
