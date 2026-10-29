import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { essays, essayUrl } from "@/data/essays";
import { formatDate } from "@/lib/format";
import SubpageLayout from "@/components/SubpageLayout";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Reflections on research, and educational essays on the ideas behind modern AI.",
};

type Entry = {
  key: string;
  href: string;
  title: string;
  date: string;
  description: string;
  external?: boolean;
};

function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="space-y-6">
      {entries.map((entry) => {
        const body = (
          <>
            <time
              dateTime={entry.date}
              className="text-sm tabular-nums text-gray-500"
            >
              {formatDate(entry.date)}
            </time>
            <h3 className="mt-1 text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-600">
              {entry.title}
              {entry.external && (
                <span aria-hidden="true" className="ml-1 text-gray-400">
                  ↗
                </span>
              )}
            </h3>
            {entry.description && (
              <p className="mt-1 text-gray-600">{entry.description}</p>
            )}
          </>
        );
        return (
          <li key={entry.key}>
            {entry.external ? (
              <a href={entry.href} className="group block">
                {body}
              </a>
            ) : (
              <Link href={entry.href} className="group block">
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function BlogPage() {
  const reflections: Entry[] = getAllPosts().map((post) => ({
    key: post.slug,
    href: `/blog/${post.slug}/`,
    title: post.title,
    date: post.date,
    description: post.description,
  }));
  const essayEntries: Entry[] = [...essays]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((essay) => ({
      key: essay.slug,
      href: essayUrl(essay.slug),
      title: essay.title,
      date: essay.date,
      description: essay.subtitle,
      external: true,
    }));

  return (
    <SubpageLayout>
      <div className="py-10">
        <h1 className="text-3xl font-light tracking-tight">Blog</h1>
        <p className="mt-3 leading-relaxed text-gray-600">
          Reflections on research, and educational essays on the ideas behind
          modern AI. I learn best by trying to teach a topic, which is where
          the essays come from (built with some help from Claude Code).
        </p>

        {reflections.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-6 text-2xl font-light">Reflections</h2>
            <EntryList entries={reflections} />
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-light">Educational essays</h2>
          <EntryList entries={essayEntries} />
        </section>
      </div>
    </SubpageLayout>
  );
}
