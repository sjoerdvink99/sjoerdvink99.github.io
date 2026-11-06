import Image from "next/image";
import { software } from "@/data/software";

export default function SoftwareSection() {
  return (
    <section
      id="software"
      className="scroll-mt-20 border-b-2 border-gray-200 py-10"
    >
      <h2 className="section-title">Software Contributions</h2>
      <ul className="space-y-6">
        {software.map((item) => (
          <li key={item.name} className="flex items-center gap-4">
            <Image
              src={item.logo}
              width={48}
              height={48}
              alt=""
              className="h-12 w-12 shrink-0 object-contain"
            />
            <div>
              <a
                href={item.website}
                target="_blank"
                rel="noreferrer"
                className="text-lg font-semibold leading-snug text-gray-900 transition-colors hover:text-blue-600"
              >
                {item.name}
              </a>
              <p className="text-sm text-gray-600">{item.description}</p>
              <ul className="mt-1 flex flex-wrap gap-x-4 text-sm">
                {[
                  { label: "Website", href: item.website },
                  ...(item.github ? [{ label: "Code", href: item.github }] : []),
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="link text-gray-600"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
