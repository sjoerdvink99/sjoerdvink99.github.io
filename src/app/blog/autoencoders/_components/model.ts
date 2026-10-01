import { gauss, rand } from "@/components/blog/random";

export type Vec2 = [number, number];

export const snap = (v: number, digits = 6) =>
  Math.round(v * 10 ** digits) / 10 ** digits;

export const dot = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1];
export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: Vec2, k: number): Vec2 => [a[0] * k, a[1] * k];

export function fmt(v: number, digits = 1) {
  const s =
    Math.abs(v) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : v.toFixed(digits);
  return s.replace("-", "−");
}

export const fmtVec = (v: readonly number[], digits = 1) =>
  `[${v.map((n) => fmt(n, digits)).join(", ")}]`;

interface Params {
  wEnc: Vec2;
  bEnc: number;
  wDec: Vec2;
  bDec: Vec2;
}

export const INIT: Params = {
  wEnc: [0.5, -0.3],
  bEnc: 0.1,
  wDec: [1.5, 0.5],
  bDec: [0.2, 0.2],
};

export const encode = (p: Params, x: Vec2) => dot(x, p.wEnc) + p.bEnc;
export const decode = (p: Params, z: number): Vec2 =>
  add(mul(p.wDec, z), p.bDec);
export const mse = (a: Vec2, b: Vec2) =>
  ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) / 2;

export const X0: Vec2 = [2, 1];
export const Z0 = encode(INIT, X0);
export const XHAT0 = decode(INIT, Z0);
export const LOSS0 = mse(XHAT0, X0);

export const GRAD = (() => {
  const dXhat = sub(XHAT0, X0);
  const dZ = dot(dXhat, INIT.wDec);
  return {
    dXhat,
    dWDec: mul(dXhat, Z0),
    dBDec: dXhat,
    dZ,
    dWEnc: mul(X0, dZ),
    dBEnc: dZ,
  };
})();

export const LR = 0.1;

function step(p: Params, g: typeof GRAD, lr = LR): Params {
  return {
    wEnc: sub(p.wEnc, mul(g.dWEnc, lr)),
    bEnc: p.bEnc - lr * g.dBEnc,
    wDec: sub(p.wDec, mul(g.dWDec, lr)),
    bDec: sub(p.bDec, mul(g.dBDec, lr)),
  };
}

export const AFTER_ONE_STEP = (() => {
  const p = step(INIT, GRAD);
  return { params: p, loss: mse(decode(p, encode(p, X0)), X0) };
})();

const CENTER: Vec2 = [2, 1.25];
const ANGLE = (25 * Math.PI) / 180;
const ALONG: Vec2 = [snap(Math.cos(ANGLE)), snap(Math.sin(ANGLE))];
const ACROSS: Vec2 = [-ALONG[1], ALONG[0]];

export const N_ROWS = 100;

export const DATA: Vec2[] = Array.from({ length: N_ROWS }, (_, i) => {
  if (i === 0) return X0;
  const t = (rand(i * 3 + 11) - 0.5) * 3.4;
  const n = gauss(i * 5 + 3) * 0.26;
  return add(CENTER, add(mul(ALONG, t), mul(ACROSS, n)));
});

export const SAMPLE = [0, 7, 19, 33, 48, 62, 85].map((i) => DATA[i]);

export const BATCHES = 5;
export const EPOCHS = 40;
const TRAIN_LR = 0.05;

function shuffle(n: number, seed: number) {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand(seed * 1009 + i) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function batchGradient(p: Params, rows: Vec2[]) {
  const g = {
    dWEnc: [0, 0] as Vec2,
    dBEnc: 0,
    dWDec: [0, 0] as Vec2,
    dBDec: [0, 0] as Vec2,
  };
  for (const x of rows) {
    const z = encode(p, x);
    const dXhat = mul(sub(decode(p, z), x), 1 / rows.length);
    const dZ = dot(dXhat, p.wDec);
    g.dWDec = add(g.dWDec, mul(dXhat, z));
    g.dBDec = add(g.dBDec, dXhat);
    g.dWEnc = add(g.dWEnc, mul(x, dZ));
    g.dBEnc += dZ;
  }
  return g;
}

const datasetLoss = (p: Params) =>
  DATA.reduce((s, x) => s + mse(decode(p, encode(p, x)), x), 0) / N_ROWS;

export const TRAINING = (() => {
  let p = INIT;
  const losses = [datasetLoss(p)];
  const orders: number[][] = [];
  for (let e = 0; e < EPOCHS; e++) {
    const order = shuffle(N_ROWS, e + 1);
    orders.push(order);
    const size = N_ROWS / BATCHES;
    for (let b = 0; b < BATCHES; b++) {
      const rows = order.slice(b * size, (b + 1) * size).map((i) => DATA[i]);
      const g = batchGradient(p, rows);
      p = {
        wEnc: sub(p.wEnc, mul(g.dWEnc, TRAIN_LR)),
        bEnc: p.bEnc - TRAIN_LR * g.dBEnc,
        wDec: sub(p.wDec, mul(g.dWDec, TRAIN_LR)),
        bDec: sub(p.bDec, mul(g.dBDec, TRAIN_LR)),
      };
      losses.push(datasetLoss(p));
    }
  }
  return { params: p, losses, firstOrder: orders[0] };
})();

export const TRAINED = TRAINING.params;

export const MU: Vec2 = [1.2, 0.6];
export const SIGMA: Vec2 = [0.8, 0.5];
export const LOGVAR: Vec2 = [2 * Math.log(SIGMA[0]), 2 * Math.log(SIGMA[1])];
export const VAR: Vec2 = [SIGMA[0] ** 2, SIGMA[1] ** 2];
export const EPS: Vec2 = [0.9, -1.1];

export const reparam = (mu: Vec2, sigma: Vec2, eps: Vec2): Vec2 => [
  mu[0] + sigma[0] * eps[0],
  mu[1] + sigma[1] * eps[1],
];

export const kl = (mu: Vec2, sigma: Vec2) =>
  0.5 *
  [0, 1].reduce(
    (s, j) => s + mu[j] ** 2 + sigma[j] ** 2 - Math.log(sigma[j] ** 2) - 1,
    0,
  );

export function normal(seed: number): Vec2 {
  const u = Math.max(1e-6, rand(seed * 2 + 1));
  const v = rand(seed * 2 + 2);
  const r = Math.sqrt(-2 * Math.log(u));
  return [
    snap(r * Math.cos(2 * Math.PI * v)),
    snap(r * Math.sin(2 * Math.PI * v)),
  ];
}

export interface Shape {
  a: number;
  b: number;
  turn?: number;
}

export function shapePath(
  { a, b, turn = 0 }: Shape,
  radius: number,
  samples = 72,
) {
  const pts: string[] = [];
  for (let k = 0; k < samples; k++) {
    const t = (k / samples) * 2 * Math.PI;
    const r =
      (radius * (1 + a * Math.cos(2 * t) + b * Math.cos(3 * t))) /
      (1 + Math.abs(a) + Math.abs(b) * 0.6);
    const u = t + turn;
    pts.push(`${(r * Math.cos(u)).toFixed(2)} ${(r * Math.sin(u)).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

export const decodeShape = (z: Vec2): Shape => ({
  a: snap(0.34 * Math.tanh(z[0] * 0.7)),
  b: snap(0.2 * Math.tanh(z[1] * 0.8)),
  turn: snap(0.25 * Math.tanh(z[0] * z[1] * 0.4)),
});

export const ENCODED: { mu: Vec2; sigma: Vec2 }[] = [
  { mu: [-2.6, 1.4], sigma: [0.09, 0.07] },
  { mu: [2.5, 2.1], sigma: [0.07, 0.1] },
  { mu: [0.4, -2.7], sigma: [0.08, 0.08] },
  { mu: [-2.2, -1.9], sigma: [0.1, 0.07] },
  { mu: [2.9, -0.6], sigma: [0.07, 0.09] },
];

export function regularized(e: { mu: Vec2; sigma: Vec2 }, beta: number) {
  const s = beta === Infinity ? 1 : snap(1 - Math.exp(-0.45 * beta));
  const mu = mul(e.mu, 1 - s);
  const sigma: Vec2 = [
    snap(e.sigma[0] ** (1 - s)),
    snap(e.sigma[1] ** (1 - s)),
  ];
  return { mu, sigma, kl: kl(mu, sigma) };
}

export const N_FEATURES = 8;

const ANGLE_ORDER = [5, 1, 3, 7, 0, 2, 6, 4];
export const DICT: Vec2[] = ANGLE_ORDER.map((k) => {
  const a = ((k * 45 + 10) * Math.PI) / 180;
  return [snap(Math.cos(a)), snap(Math.sin(a))];
});

export function sparseCode(y: Vec2): number[] {
  const z = new Array(N_FEATURES).fill(0);
  if (Math.hypot(y[0], y[1]) < 1e-9) return z;
  const byAngle = DICT.map((d, j) => ({ j, a: Math.atan2(d[1], d[0]) })).sort(
    (p, q) => p.a - q.a,
  );
  const ya = Math.atan2(y[1], y[0]);
  for (let k = 0; k < byAngle.length; k++) {
    const p = byAngle[k];
    const q = byAngle[(k + 1) % byAngle.length];
    const span = (q.a - p.a + 2 * Math.PI) % (2 * Math.PI);
    const off = (ya - p.a + 2 * Math.PI) % (2 * Math.PI);
    if (off <= span + 1e-9) {
      const [a, b] = [DICT[p.j], DICT[q.j]];
      const det = a[0] * b[1] - a[1] * b[0];
      z[p.j] = (y[0] * b[1] - y[1] * b[0]) / det;
      z[q.j] = (a[0] * y[1] - a[1] * y[0]) / det;
      return z;
    }
  }
  return z;
}

export const reconstruct = (z: number[]): Vec2 =>
  z.reduce<Vec2>((s, v, j) => add(s, mul(DICT[j], v)), [0, 0]);

export const SPARSE_Z = (() => {
  const z = new Array(N_FEATURES).fill(0);
  z[2] = 1.4;
  z[5] = 0.6;
  return z;
})();
export const SPARSE_X = reconstruct(SPARSE_Z);

const opposite = (j: number) => ANGLE_ORDER.indexOf((ANGLE_ORDER[j] + 4) % 8);
export const DENSE_Z = (() => {
  const z = SPARSE_Z.map((v) => v + 0.2);
  const pairs: [number, number][] = [
    [0, 0.35],
    [3, 0.15],
    [6, 0.25],
  ];
  for (const [j, v] of pairs) {
    z[j] += v;
    z[opposite(j)] += v;
  }
  return z;
})();
