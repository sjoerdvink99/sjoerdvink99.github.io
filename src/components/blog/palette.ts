export const ir = {
  space: { DEFAULT: "#94a3b8", soft: "#f1f5f9", ink: "#64748b" },
  rep: { DEFAULT: "#2563eb", soft: "#dbeafe" },
  transform: { DEFAULT: "#d97706", soft: "#fef3c7", ink: "#b45309" },
  human: { DEFAULT: "#e11d48", soft: "#ffe4e6" },
  ink: { DEFAULT: "#111827", muted: "#6b7280", faint: "#d1d5db" },
};

export const C = {
  space: ir.space.DEFAULT,
  spaceSoft: ir.space.soft,
  spaceInk: ir.space.ink,
  rep: ir.rep.DEFAULT,
  repSoft: ir.rep.soft,
  transform: ir.transform.DEFAULT,
  transformSoft: ir.transform.soft,
  transformInk: ir.transform.ink,
  human: ir.human.DEFAULT,
  humanSoft: ir.human.soft,
  ink: ir.ink.DEFAULT,
  muted: ir.ink.muted,
  faint: ir.ink.faint,
};

export type Tone = "space" | "rep" | "transform" | "human" | "ink";
