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

export default function BlogPage() {
  const posts = [...getAllPosts(), ...ESSAYS].sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
  if (posts.length === 0) notFound();

  return (
    <SubpageLayout>
      <section className="py-10">
        <h1 className="text-2xl font-light mb-8">Blog</h1>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          <ul className="space-y-8">
            {posts.map((post) => (
              <li key={post.slug} className="border-l-4 border-gray-300 pl-4">
                <p className="text-sm text-gray-500 mb-1">{post.date}</p>
                <Link
                  href={`/blog/${post.slug}/`}
                  className="text-xl font-semibold text-gray-900 hover:underline"
                >
                  {post.title}
                </Link>
                {post.description && (
                  <p className="text-gray-600 mt-1">{post.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </SubpageLayout>
  );
}
