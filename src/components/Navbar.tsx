"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ showBlog = false }: { showBlog?: boolean }) {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";

  useEffect(() => {
    if (!isHome) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isHome]);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    if (!isHome) return;
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div ref={sentinelRef} />
      <nav
        className={`sticky top-0 z-10 bg-white border-y-2 py-4 transition-shadow duration-200 ${
          isSticky ? "shadow-sm" : ""
        }`}
      >
        <ul className="flex flex-wrap justify-center md:justify-start space-x-4 md:space-x-6">
          {isHome ? (
            <>
              <li className="py-1">
                <a href="#about" onClick={(e) => handleSmoothScroll(e, "about")}>
                  About
                </a>
              </li>
              <li className="py-1">
                <a
                  href="#publications"
                  onClick={(e) => handleSmoothScroll(e, "publications")}
                >
                  Publications
                </a>
              </li>
              <li className="py-1">
                <a
                  href="#contact"
                  onClick={(e) => handleSmoothScroll(e, "contact")}
                >
                  Contact
                </a>
              </li>
            </>
          ) : (
            <>
              <li className="py-1">
                <Link href="/#about">About</Link>
              </li>
              <li className="py-1">
                <Link href="/#publications">Publications</Link>
              </li>
              <li className="py-1">
                <Link href="/#contact">Contact</Link>
              </li>
            </>
          )}
          {showBlog && (
            <li className="py-1">
              <Link href="/blog/">Blog</Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}
