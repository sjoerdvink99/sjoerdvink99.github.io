"use client";

import { useEffect, useRef } from "react";

/**
 * Renders pre-built HTML (a KaTeX display equation) and shrinks its font
 * just enough to fit the column, so an equation never scrolls sideways.
 */
export function Fit({ html, className = "" }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const fit = () => {
      frame = 0;
      el.style.fontSize = "";
      const over = el.scrollWidth / el.clientWidth;
      if (over > 1) {
        const size = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = `${(size / over) * 0.98}px`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    fit();
    document.fonts?.ready.then(schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(el.parentElement ?? el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
