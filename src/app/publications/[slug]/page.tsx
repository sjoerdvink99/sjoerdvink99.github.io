import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publications } from "@/data/publications";
import SubpageLayout from "@/components/SubpageLayout";
import BibtexBlock from "@/components/BibtexBlock";
import { Fragment } from "react";

export function generateStaticParams() {
  return publications.map((pub) => ({ slug: pub.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);
  if (!pub) return {};
  return {
    title: pub.title,
    description: pub.abstract.slice(0, 160),
  };
}

function highlightName(authors: string) {
  const name = "Sjoerd Vink";
  const parts = authors.split(name);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <span className="underline font-semibold">{name}</span>
      )}
    </Fragment>
  ));
}

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);

  if (!pub) notFound();

  return (
    <SubpageLayout>
      <article className="py-10">
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            {pub.title}
          </h1>
          {pub.bestPaperAward && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-300 whitespace-nowrap">
              Best Paper Award
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-1">{highlightName(pub.authors)}</p>
        <p className="text-sm italic text-gray-500 mb-6">
          {pub.venue}, {pub.year}
        </p>

        {pub.teaserImage && (
          <div className="mb-6">
            <Image
              src={pub.teaserImage}
              alt={`Teaser for ${pub.title}`}
              width={1600}
              height={900}
              className="h-auto w-full rounded border border-gray-200"
            />
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Abstract</h2>
          <p className="text-gray-700 leading-relaxed">{pub.abstract}</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          {pub.paperLink !== "#" && (
            <a
              href={pub.paperLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
            >
              Paper
            </a>
          )}
          {pub.codeLink && (
            <a
              href={pub.codeLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition text-sm font-medium"
            >
              Code
            </a>
          )}
          {pub.videoLink && (
            <a
              href={pub.videoLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition text-sm font-medium"
            >
              Video
            </a>
          )}
        </div>

        <BibtexBlock bibtex={pub.bibtex} />
      </article>
    </SubpageLayout>
  );
}
