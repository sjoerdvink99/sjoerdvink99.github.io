import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publications } from "@/data/publications";
import SubpageLayout from "@/components/SubpageLayout";
import BibtexBlock from "@/components/BibtexBlock";
import TrophyIcon from "@/components/TrophyIcon";
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

const authorLinks: Record<string, string> = {
  "Sjoerd Vink": "https://scholar.google.com/citations?user=kHXpSd0AAAAJ&hl=en",
  "Michael Behrisch": "https://scholar.google.com/citations?user=12Bl2VgAAAAJ&hl=en&oi=ao",
  "Remco Chang": "https://scholar.google.com/citations?user=Q29WmWwAAAAJ&hl=en&oi=ao",
  "Mingwei Li": "https://scholar.google.com/citations?user=AsnRUVQAAAAJ&hl=en&oi=ao",
  "Suyang Li": "https://scholar.google.com/citations?user=HqJQ6NcAAAAJ&hl=en&oi=sra",
  "Manling Yang": "https://scholar.google.com/citations?user=1wQouukAAAAJ&hl=en",
  "Camelia Brumar": "https://scholar.google.com/citations?user=tky_rIQAAAAJ&hl=en",
};

function splitAuthors(authors: string) {
  return authors
    .split(/,\s*|\s+and\s+/)
    .map((author) => author.replace(/^and\s+/i, "").trim())
    .filter(Boolean);
}

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);

  if (!pub) notFound();

  const resources = [
    pub.paperLink !== "#" && { label: "Paper", href: pub.paperLink },
    pub.codeLink && { label: "Code", href: pub.codeLink },
    pub.videoLink && { label: "Video", href: pub.videoLink },
  ].filter((resource): resource is { label: string; href: string } => Boolean(resource));
  const authors = splitAuthors(pub.authors);

  return (
    <SubpageLayout showNavbar={false}>
      <article className="py-6">
        <Link
          href="/#publications"
          className="mb-8 inline-flex text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          &larr; Back to publications
        </Link>
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            {pub.title}
          </h1>
          {pub.bestPaperAward && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-300 whitespace-nowrap">
              <TrophyIcon />
              Best Paper Award
            </span>
          )}
        </div>

        {pub.teaserImage && (
          <div className="mb-8 flex justify-center">
            <Image
              src={pub.teaserImage}
              alt={`Teaser for ${pub.title}`}
              width={1600}
              height={900}
              className="h-auto max-h-96 w-full max-w-3xl rounded border border-gray-200 object-contain"
            />
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Abstract</h2>
          <p className="text-gray-700 leading-relaxed">{pub.abstract}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Resources</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {resources.map((resource, index) => (
                <Fragment key={resource.label}>
                  {index > 0 && <span className="text-gray-400">|</span>}
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-900 underline hover:text-gray-600"
                  >
                    {resource.label}
                  </a>
                </Fragment>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">People</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {authors.map((author, index) => (
                <Fragment key={author}>
                  {index > 0 && <span className="text-gray-400">|</span>}
                  {authorLinks[author] ? (
                    <a
                      href={authorLinks[author]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-900 underline hover:text-gray-600"
                    >
                      {author}
                    </a>
                  ) : (
                    <span className="text-gray-900">{author}</span>
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          <BibtexBlock
            authors={pub.authors}
            title={pub.title}
            venue={pub.venue}
            year={pub.year}
            bibtex={pub.bibtex}
          />
        </div>
      </article>
    </SubpageLayout>
  );
}
