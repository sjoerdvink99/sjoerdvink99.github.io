import type { CSSProperties } from "react";

type Token =
  | { kind: "id"; text: string; sub?: string; prime: string }
  | { kind: "op"; text: string }
  | { kind: "text"; text: string };

const PATTERN =
  /([A-Za-z]+)(?:_([A-Za-z0-9]+))?([′″]*)|\s*([=→∈:|∘⇒∧,]+)\s*|([^A-Za-z=→∈:|∘⇒∧,]+)/g;

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  for (const m of src.matchAll(PATTERN)) {
    if (m[1])
      tokens.push({ kind: "id", text: m[1], sub: m[2], prime: m[3] ?? "" });
    else if (m[4]) tokens.push({ kind: "op", text: m[4] });
    else tokens.push({ kind: "text", text: m[5] });
  }
  return tokens;
}

const isVariable = (s: string) => s.length === 1;

export function Eq({
  children,
  className = "",
  style,
}: {
  children: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`font-math whitespace-nowrap ${className}`} style={style}>
      {tokenize(children).map((t, i) => {
        if (t.kind === "op") {
          const spaced = t.text !== ",";
          return (
            <span key={i} className={spaced ? "mx-[0.22em]" : "mr-[0.2em]"}>
              {t.text}
            </span>
          );
        }
        if (t.kind === "text") return <span key={i}>{t.text}</span>;
        return (
          <span key={i}>
            <span className={isVariable(t.text) ? "italic" : ""}>{t.text}</span>
            {t.prime}
            {t.sub && (
              <sub
                className={`text-[0.68em] ${isVariable(t.sub) ? "italic" : ""}`}
              >
                {t.sub}
              </sub>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function SvgEq({
  children,
  x,
  y,
  size = 15,
  fill = "currentColor",
  anchor = "start",
}: {
  children: string;
  x: number;
  y: number;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      textAnchor={anchor}
      dominantBaseline="middle"
      className="font-math"
    >
      {tokenize(children).map((t, i) => {
        if (t.kind === "op")
          return <tspan key={i}>{t.text === "," ? ", " : ` ${t.text} `}</tspan>;
        if (t.kind === "text") return <tspan key={i}>{t.text}</tspan>;
        return (
          <tspan key={i}>
            <tspan fontStyle={isVariable(t.text) ? "italic" : "normal"}>
              {t.text}
            </tspan>
            {t.prime && <tspan>{t.prime}</tspan>}
            {t.sub && (
              <>
                <tspan dy="0.35em" fontSize="0.68em" fontStyle="italic">
                  {t.sub}
                </tspan>
                <tspan dy="-0.35em"> </tspan>
              </>
            )}
          </tspan>
        );
      })}
    </text>
  );
}
