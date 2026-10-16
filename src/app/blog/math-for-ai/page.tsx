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
import VectorsChapter from "./_components/Vectors";
import DotProductChapter from "./_components/DotProduct";
import MatricesChapter from "./_components/Matrices";
import DerivativesChapter from "./_components/Derivatives";
import ChainRuleChapter from "./_components/ChainRule";
import ProbabilityChapter from "./_components/Probability";
import Training from "./_components/Training";
import Notation from "./_components/Notation";

const essay = ESSAYS.find((e) => e.slug === "math-for-ai")!;

export const metadata: Metadata = {
  title: essay.title,
  description: essay.description,
  openGraph: {
    title: essay.title,
    description: essay.description,
    url: "https://sjoerdvink99.github.io/blog/math-for-ai/",
    type: "article",
  },
};

const link =
  "underline underline-offset-4 hover:text-ir-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink";

export default function MathForAiPage() {
  const showBlog = hasBlog();

  return (
    <Essay>
      <ReadingProgress />
      <ChapterRail chapters={CHAPTERS} />
      <div className="mx-auto w-full px-4 md:px-8 lg:w-3/4 xl:w-2/4">
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
                Modern AI papers are written in three languages at once:
                linear algebra, calculus and probability. Most of what you
                need from each fits in a handful of ideas.
              </p>
              <p>
                This essay builds those ideas one at a time. Each one appears
                three ways: as numbers you can check, as a picture you can
                see, and as code you can run.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <ChapterIndex chapters={CHAPTERS} />
          </Reveal>
        </div>

        <Chapter n={1}>
          <VectorsChapter />
        </Chapter>

        <Chapter n={2}>
          <DotProductChapter />
        </Chapter>

        <Chapter n={3}>
          <MatricesChapter />
        </Chapter>

        <Chapter n={4}>
          <DerivativesChapter />
        </Chapter>

        <Chapter n={5}>
          <ChainRuleChapter />
        </Chapter>

        <Chapter n={6}>
          <ProbabilityChapter />
        </Chapter>

        <Training />

        <Notation />

        <div className="mx-auto max-w-xl px-6 pb-[10vh] pt-[18vh]">
          <Reveal>
            <div className="space-y-5 text-pretty text-[1.2rem] font-light leading-relaxed md:text-[1.35rem]">
              <p>
                Vectors hold the data. Dot products compare it. Matrices
                transform it, and nonlinearities bend it. Derivatives say which
                way to change the weights, the chain rule gets that answer
                through every layer, and probability turns outputs into
                predictions and losses.
              </p>
              <p>
                That is the toolkit. Put it to work in the{" "}
                <Link href="/blog/transformers/" className={link}>
                  Transformer
                </Link>{" "}
                and the{" "}
                <Link href="/blog/autoencoders/" className={link}>
                  autoencoder
                </Link>
                , where every step uses something from this page.
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
