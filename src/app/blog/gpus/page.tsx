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
import { LevelDock, LevelProvider, LevelSwitch } from "@/components/blog/Level";
import { hasBlog } from "@/lib/blog";
import { ESSAYS } from "@/lib/essays";
import { CHAPTERS, Chapter } from "./_components/chapters";
import WorkChapter from "./_components/Work";
import ParallelismChapter from "./_components/Parallelism";
import MemoryChapter from "./_components/Memory";
import TilingChapter from "./_components/Tiling";
import PrecisionChapter from "./_components/Precision";
import InferenceChapter from "./_components/Inference";
import Together from "./_components/Together";
import Numbers from "./_components/Numbers";

const essay = ESSAYS.find((e) => e.slug === "gpus")!;

export const metadata: Metadata = {
  title: essay.title,
  description: essay.description,
  openGraph: {
    title: essay.title,
    description: essay.description,
    url: "https://sjoerdvink99.github.io/blog/gpus/",
    type: "article",
  },
};

const link =
  "underline underline-offset-4 hover:text-ir-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink";

export default function GpusPage() {
  const showBlog = hasBlog();

  return (
    <Essay>
      <LevelProvider>
        <ReadingProgress />
        <ChapterRail chapters={CHAPTERS} />
        <LevelDock />
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
                  In 2012, a neural network trained on two gaming graphics
                  cards won the ImageNet competition by a wide margin. Since
                  then, nearly every leap in AI has run on GPUs, and the chips
                  have become one of the most sought-after products on Earth.
                </p>
                <p>
                  This essay explains why. It follows the arithmetic of a
                  language model down to the silicon: what the work is, why it
                  splits across thousands of lanes, why memory is the real
                  bottleneck, and the tricks that get around it.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-12">
                <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ir-ink-muted">
                  Choose your depth. You can switch at any time.
                </p>
                <LevelSwitch />
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <ChapterIndex chapters={CHAPTERS} />
            </Reveal>
          </div>

          <Chapter n={1}>
            <WorkChapter />
          </Chapter>

          <Chapter n={2}>
            <ParallelismChapter />
          </Chapter>

          <Chapter n={3}>
            <MemoryChapter />
          </Chapter>

          <Chapter n={4}>
            <TilingChapter />
          </Chapter>

          <Chapter n={5}>
            <PrecisionChapter />
          </Chapter>

          <Chapter n={6}>
            <InferenceChapter />
          </Chapter>

          <Together />

          <Numbers />

          <div className="mx-auto max-w-xl px-6 pb-[10vh] pt-[18vh]">
            <Reveal>
              <div className="space-y-5 text-pretty text-[1.2rem] font-light leading-relaxed md:text-[1.35rem]">
                <p>
                  A language model is matrix multiplication. Matrix
                  multiplication splits into thousands of independent dot
                  products, and a GPU has thousands of lanes to run them. The
                  rest is about feeding those lanes: tiles that reuse every
                  byte, fewer bits per number, and batches that share every
                  read.
                </p>
                <p>
                  To see what all that arithmetic computes, read{" "}
                  <Link href="/blog/transformers/" className={link}>
                    Inside the Transformer
                  </Link>{" "}
                  or{" "}
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
      </LevelProvider>
    </Essay>
  );
}
