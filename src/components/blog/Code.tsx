import type { ReactNode } from "react";

type Kind =
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "call"
  | "op"
  | "name"
  | "space";

const TOKEN =
  /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|(\b(?:for|in|def|class|return|import|from|as|if|else|lambda|None|True|False)\b)|([A-Za-z_]\w*)(?=\()|([A-Za-z_]\w*)|(\s+)|(.)/g;

const KINDS: Kind[] = [
  "comment",
  "string",
  "number",
  "keyword",
  "call",
  "name",
  "space",
  "op",
];

const STYLE: Record<Kind, string> = {
  comment: "italic text-gray-400",
  string: "text-emerald-700",
  number: "text-ir-transform-ink",
  keyword: "text-rose-700",
  call: "text-ir-rep",
  op: "text-gray-500",
  name: "text-ir-ink",
  space: "",
};

interface Piece {
  text: string;
  kind: Kind;
  start: number;
}

function tokenize(line: string): Piece[] {
  const pieces: Piece[] = [];
  for (const m of line.matchAll(TOKEN)) {
    const g = m.slice(1).findIndex((s) => s !== undefined);
    pieces.push({ text: m[0], kind: KINDS[g], start: m.index });
  }
  return pieces;
}

export type Focus = number | [line: number, fragment: string];

function focusRanges(lines: string[], focus: Focus[]) {
  const ranges: [number, number][][] = lines.map(() => []);
  for (const f of focus) {
    if (typeof f === "number") {
      const indent = lines[f].length - lines[f].trimStart().length;
      ranges[f].push([indent, lines[f].length]);
    } else {
      const [l, frag] = f;
      const at = lines[l].indexOf(frag);
      if (at >= 0) ranges[l].push([at, at + frag.length]);
    }
  }
  return ranges;
}

function splitAt(pieces: Piece[], cuts: number[]) {
  const out: Piece[] = [];
  for (const p of pieces) {
    let start = p.start;
    let text = p.text;
    for (const c of cuts) {
      if (c > start && c < start + text.length) {
        out.push({ ...p, text: text.slice(0, c - start), start });
        text = text.slice(c - start);
        start = c;
      }
    }
    out.push({ ...p, text, start });
  }
  return out;
}

export function Code({
  code,
  focus,
  className = "",
}: {
  code: string;
  focus?: Focus[];
  className?: string;
}) {
  const lines = code.split("\n");
  const focused = focus !== undefined && focus.length > 0;
  const ranges = focused ? focusRanges(lines, focus) : lines.map(() => []);
  const longest = Math.max(...lines.map((l) => l.length));

  return (
    <div className={`[container-type:inline-size] ${className}`}>
      <pre
        className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50/80 px-3.5 py-3 font-mono text-[12px] leading-[1.75]"
        style={{
          fontSize: `min(13px, calc((100cqi - 30px) / ${(longest * 0.62).toFixed(2)}))`,
        }}
      >
        <code>
          {lines.map((line, l) => {
            const r = ranges[l];
            const cuts = r.flat().sort((a, b) => a - b);
            const inside = (i: number) => r.some(([a, b]) => i >= a && i < b);
            const groups: { on: boolean; pieces: Piece[] }[] = [];
            for (const p of splitAt(tokenize(line), cuts)) {
              const on = inside(p.start);
              const last = groups[groups.length - 1];
              if (last && last.on === on) last.pieces.push(p);
              else groups.push({ on, pieces: [p] });
            }
            return (
              <span key={l} className="block min-h-[1.75em]">
                {groups.map((g, k) => {
                  const spans: ReactNode = g.pieces.map((p, i) => (
                    <span key={i} className={STYLE[p.kind]}>
                      {p.text}
                    </span>
                  ));
                  return (
                    <span
                      key={k}
                      className={`rounded-[3px] transition-[opacity,background-color,box-shadow] duration-500 motion-reduce:transition-none ${
                        g.on
                          ? "bg-amber-100 shadow-[0_0_0_2px_theme(colors.amber.100)]"
                          : focused
                            ? "opacity-50"
                            : ""
                      }`}
                    >
                      {spans}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
