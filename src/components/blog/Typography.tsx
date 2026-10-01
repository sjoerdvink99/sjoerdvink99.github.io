import type { ReactNode } from "react";

export function SectionHead({
  label,
  as: Heading = "h2",
  children,
}: {
  label: ReactNode;
  as?: "h2" | "h3";
  children: ReactNode;
}) {
  return (
    <header className="mb-6">
      <div className="mb-4">{label}</div>
      <Heading
        className={`text-balance font-light leading-[1.15] tracking-tight text-ir-ink ${
          Heading === "h2"
            ? "text-[1.9rem] md:text-[2.25rem]"
            : "text-[1.6rem] md:text-[1.9rem]"
        }`}
      >
        {children}
      </Heading>
    </header>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-pretty text-[1.05rem] leading-[1.7] text-gray-600 last:mb-0">
      {children}
    </p>
  );
}

export function KeyLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-balance text-[1.45rem] font-light leading-snug tracking-tight text-ir-ink">
      {children}
    </p>
  );
}

export function Display({ children }: { children: ReactNode }) {
  return <div className="my-6 text-[1.2rem] text-ir-ink">{children}</div>;
}
