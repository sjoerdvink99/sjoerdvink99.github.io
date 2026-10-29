import { publications } from "@/data/publications";
import PublicationCard from "./PublicationCard";

export default function PublicationList() {
  return (
    <section id="publications" className="py-10 border-b-2">
      <h2 className="text-2xl mb-6">Publications</h2>

      <p className="mb-6">
        Most recent publications on{" "}
        <a
          href="https://scholar.google.com/citations?user=kHXpSd0AAAAJ&hl=en"
          target="_blank"
          rel="noreferrer"
          className="underline text-blue-600"
        >
          Google Scholar
        </a>
      </p>

      <ul className="space-y-6">
        {publications.map((pub) => (
          <PublicationCard key={pub.slug} pub={pub} />
        ))}
      </ul>
    </section>
  );
}
