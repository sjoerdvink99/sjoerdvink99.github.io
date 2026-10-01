import type { ReactNode } from "react";
import Reveal from "./Reveal";

export interface ChapterInfo {
  id: string;
  name: string;
  dot: string;
  ink: string;
}

export const number = (i: number) => String(i + 1).padStart(2, "0");

export function ChapterTitle({
  chapter,
  index,
  sub,
}: {
  chapter: ChapterInfo;
  index: number;
  sub?: string;
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-[0.7rem] font-medium uppercase tracking-[0.16em]">
      <span className={`h-1.5 w-1.5 rounded-full ${chapter.dot}`} aria-hidden />
      <span className={chapter.ink}>
        {number(index)} {chapter.name}
      </span>
      {sub && <span className="text-ir-ink-muted">/ {sub}</span>}
    </p>
  );
}

export function ChapterSection({
  chapter,
  index,
  children,
}: {
  chapter: ChapterInfo;
  index: number;
  children: ReactNode;
}) {
  return (
    <section id={chapter.id} data-chapter={index} className="scroll-mt-4">
      {children}
    </section>
  );
}

export function ChapterIndex({
  chapters,
}: {
  chapters: readonly ChapterInfo[];
}) {
  return (
    <ol className="mt-12 grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-ir-ink-muted sm:flex sm:flex-wrap sm:justify-center">
      {chapters.map((c, i) => (
        <li key={c.id}>
          <a
            href={`#${c.id}`}
            className="flex items-center gap-2 rounded hover:text-ir-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink"
          >
            <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
            <span className="tabular-nums">{number(i)}</span> {c.name}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function Bridge({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-[22vh] md:py-[26vh]">
      <Reveal>
        <div className="space-y-5 text-pretty text-[1.2rem] font-light leading-relaxed text-ir-ink md:text-[1.35rem]">
          {children}
        </div>
      </Reveal>
    </div>
  );
}
