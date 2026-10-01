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
import AttentionChapter from "./_components/Attention";
import QueryKeyValueChapter from "./_components/QueryKeyValue";
import HeadsChapter from "./_components/Heads";
import TransformerChapter from "./_components/Transformer";

const essay = ESSAYS.find((e) => e.slug === "transformers")!;

export const metadata: Metadata = {
  title: essay.title,
  description: essay.description,
  openGraph: {
    title: essay.title,
    description: essay.description,
    url: "https://sjoerdvink99.github.io/blog/transformers/",
    type: "article",
  },
};

export default function TransformersPage() {
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
                How does a word pick up meaning from the words around it?
              </p>
              <p>
                This essay builds the answer, attention, from a single dot
                product, and then assembles it into a small Transformer. Each
                step is a small change to the one before.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <ChapterIndex chapters={CHAPTERS} />
          </Reveal>
        </div>

        <Chapter n={1}>
          <AttentionChapter />
        </Chapter>

        <Chapter n={2}>
          <QueryKeyValueChapter />
        </Chapter>

        <Chapter n={3}>
          <HeadsChapter />
        </Chapter>

        <Chapter n={4}>
          <TransformerChapter />
        </Chapter>

        <div className="mx-auto max-w-xl px-6 pb-[10vh] pt-[18vh]">
          <Reveal>
            <div className="space-y-5 text-pretty text-[1.2rem] font-light leading-relaxed md:text-[1.35rem]">
              <p>
                Every part of this model was already on the page. A dot product
                measures relevance. Softmax turns scores into weights. A
                weighted sum moves information.
              </p>
              <p>
                Queries, keys and values make that learnable. Heads repeat it
                side by side, and blocks repeat it in depth. Large models use
                the same structure with far more dimensions, heads and blocks.
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
