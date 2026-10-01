import type { ReactNode } from "react";
import {
  ChapterSection,
  ChapterTitle,
  type ChapterInfo,
} from "@/components/blog/Chapters";

export const CHAPTERS = [
  {
    id: "attention",
    name: "Attention",
    dot: "bg-ir-ink",
    ink: "text-ir-ink",
  },
  {
    id: "queries-keys-values",
    name: "Queries, keys, values",
    dot: "bg-ir-human",
    ink: "text-ir-human",
  },
  {
    id: "heads",
    name: "Heads",
    dot: "bg-ir-transform",
    ink: "text-ir-transform-ink",
  },
  {
    id: "transformer",
    name: "Transformer",
    dot: "bg-ir-rep",
    ink: "text-ir-rep",
  },
] as const satisfies readonly ChapterInfo[];

type N = 1 | 2 | 3 | 4;

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
