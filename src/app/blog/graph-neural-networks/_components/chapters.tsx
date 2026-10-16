import type { ReactNode } from "react";
import {
  ChapterSection,
  ChapterTitle,
  type ChapterInfo,
} from "@/components/blog/Chapters";

export const CHAPTERS = [
  { id: "graphs", name: "Graphs", dot: "bg-ir-ink", ink: "text-ir-ink" },
  { id: "message-passing", name: "Message passing", dot: "bg-ir-transform", ink: "text-ir-transform-ink" },
  { id: "gcn-layer", name: "GCN layer", dot: "bg-ir-rep", ink: "text-ir-rep" },
  { id: "depth", name: "Depth", dot: "bg-ir-space", ink: "text-ir-space-ink" },
  { id: "attention", name: "Attention", dot: "bg-ir-human", ink: "text-ir-human" },
  { id: "expressivity", name: "Expressivity", dot: "bg-emerald-600", ink: "text-emerald-700" },
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
