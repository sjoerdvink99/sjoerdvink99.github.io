"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import { ScrollStage, Step, useStage } from "@/components/blog/ScrollStage";
import { Space, SPACE_H, SPACE_W } from "@/components/blog/Space";
import { StateMarker } from "@/components/blog/StateMarker";
import { TransformArrow } from "@/components/blog/TransformArrow";
import { Eq, SvgEq } from "@/components/blog/Eq";
import { Tag } from "@/components/blog/Tag";
import { C } from "@/components/blog/palette";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { DogScene } from "./DogScene";
import { Face } from "./Face";
import { Bridge, ChapterLabel } from "./chapters";

function Brush({ done }: { done: boolean }) {
  return (
    <DogScene held={done ? "ball" : "stick"} className="w-full max-w-[9.5rem]">
      <motion.path
        d="M166 106 Q 200 90 234 84"
        stroke={C.human}
        strokeOpacity={0.4}
        strokeWidth={18}
        strokeLinecap="round"
        fill="none"
        initial={false}
        animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />
    </DogScene>
  );
}

function Prompt({ done }: { done: boolean }) {
  return (
    <div className="space-y-3">
      <p className="font-math text-lg text-ir-ink">
        A dog with a{" "}
        <span
          className={`transition-colors duration-500 ${done ? "text-ir-human" : ""}`}
        >
          {done ? "ball" : "stick"}
        </span>
        .
      </p>
      <motion.p
        className="inline-block rounded-full bg-ir-human-soft px-3 py-1 text-sm text-ir-human"
        initial={false}
        animate={{ opacity: done ? 1 : 0, y: done ? 0 : 6 }}
      >
        make it a ball
      </motion.p>
    </div>
  );
}

function Slider({ done }: { done: boolean }) {
  const a = { x: 80, y: 170 };
  const b = { x: 270, y: 90 };
  return (
    <div className="max-w-[10rem]">
      <svg
        viewBox={`-20 -20 ${SPACE_W + 40} ${SPACE_H + 40}`}
        className="block w-full"
      >
        <Space kind="latent">
          <TransformArrow
            from={[a.x, a.y]}
            to={[b.x, b.y]}
            visible={done}
            width={2.5}
            head={12}
          />
          <StateMarker x={done ? b.x : a.x} y={done ? b.y : a.y} size={9} />
        </Space>
      </svg>
      <div className="relative mt-3 h-[2px] bg-gray-300">
        <motion.span
          className="absolute -top-[5px] h-3 w-3 rounded-full bg-ir-human"
          initial={false}
          animate={{ left: done ? "85%" : "10%" }}
          transition={{ type: "spring", stiffness: 80, damping: 16 }}
        />
      </div>
    </div>
  );
}

function StructuredEdit({ done }: { done: boolean }) {
  return (
    <p className="font-math text-lg text-ir-ink">
      <span className="italic">holds</span>(dog,{" "}
      <span
        className={`inline-block rounded border px-1.5 transition-colors duration-500 ${
          done
            ? "border-ir-human bg-ir-human-soft text-ir-human"
            : "border-dashed border-gray-300"
        }`}
      >
        {done ? "ball" : "stick"}
      </span>
      )
    </p>
  );
}

const EXAMPLES: {
  name: string;
  space: string;
  view: (p: { done: boolean }) => ReactNode;
}[] = [
  { name: "brush stroke", space: "image space", view: Brush },
  { name: "prompt", space: "text space", view: Prompt },
  { name: "slider", space: "latent space", view: Slider },
  { name: "structured edit", space: "formal space", view: StructuredEdit },
];

function FourInteractions() {
  const { step } = useStage();
  const unified = step >= 5;

  return (
    <div className="mx-auto max-w-[36rem]">
      <div className="grid grid-cols-2 gap-x-10 gap-y-12">
        {EXAMPLES.map((ex, i) => {
          const done = step > i;
          const active = step === i + 1 || unified;
          const View = ex.view;
          return (
            <motion.div
              key={ex.name}
              initial={false}
              animate={{ opacity: active ? 1 : done ? 0.45 : 0.25 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 flex flex-col gap-0.5 md:flex-row md:items-baseline md:justify-between md:gap-2">
                <Tag tone="human">{ex.name}</Tag>
                <Tag tone="space">{ex.space}</Tag>
              </div>
              <div className="flex min-h-[7.5rem] items-center">
                <View done={done} />
              </div>
              <motion.p
                className="mt-3 text-ir-ink-muted"
                initial={false}
                animate={{ opacity: done && !unified ? 1 : 0 }}
              >
                <Eq>r → r′</Eq>
              </motion.p>
            </motion.div>
          );
        })}
      </div>
      <motion.div
        className="mt-6 text-center text-3xl text-ir-ink"
        initial={false}
        animate={{ opacity: unified ? 1 : 0, scale: unified ? 1 : 0.9 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        <Eq>r → r′</Eq>
      </motion.div>
    </div>
  );
}

function Meter({
  y,
  label,
  value,
  off,
}: {
  y: number;
  label: string;
  value: number;
  off: boolean;
}) {
  return (
    <g>
      <text x={156} y={y + 4} fontSize={13} fill={off ? C.muted : C.ink}>
        {label}
      </text>
      <rect x={196} y={y - 2} width={56} height={4} rx={2} fill={C.faint} />
      <rect
        x={196}
        y={y - 2}
        width={56 * value}
        height={4}
        rx={2}
        fill={C.ink}
      />
    </g>
  );
}

function Mapping({
  preserveAge,
  notation,
  smile,
  age,
}: {
  preserveAge: boolean;
  notation: boolean;
  smile: number;
  age: number;
}) {
  return (
    <div>
      <svg
        viewBox="0 0 260 170"
        className="block w-full max-w-[17rem]"
        role="img"
        aria-label={
          preserveAge
            ? "The slider now controls smile only"
            : "The slider controls smile and age"
        }
      >
        <text x={4} y={70} fontSize={13} fill={C.human}>
          slider
        </text>
        <TransformArrow from={[50, 62]} to={[146, 36]} bend={-8} />
        <TransformArrow
          from={[50, 72]}
          to={[146, 104]}
          bend={8}
          visible={!preserveAge}
        />
        <motion.path
          d="M 50 72 Q 101 94 146 104"
          fill="none"
          stroke={C.faint}
          strokeDasharray="3 4"
          initial={false}
          animate={{ opacity: preserveAge ? 1 : 0 }}
        />
        <motion.g initial={false} animate={{ opacity: notation ? 1 : 0 }}>
          <SvgEq x={96} y={69} anchor="middle" size={16} fill={C.transformInk}>
            {preserveAge ? "T′" : "T"}
          </SvgEq>
        </motion.g>
        <Meter y={36} label="smile" value={smile} off={false} />
        <Meter y={104} label="age" value={age} off={preserveAge} />
        <motion.g
          initial={false}
          animate={{ opacity: preserveAge ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <path
            d="M 96 90 l 8 8 m 0 -8 l -8 8"
            stroke={C.human}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={100}
            y1={104}
            x2={100}
            y2={136}
            stroke={C.human}
            strokeWidth={1.25}
            strokeDasharray="3 4"
          />
          <text
            x={100}
            y={156}
            textAnchor="middle"
            fontSize={15}
            fontStyle="italic"
            fill={C.human}
            className="font-math"
          >
            “Preserve age.”
          </text>
        </motion.g>
      </svg>
      <p className="mt-2 text-sm text-ir-ink-muted">
        The slider changes{" "}
        <span className="text-ir-ink">
          {preserveAge ? "smile only" : "smile and age"}
        </span>
        .
      </p>
    </div>
  );
}

const startOf = (step: number) =>
  step >= 2 ? { smile: 0.55, age: 0.55 } : { smile: 0.2, age: 0.2 };

function EditTransformation() {
  const { step } = useStage();
  const reduce = useReducedMotion();
  const preserveAge = step >= 2;
  const notation = step >= 4;
  const [stored, setStored] = useState({ step, ...startOf(step) });
  const face = stored.step === step ? stored : { step, ...startOf(step) };
  const playback = useRef<AnimationPlaybackControls | null>(null);

  const drag = (smile: number) =>
    setStored((prev) => {
      const f = prev.step === step ? prev : startOf(step);
      return {
        step,
        smile,
        age: preserveAge
          ? f.age
          : Math.min(1, Math.max(0, f.age + smile - f.smile)),
      };
    });

  const play = useEffectEvent(() =>
    animate(face.smile, [face.smile, 1, 0.55], {
      duration: reduce ? 0 : 2.6,
      delay: reduce ? 0 : 0.4,
      ease: "easeInOut",
      onUpdate: drag,
    })
  );

  useEffect(() => {
    if (step !== 1 && step !== 3) return;
    playback.current = play();
    return () => playback.current?.stop();
  }, [step]);

  const heads = [
    {
      tone: "rep" as const,
      title: "Edit the state",
      eq: "r → r′",
      note: "changes this face",
    },
    {
      tone: "transform" as const,
      title: "Edit the transformation",
      eq: "T → T′",
      note: "changes what every future drag does",
    },
  ];

  return (
    <div className="mx-auto max-w-[36rem]">
      <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] items-center gap-6 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] md:gap-8">
        <Face smile={face.smile} age={face.age} className="w-full" />
        <Mapping
          preserveAge={preserveAge}
          notation={notation}
          smile={face.smile}
          age={face.age}
        />
      </div>

      <label className="mt-6 flex items-center gap-4">
        <span className="text-sm text-ir-human">slider</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={face.smile}
          onPointerDown={() => playback.current?.stop()}
          onKeyDown={() => playback.current?.stop()}
          onChange={(e) => drag(Number(e.target.value))}
          className="ir-range flex-1"
        />
      </label>

      <motion.div
        className="mt-8 grid grid-cols-2 gap-6 md:gap-8"
        initial={false}
        animate={{ opacity: notation ? 1 : 0, y: notation ? 0 : 8 }}
        aria-hidden={!notation}
      >
        {heads.map((h) => (
          <div key={h.title}>
            <Tag tone={h.tone}>{h.title}</Tag>
            <p className="mt-2 text-xl text-ir-ink">
              <Eq>{h.eq}</Eq>
            </p>
            <p className="mt-1 text-sm text-ir-ink-muted">{h.note}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function InteractionSection() {
  return (
    <>
      <ScrollStage visual={<FourInteractions />}>
        <Step>
          <SectionHead label={<ChapterLabel n={4} />}>
            Interaction lets people take part in transformations.
          </SectionHead>
          <P>
            Consider four familiar interface techniques. At first they look
            unrelated.
          </P>
        </Step>
        <Step>
          <P>A brush stroke changes an image.</P>
        </Step>
        <Step>
          <P>A prompt changes a piece of text.</P>
        </Step>
        <Step>
          <P>Dragging a slider moves a point through a latent space.</P>
        </Step>
        <Step>
          <P>
            A structured edit changes a formal expression, and the result is
            still well formed.
          </P>
        </Step>
        <Step>
          <KeyLine>Four techniques, one structure.</KeyLine>
          <div className="mt-6">
            <P>
              Each takes a representation <Eq>r</Eq> and produces a new one,{" "}
              <Eq>r′</Eq>. The technique is how a person specifies which
              transformation to apply.
            </P>
          </div>
        </Step>
      </ScrollStage>

      <Bridge>
        <p>
          So far every technique has changed a representation. A person can
          also change the transformation itself.
        </p>
      </Bridge>

      <ScrollStage visual={<EditTransformation />}>
        <Step>
          <SectionHead
            as="h3"
            label={<ChapterLabel n={4} sub="Editing the transformation" />}
          >
            Changing the rule instead of the result.
          </SectionHead>
          <P>Here a slider controls a generated face.</P>
        </Step>
        <Step>
          <P>
            Drag the slider and the face smiles more. It also looks older. The
            slider is tangled. It moves smile and age together.
          </P>
        </Step>
        <Step>
          <P>
            You could fix the age by hand after every drag. Or you could say
            once, “preserve age.” The face stays as it is. What changes is the
            effect of the slider.
          </P>
        </Step>
        <Step>
          <P>
            Drag again. The same slider now changes the smile only, and it will
            do so for every drag that follows.
          </P>
        </Step>
        <Step>
          <P>
            The first kind of edit changes the current state,{" "}
            <Eq>r → r′</Eq>. The second changes the transformation that
            produces future states, <Eq>T → T′</Eq>.
          </P>
          <div className="mt-6">
            <KeyLine>
              Editing a state changes one outcome. Editing a transformation
              changes every outcome that follows.
            </KeyLine>
          </div>
        </Step>
      </ScrollStage>
    </>
  );
}
