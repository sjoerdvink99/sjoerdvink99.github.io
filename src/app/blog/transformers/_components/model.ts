export type Matrix = number[][];

export const matmul = (A: Matrix, B: Matrix): Matrix =>
  A.map((row) =>
    B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)),
  );
export const transpose = (A: Matrix): Matrix =>
  A[0].map((_, j) => A.map((row) => row[j]));
export const scale = (A: Matrix, k: number): Matrix =>
  A.map((row) => row.map((v) => v * k));
export const add = (A: Matrix, B: Matrix): Matrix =>
  A.map((row, i) => row.map((v, j) => v + B[i][j]));
export const dot = (a: number[], b: number[]) =>
  a.reduce((s, v, i) => s + v * b[i], 0);
export const cols = (A: Matrix, from: number, to: number): Matrix =>
  A.map((row) => row.slice(from, to));

/** Softmax over each row: every row of the result sums to 1. */
export const softmax = (A: Matrix): Matrix =>
  A.map((row) => {
    const m = Math.max(...row);
    const e = row.map((v) => Math.exp(v - m));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  });

export function fmt(v: number, digits = 2) {
  const s =
    Math.abs(v) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : v.toFixed(digits);
  return s.replace("-", "−");
}

/** Plain-ASCII number for use inside KaTeX source. */
export const tex = (v: number, digits = 2) => fmt(v, digits).replace("−", "-");

/* ------------------------------------------------------------------ */
/* Chapter 1: attention without any learned weights, in two dimensions */

export const WORDS = ["dog", "puppy", "car"] as const;
export const VECS: Matrix = [
  [1.0, 0.5],
  [0.6, 0.6],
  [-0.3, 0.9],
];

export const SIM = matmul(VECS, transpose(VECS));
export const SIM_W = softmax(SIM);
export const SIM_OUT = matmul(SIM_W, VECS);

/** The dog row, step by step. */
export const DOG = (() => {
  const scores = SIM[0];
  const exps = scores.map(Math.exp);
  const total = exps.reduce((a, b) => a + b, 0);
  return { scores, exps, total, weights: SIM_W[0], out: SIM_OUT[0] };
})();

/* ------------------------------------------------------------------ */
/* Chapters 2 to 4: a five-token sentence with D = 4                   */

export const TOKENS = ["the", "dog", "chased", "the", "ball"];
export const T = TOKENS.length;
export const D = 4;
export const H = 2;
export const D_HEAD = D / H;

const EMBED: Record<string, number[]> = {
  the: [0, 0, 1, 0],
  dog: [1, 0, 0, 1],
  chased: [0, 1, 0, 0],
  ball: [1, 0, 0, -0.5],
};
export const embed = (tokens: string[]): Matrix => tokens.map((t) => EMBED[t]);
export const X = embed(TOKENS);

export const W_Q: Matrix = [
  [0, 1.5, 0.5, 0],
  [2, 0, 0, 0],
  [0, 0, 0, 1],
  [0, 0, 0, 0],
];
export const W_K: Matrix = [
  [1, 0, 0, 1],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 0],
];
export const W_V: Matrix = [
  [1, 0, 0, 0.5],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

export function attention(Q: Matrix, K: Matrix, V: Matrix) {
  const dk = Q[0].length;
  const scores = matmul(Q, transpose(K));
  const scaled = scale(scores, 1 / Math.sqrt(dk));
  const weights = softmax(scaled);
  return { scores, scaled, weights, output: matmul(weights, V) };
}

export function selfAttention(X: Matrix) {
  const Q = matmul(X, W_Q);
  const K = matmul(X, W_K);
  const V = matmul(X, W_V);
  return { Q, K, V, ...attention(Q, K, V) };
}

export const ATT = selfAttention(X);

/** The same projections, split into H heads of D_HEAD columns each. */
export const HEADS = Array.from({ length: H }, (_, h) => {
  const [a, b] = [h * D_HEAD, (h + 1) * D_HEAD];
  return attention(cols(ATT.Q, a, b), cols(ATT.K, a, b), cols(ATT.V, a, b));
});

/* Position */

export const SWAPPED = ["the", "ball", "chased", "the", "dog"];
export const SWAPPED_ATT = selfAttention(embed(SWAPPED));

export const P: Matrix = [
  [0.1, 0.2, 0.1, 0.0],
  [0.2, 0.1, -0.1, -0.2],
  [0.0, -0.1, -0.2, 0.1],
  [-0.2, -0.1, 0.1, 0.2],
  [-0.1, 0.1, 0.2, 0.1],
];
export const X_POS = add(X, P);

/* ------------------------------------------------------------------ */
/* Formatting for the worked calculations under the figures            */

export const vec = (v: number[], digits = 1) =>
  `[${v.map((x) => fmt(x, digits)).join(", ")}]`;

const factor = (v: number, digits = 1) =>
  v < 0 ? `(${fmt(v, digits)})` : fmt(v, digits);

/** "1.0×0.6 + 0.5×0.6" */
export const products = (a: number[], b: number[], digits = 1) =>
  a.map((v, i) => `${fmt(v, digits)}×${factor(b[i], digits)}`).join(" + ");

/**
 * A weighted sum of value rows, with equal weights grouped:
 * "0.32·v_dog + 0.12·(v_the + v_chased)".
 */
export function weightedSum(weights: number[], names: string[], prefix = "v_") {
  const groups = new Map<string, string[]>();
  weights.forEach((w, i) => {
    const key = fmt(w);
    groups.set(key, [...(groups.get(key) ?? []), `${prefix}${names[i]}`]);
  });
  return [...groups.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([w, vs]) => (vs.length === 1 ? `${w}·${vs[0]}` : `${w}·(${vs.join(" + ")})`))
    .join(" + ");
}

/* Masked (causal) attention: token i may only look at positions 0..i. */
export const CAUSAL = Array.from({ length: T }, (_, i) =>
  Array.from({ length: T }, (_, j) => j > i),
);
export const MASKED = softmax(
  ATT.scaled.map((row, i) => row.map((v, j) => (CAUSAL[i][j] ? -Infinity : v))),
);
