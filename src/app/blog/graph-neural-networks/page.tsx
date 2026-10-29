import type { Metadata } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Essay from "@/components/blog/Essay";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ChapterRail from "@/components/blog/ChapterRail";
import Reveal from "@/components/blog/Reveal";
import { ChapterIndex } from "@/components/blog/Chapters";
import { hasBlog } from "@/lib/blog";
import { ESSAYS } from "@/lib/essays";
import { CHAPTERS, Chapter } from "./_components/chapters";
import GraphsChapter from "./_components/Graphs";
import MessagePassingChapter from "./_components/MessagePassing";
import GcnLayerChapter from "./_components/GcnLayer";
import DepthChapter from "./_components/Depth";
import AttentionChapter from "./_components/Attention";
import ExpressivityChapter from "./_components/Expressivity";
import Together from "./_components/Together";
import { FurtherReading, Notation } from "./_components/Notation";

const essay = ESSAYS.find((e) => e.slug === "graph-neural-networks")!;

export const metadata: Metadata = {
  title: essay.title,
  description: essay.description,
  openGraph: {
    title: essay.title,
    description: essay.description,
    url: "https://sjoerdvink99.github.io/blog/graph-neural-networks/",
    type: "article",
  },
};

const link =
  "underline underline-offset-4 hover:text-ir-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink";

export default function GraphNeuralNetworksPage() {
  const showBlog = hasBlog();

  return (
    <Essay>
      <ReadingProgress />
      <ChapterRail chapters={CHAPTERS} />
      <div className="mx-auto w-full px-4 md:px-8 lg:w-3/4 xl:w-3/5">
        <Navbar showBlog={showBlog} />
      </div>

      <article className="essay-math overflow-x-clip text-ir-ink">
        <header className="mx-auto flex min-h-[88svh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-5xl font-light tracking-tight md:text-6xl">
            {essay.title}
          </h1>
          <p className="mt-6 text-balance text-lg font-light text-ir-ink-muted md:text-xl">
            {essay.subtitle}
          </p>
          <p className="mt-14 text-sm text-ir-ink-muted">Sjoerd Vink</p>
          <span
            className="mt-16 h-12 w-px bg-gray-300 motion-safe:animate-pulse"
            aria-hidden
          />
        </header>

        <div className="mx-auto max-w-xl px-6 pb-[20vh]">
          <Reveal>
            <div className="space-y-5 text-pretty text-[1.2rem] font-light leading-relaxed md:text-[1.35rem]">
              <p>
                Images are grids and sentences are sequences. A lot of data
                is neither. Molecules, social networks, road maps and
                citations are graphs: things, and the links between them.
              </p>
              <p>
                This essay builds a graph neural network from one idea, that a
                node should listen to its neighbors. One small graph runs
                through every chapter, drawn both as a network and as points
                in space, so you can watch each operation move the data.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <ChapterIndex chapters={CHAPTERS} />
          </Reveal>
        </div>

        <Chapter n={1}>
          <GraphsChapter />
        </Chapter>

        <Chapter n={2}>
          <MessagePassingChapter />
        </Chapter>

        <Chapter n={3}>
          <GcnLayerChapter />
        </Chapter>

        <Chapter n={4}>
          <DepthChapter />
        </Chapter>

        <Chapter n={5}>
          <AttentionChapter />
        </Chapter>

        <Chapter n={6}>
          <ExpressivityChapter />
        </Chapter>

        <div className="pt-[22vh]">
          <Together />
        </div>

        <Notation />

        <FurtherReading />

        <div className="mx-auto max-w-xl px-6 pb-[10vh] pt-[18vh]">
          <Reveal>
            <div className="space-y-5 text-pretty text-[1.2rem] font-light leading-relaxed md:text-[1.35rem]">
              <p>
                A graph neural network is a short list of choices. What
                message each neighbor sends, how the messages are combined
                without caring about order, and how a node updates itself
                with the result. Stack a few of these layers and every node
                sees a little further.
              </p>
              <p>
                The rest is trade-offs: more layers against over-smoothing,
                fixed weights against attention, means against sums. The
                attention here is a close relative of the one in the{" "}
                <Link href="/blog/transformers/" className={link}>
                  Transformer
                </Link>
                , and the dot products, matrices and gradients underneath are
                covered in{" "}
                <Link href="/blog/math-for-ai/" className={link}>
                  The Math Behind AI
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>

        <div className="flex justify-center pb-24 pt-[24vh]">
          <Link
            href="/blog/"
            className="rounded text-sm text-ir-ink-muted underline-offset-4 hover:text-ir-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink"
          >
            ← Back to blog
          </Link>
        </div>
      </article>

      <Footer />
    </Essay>
  );
}
