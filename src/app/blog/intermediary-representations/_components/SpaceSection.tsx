"use client";

import { motion } from "motion/react";
import { ScrollStage, Step, useStage } from "@/components/blog/ScrollStage";
import { Eq, SvgEq } from "@/components/blog/Eq";
import { Display, KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { C } from "@/components/blog/palette";
import { rand, round } from "@/components/blog/random";
import { ChapterLabel } from "./chapters";

const HOLDS = ["stick", "ball", "bone", "nothing"];
const PLACES = ["lawn", "beach", "snow"];
const ALLOWED = 3;

const GRID = { x: 120, y: 86, w: 82, h: 72 };
const FRAME = { x: GRID.x - 18, y: GRID.y - 16, h: PLACES.length * GRID.h + 32 };
const STATE = { col: 0, row: 0 };

const STATES = PLACES.flatMap((_, row) =>
  HOLDS.map((__, col) => {
    const k = row * HOLDS.length + col;
    return {
      col,
      row,
      grid: {
        x: GRID.x + (col + 0.5) * GRID.w,
        y: GRID.y + (row + 0.5) * GRID.h,
      },
      loose: {
        x: round(GRID.x + 10 + rand(k + 40) * (HOLDS.length * GRID.w - 20)),
        y: round(GRID.y + 10 + rand(k + 90) * (PLACES.length * GRID.h - 20)),
      },
    };
  })
);

const fade = (show: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: show ? 1 : 0 },
  transition: { duration: 0.5, delay: show ? delay : 0 },
});

function ProblemSpace() {
  const { step } = useStage();
  const structured = step >= 1;
  const bounded = step >= 2;
  const chosen = step >= 3;
  const neighbors = step >= 4;
  const s = STATES[STATE.row * HOLDS.length + STATE.col].grid;

  return (
    <svg
      viewBox="0 0 470 350"
      className="mx-auto block w-full max-w-[32rem]"
      role="img"
      aria-label="A problem space of possible scenes, arranged by what the dog holds and where it is"
    >
      <motion.rect
        x={FRAME.x}
        y={FRAME.y}
        height={FRAME.h}
        rx={16}
        fill="none"
        stroke={C.space}
        strokeWidth={1.25}
        initial={false}
        animate={{
          width: (bounded ? ALLOWED : HOLDS.length) * GRID.w + 36,
          opacity: structured ? 1 : 0,
        }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.g {...fade(structured)}>
        <SvgEq
          x={FRAME.x + (bounded ? ALLOWED : HOLDS.length) * GRID.w + 36}
          y={FRAME.y + FRAME.h + 20}
          size={18}
          fill={C.spaceInk}
          anchor="end"
        >
          S
        </SvgEq>
      </motion.g>

      <motion.g {...fade(structured, 0.2)} fontSize={15} fill={C.muted}>
        <text x={GRID.x} y={22} fontSize={11} letterSpacing="0.14em" fill={C.spaceInk}>
          WHAT THE DOG HOLDS
        </text>
        {HOLDS.map((h, col) => (
          <motion.text
            key={h}
            x={GRID.x + (col + 0.5) * GRID.w}
            y={50}
            textAnchor="middle"
            initial={false}
            animate={{ opacity: bounded && col >= ALLOWED ? 0.4 : 1 }}
          >
            {h}
          </motion.text>
        ))}
        <text x={GRID.x - 32} y={GRID.y - 6} fontSize={11} letterSpacing="0.14em" fill={C.spaceInk} textAnchor="end">
          WHERE
        </text>
        {PLACES.map((p, row) => (
          <text
            key={p}
            x={GRID.x - 32}
            y={GRID.y + (row + 0.5) * GRID.h}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {p}
          </text>
        ))}
      </motion.g>

      <motion.g {...fade(neighbors)} stroke={C.rep} strokeOpacity={0.45} strokeWidth={1.25}>
        {STATES.filter(
          (t) =>
            t.col < ALLOWED &&
            (t.col === STATE.col) !== (t.row === STATE.row)
        ).map((t) => (
          <line key={`${t.col}-${t.row}`} x1={s.x} y1={s.y} x2={t.grid.x} y2={t.grid.y} />
        ))}
      </motion.g>

      {STATES.map((t) => {
        const out = bounded && t.col >= ALLOWED;
        const isState = chosen && t.col === STATE.col && t.row === STATE.row;
        const near =
          neighbors &&
          !out &&
          !isState &&
          ((t.col === STATE.col) !== (t.row === STATE.row));
        const at = structured ? t.grid : t.loose;
        return (
          <motion.g
            key={`${t.col}-${t.row}`}
            initial={false}
            animate={{ x: at.x, y: at.y, opacity: out ? 0.35 : 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          >
            {isState && <circle r={16} fill={C.rep} opacity={0.14} />}
            <circle
              r={isState ? 7 : near ? 6 : 5}
              fill={isState ? C.rep : near ? "#fff" : C.space}
              stroke={near ? C.rep : "none"}
              strokeWidth={1.5}
            />
            {out && (
              <path d="M -9 -9 L 9 9 M 9 -9 L -9 9" stroke={C.space} strokeWidth={1.25} />
            )}
          </motion.g>
        );
      })}

      <motion.g {...fade(chosen)}>
        <SvgEq x={s.x + 16} y={s.y - 18} size={16} fill={C.rep}>
          s
        </SvgEq>
      </motion.g>
      <motion.text
        x={GRID.x + (ALLOWED + 0.5) * GRID.w}
        y={68}
        fontSize={12}
        fill={C.muted}
        textAnchor="middle"
        {...fade(bounded, 0.3)}
      >
        ruled out
      </motion.text>
    </svg>
  );
}

export default function SpaceSection() {
  return (
    <ScrollStage visual={<ProblemSpace />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} />}>What is a space?</SectionHead>
        <P>
          Every task comes with a space of possibilities. The problem space is
          the set of all situations the task could be in, before anyone
          decides how to write them down.
        </P>
        <Display>
          <Eq>S = &#123; possible states &#125;</Eq>
        </Display>
      </Step>
      <Step>
        <P>
          Take a small task, picturing a dog at play. Two things can vary, what
          the dog holds and where it is. Each dimension multiplies the
          possibilities.
        </P>
        <Display>
          <Eq>S = holds × place</Eq>
        </Display>
      </Step>
      <Step>
        <P>
          A space also has a boundary. The task rules some states out. A dog
          playing fetch has to be holding something.
        </P>
        <Display>
          <Eq>holds ≠ nothing</Eq>
        </Display>
      </Step>
      <Step>
        <P>One particular situation is one state in the space.</P>
        <Display>
          <Eq>s = (stick, lawn) ∈ S</Eq>
        </Display>
      </Step>
      <Step>
        <P>
          The space has a geometry too. States that differ in one respect are
          neighbors. Changing what the dog holds moves along a row. Changing
          the place moves along a column.
        </P>
      </Step>
      <Step>
        <KeyLine>A problem space describes what could be the case.</KeyLine>
        <div className="mt-6">
          <P>
            It says nothing yet about how a state is written down, drawn, or
            computed with. Real problem spaces are also far larger. A summary
            of research on remote work could take countless positions.
          </P>
        </div>
      </Step>
    </ScrollStage>
  );
}
