"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "publications", label: "Publications" },
  { id: "contact", label: "Contact" },
];

const item = "transition-colors hover:text-blue-600";

export default function Navbar() {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const isBlog = pathname.startsWith("/blog");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    if (!isHome) return;
    e.preventDefault();
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${targetId}`);
  };

  return (
    <>
      <div ref={sentinelRef} />
      <nav
        className={`sticky top-0 z-10 border-y-2 border-gray-200 bg-white py-4 transition-shadow duration-200 ${
          isSticky ? "shadow-sm" : ""
        }`}
      >
        <ul className="flex flex-wrap justify-center gap-x-6 md:justify-start">
          {SECTIONS.map((section) => (
            <li key={section.id} className="py-1">
              <Link
                href={`/#${section.id}`}
                onClick={(e) => handleSmoothScroll(e, section.id)}
                className={item}
              >
                {section.label}
              </Link>
            </li>
          ))}
          <li className="py-1">
            <Link
              href="/blog/"
              aria-current={isBlog ? "page" : undefined}
              className={`${item} ${isBlog ? "text-blue-600" : ""}`}
            >
              Blog
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
