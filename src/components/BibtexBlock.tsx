export default function BibtexBlock({
  authors,
  title,
  venue,
  year,
  bibtex,
}: {
  authors: string;
  title: string;
  venue: string;
  year: number;
  bibtex: string;
}) {
  const plainText = `${authors} (${year}). ${title}. ${venue}.`;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Reference</h2>
      <div className="space-y-3">
        <div className="relative">
          <textarea
            readOnly
            value={plainText}
            rows={2}
            wrap="soft"
            aria-label="Plain text reference"
            className="block w-full resize-none overflow-hidden rounded-md border border-gray-200 bg-gray-50 px-4 py-3 pb-8 text-sm leading-relaxed text-gray-700 focus:border-gray-400 focus:outline-none"
          />
          <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-gray-400">
            plain text
          </span>
        </div>
        <div className="relative">
          <textarea
            readOnly
            value={bibtex}
            rows={8}
            wrap="soft"
            aria-label="BibTeX reference"
            className="block w-full resize-none overflow-hidden rounded-md border border-gray-200 bg-gray-50 px-4 py-3 pb-8 text-sm leading-relaxed text-gray-700 focus:border-gray-400 focus:outline-none"
          />
          <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-gray-400">
            bibtex
          </span>
        </div>
      </div>
    </div>
  );
}
