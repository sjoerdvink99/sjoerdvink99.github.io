import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import SubpageLayout from "@/components/SubpageLayout";

export function generateStaticParams() {
  const posts = getAllPosts();
  // output: export requires at least one entry; placeholder is caught by notFound() below
  if (posts.length === 0) return [{ slug: "__empty" }];
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  return (
    <SubpageLayout>
      <article className="py-10">
        <Link
          href="/blog/"
          className="text-sm text-gray-500 transition-colors hover:text-blue-600"
        >
          ← Blog
        </Link>
        <header className="mb-8 mt-6">
          {post.date && (
            <time
              dateTime={post.date}
              className="text-sm tabular-nums text-gray-500"
            >
              {formatDate(post.date)}
            </time>
          )}
          <h1 className="mt-1 text-3xl font-light leading-snug tracking-tight">
            {post.title}
          </h1>
        </header>
        <div className="prose prose-gray max-w-none prose-headings:font-semibold prose-a:decoration-gray-300 prose-a:underline-offset-[3px] hover:prose-a:text-blue-600 hover:prose-a:decoration-blue-600">
          <MDXRemote source={post.content} />
        </div>
      </article>
    </SubpageLayout>
  );
}
