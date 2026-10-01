"use client";

import { useEffect, useState } from "react";
import { number, type ChapterInfo } from "./Chapters";

export default function ChapterRail({
  chapters: CHAPTERS,
}: {
  chapters: readonly ChapterInfo[];
}) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const chapters = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]")
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      const current = chapters.find((c) => {
        const r = c.getBoundingClientRect();
        return r.top <= mid && r.bottom > mid;
      });
      setActive(current ? Number(current.dataset.chapter) : null);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const shown = active !== null;
  const current = CHAPTERS[active ?? 0];

  return (
    <nav
      aria-label="Chapters"
      inert={!shown}
      className={`pointer-events-none fixed z-40 transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}
    >
      <ol className="pointer-events-auto fixed left-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 min-[1560px]:flex">
        {CHAPTERS.map((c, i) => {
          const on = i === active;
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={on ? "step" : undefined}
                className={`group flex items-center gap-3 rounded py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink ${
                  on ? "text-ir-ink" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${on ? c.dot : "bg-gray-300"}`}
                  aria-hidden
                />
                <span className="tabular-nums">{number(i)}</span>
                <span
                  className={`transition-opacity ${on ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}
                >
                  {c.name}
                </span>
              </a>
            </li>
          );
        })}
      </ol>

      <div className="pointer-events-auto fixed left-1/2 top-3 flex -translate-x-1/2 items-center gap-3 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 backdrop-blur-sm min-[1560px]:hidden">
        <span className="flex gap-1" aria-hidden>
          {CHAPTERS.map((c, i) => (
            <span
              key={c.id}
              className={`h-[3px] w-4 rounded-full transition-colors ${
                i === active ? c.dot : i < (active ?? 0) ? "bg-gray-400" : "bg-gray-200"
              }`}
            />
          ))}
        </span>
        <a
          href={`#${current.id}`}
          aria-current="step"
          className="whitespace-nowrap text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ir-ink"
        >
          <span className="tabular-nums text-ir-ink-muted">{number(active ?? 0)}</span>{" "}
          {current.name}
        </a>
      </div>
    </nav>
  );
}
