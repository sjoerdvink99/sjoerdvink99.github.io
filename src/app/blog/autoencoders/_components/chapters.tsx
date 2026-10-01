import type { ReactNode } from "react";
import {
  ChapterSection,
  ChapterTitle,
  type ChapterInfo,
} from "@/components/blog/Chapters";

export const CHAPTERS = [
  {
    id: "autoencoder",
    name: "Autoencoder",
    dot: "bg-ir-rep",
    ink: "text-ir-rep",
  },
  {
    id: "variational",
    name: "Variational",
    dot: "bg-ir-transform",
    ink: "text-ir-transform-ink",
  },
  { id: "sparse", name: "Sparse", dot: "bg-ir-human", ink: "text-ir-human" },
] as const satisfies readonly ChapterInfo[];

type N = 1 | 2 | 3;

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
