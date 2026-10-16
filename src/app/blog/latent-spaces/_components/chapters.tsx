import type { ReactNode } from "react";
import {
  ChapterSection,
  ChapterTitle,
  type ChapterInfo,
} from "@/components/blog/Chapters";

export const CHAPTERS = [
  { id: "latent-space", name: "Latent space", dot: "bg-ir-ink", ink: "text-ir-ink" },
  { id: "directions", name: "Directions", dot: "bg-ir-rep", ink: "text-ir-rep" },
  { id: "paths", name: "Paths", dot: "bg-ir-space", ink: "text-ir-space-ink" },
  { id: "independence", name: "Independence", dot: "bg-ir-transform", ink: "text-ir-transform-ink" },
  { id: "guidance", name: "Guidance", dot: "bg-emerald-600", ink: "text-emerald-700" },
  { id: "steering", name: "Steering", dot: "bg-ir-human", ink: "text-ir-human" },
  { id: "feedback", name: "Feedback", dot: "bg-violet-600", ink: "text-violet-700" },
] as const satisfies readonly ChapterInfo[];

type N = 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
