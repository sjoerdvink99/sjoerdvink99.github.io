import type { MetadataRoute } from "next";
import { publications } from "@/data/publications";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

const BASE_URL = "https://sjoerdvink99.github.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...getAllPosts().map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}/`,
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...publications.map((pub) => ({
      url: `${BASE_URL}/publications/${pub.slug}/`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
