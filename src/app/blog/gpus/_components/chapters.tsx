import type { ReactNode } from "react";
import {
  ChapterSection,
  ChapterTitle,
  type ChapterInfo,
} from "@/components/blog/Chapters";

export const CHAPTERS = [
  { id: "work", name: "Work", dot: "bg-ir-transform", ink: "text-ir-transform-ink" },
  { id: "parallelism", name: "Parallelism", dot: "bg-ir-rep", ink: "text-ir-rep" },
  { id: "memory", name: "Memory", dot: "bg-ir-human", ink: "text-ir-human" },
  { id: "tiling", name: "Tiling", dot: "bg-emerald-600", ink: "text-emerald-700" },
  { id: "precision", name: "Precision", dot: "bg-ir-space", ink: "text-ir-space-ink" },
  { id: "inference", name: "Inference", dot: "bg-violet-600", ink: "text-violet-700" },
] as const satisfies readonly ChapterInfo[];

type N = 1 | 2 | 3 | 4 | 5 | 6;

export function ChapterLabel({ n, sub }: { n: N; sub?: string }) {
  return <ChapterTitle chapter={CHAPTERS[n - 1]} index={n - 1} sub={sub} />;
}

export function Chapter({ n, children }: { n: N; children: ReactNode }) {
  return (
    <ChapterSection chapter={CHAPTERS[n - 1]} index={n - 1}>
      {children}
    </ChapterSection>
  );
}
