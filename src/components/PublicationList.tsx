import { publications } from "@/data/publications";
import PublicationCard from "./PublicationCard";

export default function PublicationList() {
  return (
    <section
      id="publications"
      className="scroll-mt-20 border-b-2 border-gray-200 py-10"
    >
      <h2 className="mb-6 text-2xl font-light">Publications</h2>
      <p className="mb-6 leading-relaxed">
        Selected publications. For a complete list, see{" "}
        <a
          href="https://scholar.google.com/citations?user=kHXpSd0AAAAJ&hl=en"
          target="_blank"
          rel="noreferrer"
          className="link"
        >
          Google Scholar
        </a>
        .
      </p>
      <ul className="space-y-6">
        {publications.map((pub) => (
          <PublicationCard key={pub.slug} pub={pub} />
        ))}
      </ul>
    </section>
  );
}
