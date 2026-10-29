import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ESSAYS } from "@/lib/essays";
import SubpageLayout from "@/components/SubpageLayout";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Blog",
  description: "Longer-form writing on research, visualization, and intent.",
};

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default function BlogPage() {
  const educationalPosts = ESSAYS.map((essay) => ({
    ...essay,
    description: essay.subtitle,
  })).sort((a, b) => (a.date < b.date ? 1 : -1));
  const thoughtPieces = getAllPosts();
  if (educationalPosts.length === 0 && thoughtPieces.length === 0) notFound();

  const renderPosts = (
    posts: Array<{
      slug: string;
      title: string;
      date: string;
      description: string;
    }>
  ) => (
    <ul className="space-y-6">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}/`}
            className="group block"
          >
            <time
              dateTime={post.date}
              className="text-sm tabular-nums text-gray-400"
            >
              {formatDate(post.date)}
            </time>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 group-hover:underline">
              {post.title}
            </h2>
            {post.description && (
              <p className="mt-1 text-gray-600">{post.description}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <SubpageLayout>
      <section className="py-10">
        <h1 className="text-2xl font-light">Blog</h1>
        <p className="mt-2 mb-8 text-gray-500">
          Reflections and educational essays on research, technology, and
          the ideas behind them. I learn best by trying to teach new topics,
          which is why I made most of the educational essays below (with a tiny
          bit of help from Claude Code here and there, haha).
        </p>

        <section>
          <h2 className="mb-4 text-xl font-light">Reflections</h2>
          {thoughtPieces.length > 0 ? (
            renderPosts(thoughtPieces)
          ) : (
            <p className="text-gray-500">Coming soon.</p>
          )}
        </section>

        {educationalPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-light">Educational</h2>
            {renderPosts(educationalPosts)}
          </section>
        )}
      </section>
    </SubpageLayout>
  );
}
