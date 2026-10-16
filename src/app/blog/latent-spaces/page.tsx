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
import LatentChapter from "./_components/Latent";
import DirectionsChapter from "./_components/Directions";
import PathsChapter from "./_components/Paths";
import IndependenceChapter from "./_components/Independence";
import GuidanceChapter from "./_components/Guidance";
import SteeringChapter from "./_components/Steering";
import FeedbackChapter from "./_components/Feedback";
import { FurtherReading, Notation } from "./_components/Notation";

const essay = ESSAYS.find((e) => e.slug === "latent-spaces")!;

export const metadata: Metadata = {
  title: essay.title,
  description: essay.description,
  openGraph: {
    title: essay.title,
    description: essay.description,
    url: "https://sjoerdvink99.github.io/blog/latent-spaces/",
    type: "article",
  },
};

const link =
  "underline underline-offset-4 hover:text-ir-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink";

export default function LatentSpacesPage() {
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
                A prompt is a rough way to ask a model for something. Under
                every image, sound and sentence a model produces sits a
                vector, and a vector can be moved precisely.
              </p>
              <p>
                This essay is about moving it on purpose. One tiny model that
                draws faces runs through every chapter. With it we find
                concepts as directions, travel between outputs, edit one
                trait without touching another, guide a diffusion model,
                steer a language model, and learn what a person wants from
                nothing but their choices.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <ChapterIndex chapters={CHAPTERS} />
          </Reveal>
        </div>

        <Chapter n={1}>
          <LatentChapter />
        </Chapter>

        <Chapter n={2}>
          <DirectionsChapter />
        </Chapter>

        <Chapter n={3}>
          <PathsChapter />
        </Chapter>

        <Chapter n={4}>
          <IndependenceChapter />
        </Chapter>

        <Chapter n={5}>
          <GuidanceChapter />
        </Chapter>

        <Chapter n={6}>
          <SteeringChapter />
        </Chapter>

        <Chapter n={7}>
          <FeedbackChapter />
        </Chapter>

        <Notation />

        <FurtherReading />

        <div className="mx-auto max-w-xl px-6 pb-[10vh] pt-[18vh]">
          <Reveal>
            <div className="space-y-5 text-pretty text-[1.2rem] font-light leading-relaxed md:text-[1.35rem]">
              <p>
                Controlling a generative model comes down to a few
                geometric moves. A point says what to make. A direction is a
                concept, which you add to edit and project onto to measure. A
                path should stay on the shell where the data lives. A
                projection removes the side effects you did not ask for.
              </p>
              <p>
                Guidance and steering use the same moves at every step and
                in every layer, and preference learning finds directions from
                human choices. All of it rests on dot products and
                projections, covered in{" "}
                <Link href="/blog/math-for-ai/" className={link}>
                  The Math Behind AI
                </Link>
                , and on learned spaces like the ones in{" "}
                <Link href="/blog/autoencoders/" className={link}>
                  Inside the Autoencoder
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
