"use client";

import { useState } from "react";

function CitationBox({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 text-xs text-gray-500">
        <span>{label}</span>
        <button
          type="button"
          onClick={copy}
          className="transition-colors hover:text-blue-600"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words px-4 py-3 font-mono text-[0.8rem] leading-relaxed text-gray-700">
        {text}
      </pre>
    </div>
  );
}

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
    <div className="space-y-3">
      <CitationBox label="Plain text" text={plainText} />
      <CitationBox label="BibTeX" text={bibtex} />
    </div>
  );
}
