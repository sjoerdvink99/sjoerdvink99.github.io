import type { ReactNode } from "react";
import {
  ChapterSection,
  ChapterTitle,
  type ChapterInfo,
} from "@/components/blog/Chapters";

export const CHAPTERS = [
  { id: "vectors", name: "Vectors", dot: "bg-ir-ink", ink: "text-ir-ink" },
  { id: "dot-product", name: "Dot product", dot: "bg-ir-human", ink: "text-ir-human" },
  { id: "matrices", name: "Matrices", dot: "bg-ir-transform", ink: "text-ir-transform-ink" },
  { id: "derivatives", name: "Derivatives", dot: "bg-ir-rep", ink: "text-ir-rep" },
  { id: "chain-rule", name: "Chain rule", dot: "bg-ir-space", ink: "text-ir-space-ink" },
  { id: "probability", name: "Probability", dot: "bg-emerald-600", ink: "text-emerald-700" },
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
