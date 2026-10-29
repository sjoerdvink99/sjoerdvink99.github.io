import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Fragment } from "react";
import { publications } from "@/data/publications";
import SubpageLayout from "@/components/SubpageLayout";
import BibtexBlock from "@/components/BibtexBlock";
import AwardBadge from "@/components/AwardBadge";
import ResourceLinks from "@/components/ResourceLinks";

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

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-3 text-lg font-semibold">{children}</h2>
);

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);

  if (!pub) notFound();

  const authors = splitAuthors(pub.authors);

  return (
    <SubpageLayout showNavbar={false}>
      <article className="py-10">
        <Link
          href="/#publications"
          className="text-sm text-gray-500 transition-colors hover:text-blue-600"
        >
          ← Publications
        </Link>

        <header className="mb-8 mt-6">
          <h1 className="text-2xl font-light leading-snug tracking-tight md:text-3xl">
            {pub.title}
          </h1>
          <p className="mt-2 text-sm italic text-gray-500">
            {pub.venue}, {pub.year}
          </p>
          {pub.bestPaperAward && (
            <div className="mt-3">
              <AwardBadge />
            </div>
          )}
        </header>

        {pub.teaserImage && (
          <Image
            src={pub.teaserImage}
            alt={`Teaser figure for ${pub.title}`}
            width={1600}
            height={900}
            className="mx-auto mb-10 h-auto max-h-96 w-full max-w-3xl rounded border border-gray-200 object-contain"
          />
        )}

        <div className="space-y-8">
          <section>
            <Heading>Abstract</Heading>
            <p className="leading-relaxed text-gray-700">{pub.abstract}</p>
          </section>

          <section>
            <Heading>Resources</Heading>
            <ResourceLinks pub={pub} />
          </section>

          <section>
            <Heading>Authors</Heading>
            <p className="text-sm text-gray-600">
              {authors.map((author, index) => (
                <Fragment key={author}>
                  {index > 0 && ", "}
                  {authorLinks[author] ? (
                    <a
                      href={authorLinks[author]}
                      target="_blank"
                      rel="noreferrer"
                      className="link"
                    >
                      {author}
                    </a>
                  ) : (
                    author
                  )}
                </Fragment>
              ))}
            </p>
          </section>

          <section>
            <Heading>Citation</Heading>
            <BibtexBlock
              authors={pub.authors}
              title={pub.title}
              venue={pub.venue}
              year={pub.year}
              bibtex={pub.bibtex}
            />
          </section>
        </div>
      </article>
    </SubpageLayout>
  );
}
