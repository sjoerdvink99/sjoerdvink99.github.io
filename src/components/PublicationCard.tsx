import Link from "next/link";
import { Publication } from "@/lib/types";
import { Fragment } from "react";
import AwardBadge from "./AwardBadge";
import ResourceLinks from "./ResourceLinks";

function highlightName(authors: string) {
  const name = "Sjoerd Vink";
  const parts = authors.split(name);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <span className="font-semibold text-gray-900">{name}</span>
      )}
    </Fragment>
  ));
}

export default function PublicationCard({ pub }: { pub: Publication }) {
  return (
    <li>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link
          href={`/publications/${pub.slug}/`}
          className="text-lg font-semibold leading-snug text-gray-900 transition-colors hover:text-blue-600"
        >
          {pub.title}
        </Link>
        {pub.bestPaperAward && <AwardBadge />}
      </div>
      <p className="mt-1 text-sm text-gray-600">{highlightName(pub.authors)}</p>
      <p className="text-sm italic text-gray-500">
        {pub.venue}, {pub.year}
      </p>
      <div className="mt-1">
        <ResourceLinks pub={pub} />
      </div>
    </li>
  );
}
