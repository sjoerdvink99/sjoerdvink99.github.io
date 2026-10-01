import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReadingProgress from "@/components/blog/ReadingProgress";
import Reveal from "@/components/blog/Reveal";
import { hasBlog } from "@/lib/blog";
import Essay from "@/components/blog/Essay";
import Opening from "./_components/Opening";
import ChapterRail from "@/components/blog/ChapterRail";
import { ChapterIndex } from "@/components/blog/Chapters";
import { Bridge, CHAPTERS, Chapter } from "./_components/chapters";
import SpaceSection from "./_components/SpaceSection";
import RepresentationSection from "./_components/RepresentationSection";
import AbstractionSection from "./_components/AbstractionSection";
import StructureSection from "./_components/StructureSection";
import TransformationSection from "./_components/TransformationSection";
import InteractionSection from "./_components/InteractionSection";
import MultimodalSection from "./_components/MultimodalSection";
import Closing from "./_components/Closing";

export const metadata: Metadata = {
  title: "Spaces Between Us",
  description:
    "Human-AI interaction as the design of representations that humans and AI can both work with, and of the transformations that connect them.",
  // Unlisted until it's ready: reachable by URL, but kept out of search results.
  robots: { index: false, follow: false },
};

export default function SpacesBetweenUs() {
  const showBlog = hasBlog();

  return (
    <Essay>
      <ReadingProgress />
      <ChapterRail chapters={CHAPTERS} />
      <div className="mx-auto w-full px-4 md:px-8 lg:w-3/4 xl:w-2/4">
        <Navbar showBlog={showBlog} />
      </div>

      <article className="overflow-x-clip text-ir-ink">
        <header className="mx-auto flex min-h-[88svh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-5xl font-light tracking-tight md:text-6xl">
            Spaces Between Us
          </h1>
          <p className="mt-6 text-lg font-light text-ir-ink-muted md:text-xl">
            Space, representation, transformation, interaction
          </p>
          <p className="mt-14 text-sm text-ir-ink-muted">Sjoerd Vink</p>
          <span
            className="mt-16 h-12 w-px bg-gray-300 motion-safe:animate-pulse"
            aria-hidden
          />
        </header>

        <Opening />

        <div className="mx-auto max-w-xl px-6 py-[20vh]">
          <Reveal>
            <div className="space-y-5 text-pretty text-[1.2rem] font-light leading-relaxed md:text-[1.35rem]">
              <p>
                A text box is one answer to that question. For many tasks it is
                a good answer. But it is a design choice, and other choices are
                possible.
              </p>
              <p>
                This essay describes those choices with four terms. Each
                chapter adds one.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <ChapterIndex chapters={CHAPTERS} />
          </Reveal>
        </div>

        <Chapter n={1}>
          <SpaceSection />
        </Chapter>

        <Chapter n={2}>
          <Bridge>
            <p>
              A problem space says what could be the case. To work with any of
              it, people and models need a way to express a state.
            </p>
          </Bridge>
          <RepresentationSection />
          <Bridge>
            <p>
              Some of these representations suit the model. Others suit the
              person. A system does not have to show people the representation
              it computes with.
            </p>
          </Bridge>
          <AbstractionSection />
          <Bridge>
            <p>
              Structured representations deserve a closer look. Their rules
              are what make new kinds of interaction possible.
            </p>
          </Bridge>
          <StructureSection />
        </Chapter>

        <Chapter n={3}>
          <Bridge>
            <p>
              A representation gives us a state. What makes it useful is that
              we can change it, or carry it into another space.
            </p>
          </Bridge>
          <TransformationSection />
        </Chapter>

        <Chapter n={4}>
          <Bridge>
            <p>
              So far the system has applied every transformation on its own.
              Interaction begins when a person takes part in choosing them.
            </p>
          </Bridge>
          <InteractionSection />
          <Bridge>
            <p>
              Real systems rarely stay in one space. They connect several, and
              each space brings its own ways of acting on it.
            </p>
          </Bridge>
          <MultimodalSection />
        </Chapter>

        <Closing />

        <div className="flex justify-center pb-24 pt-[24vh]">
          <Link
            href="/blog/"
            className="rounded text-sm text-ir-ink-muted underline-offset-4 hover:text-ir-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ir-ink"
          >
            ← Back to blog
          </Link>
        </div>
      </article>

      <Footer />
    </Essay>
  );
}
