import { gauss } from "@/components/blog/random";

export type Vec = readonly number[];
export type Matrix = readonly Vec[];
export type Point = [number, number];

export const sum = (a: Vec) => a.reduce((s, v) => s + v, 0);
export const mean = (a: Vec) => sum(a) / a.length;
export const dot = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + v * b[i], 0);
export const norm = (a: Vec) => Math.sqrt(dot(a, a));
export const add = (a: Vec, b: Vec) => a.map((v, i) => v + b[i]);
export const scale = (a: Vec, k: number) => a.map((v) => v * k);
export const unit = (a: Vec) => scale(a, 1 / norm(a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);
export const radians = (deg: number) => (deg * Math.PI) / 180;

export const transpose = (A: Matrix) => A[0].map((_, j) => A.map((row) => row[j]));
export const matvec = (M: Matrix, x: Vec) => M.map((row) => dot(row, x));
export const matmul = (A: Matrix, B: Matrix) =>
  A.map((row) => transpose(B).map((col) => dot(row, col)));
export const det = (M: Matrix) => M[0][0] * M[1][1] - M[0][1] * M[1][0];
export const affine = (M: Matrix, b: Vec) => (x: Vec) => add(matvec(M, x), b);

export const relu = (a: Vec) => a.map((v) => Math.max(0, v));
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
export const softmax = (z: Vec, temperature = 1) => {
  const top = Math.max(...z);
  const e = z.map((v) => Math.exp((v - top) / temperature));
  const total = sum(e);
  return e.map((v) => v / total);
};

export function fmt(v: number, digits = 2) {
  const s = Math.abs(v) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : v.toFixed(digits);
  return s.replace("-", "−");
}

export const tex = (v: number, digits = 2) => fmt(v, digits).replace("−", "-");
export const list = (a: Vec, digits = 2) => `[${a.map((v) => fmt(v, digits)).join(", ")}]`;
const operand = (v: number, digits: number) => (v < 0 ? `(${fmt(v, digits)})` : fmt(v, digits));
export const times = (a: number, b: number, digits = 0) =>
  `${operand(a, digits)}×${operand(b, digits)}`;

export const ARROWS = (() => {
  const v = [3, 2];
  const w = [-1, 1];
  return {
    v,
    w,
    sum: add(v, w),
    length: norm(v),
    long: scale(v, 1.5),
    flip: scale(v, -0.5),
  };
})();

export const ANALOGY = [
  { word: "man", at: [0.5, 0] },
  { word: "woman", at: [1, 2] },
  { word: "king", at: [3.5, 0.3] },
  { word: "queen", at: [4, 2.3] },
] as const;

export const EMBEDDING = range(0, 5).map((i) => Math.round(gauss(i * 13 + 5) * 100) / 100);

export const DOT = (() => {
  const a = [3, 1];
  const b = [1, 2];
  const base = Math.atan2(a[1], a[0]);
  const length = norm(b);
  const turn = (deg: number) => [
    length * Math.cos(base + radians(deg)),
    length * Math.sin(base + radians(deg)),
  ];
  const at = (deg: number) => dot(a, turn(deg));
  return { a, b, base, turn, at, angles: [45, 45, 45, 90, 150], max: norm(a) * length };
})();

export const SEARCH = (() => {
  const query = [1, 0.58];
  const items = [
    { word: "dog", v: [2.6, 0.4] },
    { word: "puppy", v: [0.9, 0.5] },
    { word: "truck", v: [0.4, 2.1] },
    { word: "stock", v: [-1.5, 1.1] },
  ];
  return {
    query,
    items,
    raw: items.map((i) => dot(i.v, query)),
    cosine: items.map((i) => dot(unit(i.v), unit(query))),
  };
})();

export const NEURON = {
  w: [1, 1],
  bias: -3,
  yes: [
    [2.5, 2],
    [3, 1.2],
    [1.8, 2.8],
    [3.4, 2.4],
    [2.2, 1.6],
  ],
  no: [
    [0.5, 0.4],
    [1.2, -0.6],
    [-0.6, 1.2],
    [1.5, 1],
    [0.2, 1.8],
    [-0.8, -0.5],
    [2, 0.2],
  ],
  probe: [2.5, 2],
  layer: [
    { w: [1, 1], b: -3 },
    { w: [1, -1.2], b: -0.6 },
    { w: [-0.5, 1], b: -1.8 },
  ],
};

export const LINEAR = (() => {
  const A = [
    [2, -1],
    [1, 1],
  ];
  const R = [
    [0, -1],
    [1, 0],
  ];
  const x = [1, 2];
  const RA = matmul(R, A);
  return { A, R, RA, x, Ax: matvec(A, x), RAx: matvec(RA, x), det: det(A) };
})();

export const MATMUL = (() => {
  const A = [
    [1, 2, 0],
    [0, 1, 3],
  ];
  const B = [
    [2, 1],
    [0, 1],
    [1, 0],
  ];
  return { A, B, C: matmul(A, B) };
})();

export const FOLD = (() => {
  const W1 = [
    [0.6, -0.3],
    [0.3, 0.6],
  ];
  const b1 = [0.3, 0.3];
  const W2 = [
    [1, -1],
    [0.5, 0.8],
  ];
  const b2 = [-0.3, -1];
  const first = affine(W1, b1);
  const second = affine(W2, b2);
  const maps: ((p: Vec) => Vec)[] = [
    (p) => p,
    first,
    (p) => second(first(p)),
    (p) => relu(first(p)),
    (p) => second(relu(first(p))),
  ];
  return { W1, b1, W2, b2, maps };
})();

export const SLOPE = (() => {
  const f = (x: number) => (x - 1) ** 2 / 3 + 0.3;
  const df = (x: number) => (2 * (x - 1)) / 3;
  const x0 = 2.5;
  const secant = (h: number) => (f(x0 + h) - f(x0)) / h;
  const descend = (lr: number, n: number) =>
    range(1, n).reduce((xs) => [...xs, xs[xs.length - 1] - lr * df(xs[xs.length - 1])], [x0]);
  return { f, df, x0, secant, h: [1.5, 0.5], slow: descend(0.75, 4), fast: descend(3.3, 4) };
})();

export const BOWL = (() => {
  const loss = (p: Vec) => p[0] ** 2 / 2 + 2 * p[1] ** 2;
  const grad = (p: Vec) => [p[0], 4 * p[1]];
  const start = [-2.5, 0.8];
  const descend = (lr: number, n: number) =>
    range(1, n).reduce(
      (ps: Vec[]) => [...ps, add(ps[ps.length - 1], scale(grad(ps[ps.length - 1]), -lr))],
      [start],
    );
  return {
    loss,
    grad,
    start,
    levels: [0.25, 1, 2.25, 4, 6.25],
    slow: descend(0.2, 12),
    fast: descend(0.45, 12),
  };
})();

export const CHAIN = (() => {
  const x = 1.5;
  const nudge = 0.2;
  const u = x ** 2;
  const y = 3 * u + 1;
  const du = 2 * x;
  const dy = 3;
  return { x, nudge, u, y, du, dy, total: du * dy };
})();

export const GRAPH = (() => {
  const x = 1.5;
  const w = 0.8;
  const b = -0.2;
  const y = 1;
  const p = w * x;
  const z = p + b;
  const a = sigmoid(z);
  const loss = (a - y) ** 2;
  const dA = 2 * (a - y);
  const local = a * (1 - a);
  const dZ = dA * local;
  return { x, w, b, y, p, z, a, loss, dA, local, dZ, dW: dZ * x, dX: dZ * w };
})();

export const SPREAD = (() => {
  const data = [1, 3, 4, 5, 6, 7, 9];
  const mu = mean(data);
  const variance = mean(data.map((v) => (v - mu) ** 2));
  const sigma = Math.sqrt(variance);
  return { data, mu, variance, sigma, z: data.map((v) => (v - mu) / sigma) };
})();

export const NEXT = (() => {
  const tokens = ["mat", "floor", "bed", "moon"];
  const logits = [3, 2, 0.5, -1];
  const exps = logits.map(Math.exp);
  return { tokens, logits, exps, total: sum(exps), p: softmax(logits) };
})();

export const SURPRISE = (() => {
  const cases = [NEXT.p, [0.05, 0.88, 0.05, 0.02], [0.97, 0.02, 0.008, 0.002]];
  const target = 0;
  const onehot = NEXT.tokens.map((_, k) => (k === target ? 1 : 0));
  return {
    cases,
    target,
    loss: cases.map((p) => -Math.log(p[target])),
    grad: NEXT.p.map((v, k) => v - onehot[k]),
  };
})();

export const TRAINING = (() => {
  const centers = [
    [-1.2, -0.6],
    [1.2, -0.6],
    [0, 1.2],
  ];
  const samples = range(0, 44).map((i) => ({
    x: [centers[i % 3][0] + gauss(i * 7 + 1) * 0.7, centers[i % 3][1] + gauss(i * 7 + 3) * 0.7],
    label: i % 3,
  }));
  const X = samples.map((s) => s.x);
  const Y = samples.map((s) => centers.map((_, k) => (k === s.label ? 1 : 0)));
  const n = samples.length;
  const lr = 1;
  const steps = 60;

  let W: Matrix = [
    [0, 0, 0],
    [0, 0, 0],
  ];
  let b: Vec = [0, 0, 0];
  const losses: number[] = [];
  const predict = () => matmul(X, W).map((row) => softmax(add(row, b)));
  const lossOf = (P: Matrix) => mean(P.map((p, i) => -Math.log(p[samples[i].label])));
  for (let step = 0; step < steps; step++) {
    const P = predict();
    losses.push(lossOf(P));
    const G = P.map((p, i) => p.map((v, k) => (v - Y[i][k]) / n));
    const dW = matmul(transpose(X), G);
    const db = transpose(G).map(sum);
    W = W.map((row, i) => row.map((v, k) => v - lr * dW[i][k]));
    b = b.map((v, k) => v - lr * db[k]);
  }
  losses.push(lossOf(predict()));
  return { n, lr, steps, losses };
})();
