import { Publication } from "@/lib/types";

export function getResources(pub: Publication) {
  return [
    pub.paperLink !== "#" && { label: "Paper", href: pub.paperLink },
    pub.codeLink && { label: "Code", href: pub.codeLink },
    pub.videoLink && { label: "Video", href: pub.videoLink },
  ].filter((resource): resource is { label: string; href: string } =>
    Boolean(resource)
  );
}

export default function ResourceLinks({ pub }: { pub: Publication }) {
  const resources = getResources(pub);
  if (resources.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-4 text-sm">
      {resources.map((resource) => (
        <li key={resource.label}>
          <a
            href={resource.href}
            target="_blank"
            rel="noreferrer"
            className="link text-gray-600"
          >
            {resource.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
