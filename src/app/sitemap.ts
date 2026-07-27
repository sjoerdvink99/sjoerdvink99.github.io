import { MetadataRoute } from "next";
import { publications } from "@/data/publications";
import { getAllPosts, BLOG_ENABLED } from "@/lib/blog";

export const dynamic = "force-static";

const BASE_URL = "https://sjoerdvink99.github.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = BLOG_ENABLED ? getAllPosts() : [];

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}/`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogIndexEntry: MetadataRoute.Sitemap = BLOG_ENABLED
    ? [
        {
          url: `${BASE_URL}/blog/`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        },
      ]
    : [];

  const publicationEntries: MetadataRoute.Sitemap = publications.map((pub) => ({
    url: `${BASE_URL}/publications/${pub.slug}/`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...blogIndexEntry,
    ...blogEntries,
    ...publicationEntries,
  ];
}
