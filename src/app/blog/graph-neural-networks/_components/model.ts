export type Vec = readonly number[];
export type Matrix = readonly Vec[];
export type Point = [number, number];
export type Edge = readonly [number, number];

export const sum = (a: Vec) => a.reduce((s, v) => s + v, 0);
export const dot = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + v * b[i], 0);
export const add = (a: Vec, b: Vec) => a.map((v, i) => v + b[i]);
export const scale = (a: Vec, k: number) => a.map((v) => v * k);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

export const transpose = (A: Matrix) => A[0].map((_, j) => A.map((row) => row[j]));
export const matmul = (A: Matrix, B: Matrix) =>
  A.map((row) => transpose(B).map((col) => dot(row, col)));
export const relu = (a: Vec) => a.map((v) => Math.max(0, v));
export const leakyRelu = (v: number, slope = 0.2) => (v > 0 ? v : slope * v);
export const softmax = (z: Vec) => {
  const top = Math.max(...z);
  const e = z.map((v) => Math.exp(v - top));
  const total = sum(e);
  return e.map((v) => v / total);
};
export const centroid = (points: Matrix) => scale(points.reduce(add), 1 / points.length);
export const elementMax = (points: Matrix) => points.reduce((m, p) => m.map((v, i) => Math.max(v, p[i])));
export const distance = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function fmt(v: number, digits = 2) {
  const s = Math.abs(v) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : v.toFixed(digits);
  return s.replace("-", "−");
}

export const tex = (v: number, digits = 2) => fmt(v, digits).replace("−", "-");
export const list = (a: Vec, digits = 2) => `[${a.map((v) => fmt(v, digits)).join(", ")}]`;
export const texList = (a: Vec, digits = 2) => `[${a.map((v) => tex(v, digits)).join(",\\ ")}]`;

export const adjacency = (n: number, edges: readonly Edge[]) => {
  const A = Array.from({ length: n }, () => Array<number>(n).fill(0));
  for (const [u, v] of edges) {
    A[u][v] = 1;
    A[v][u] = 1;
  }
  return A;
};

export const withSelfLoops = (A: Matrix) => A.map((row, i) => row.map((v, j) => v + (i === j ? 1 : 0)));
export const neighborsOf = (A: Matrix) => A.map((row) => range(0, row.length - 1).filter((j) => row[j] > 0));

export const N = 8;
export const NODES = range(0, N - 1);
export const EDGES: readonly Edge[] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 4],
  [4, 5],
  [4, 6],
  [5, 6],
  [5, 7],
];
export const CLASS = [0, 0, 0, 0, 1, 1, 1, 1] as const;
export const MISLEADING = [1, 6] as const;

export const X: Matrix = [
  [-1.6, 1.1],
  [0.9, -0.4],
  [-1.3, 0],
  [-0.4, 1.5],
  [1, 0.5],
  [1.8, -0.8],
  [-0.7, -0.2],
  [1.4, -1.7],
];

export const LAYOUT: Matrix = [
  [0, 1.1],
  [1, 0.15],
  [1, 2.05],
  [2, 1.1],
  [3.2, 1.1],
  [4.2, 0.25],
  [4.2, 1.95],
  [5.3, 0.25],
];

export const A = adjacency(N, EDGES);
export const A_HAT = withSelfLoops(A);
export const NEIGHBORS = neighborsOf(A);
export const DEGREE = A.map(sum);
export const DEGREE_HAT = A_HAT.map(sum);

export const meanStep = (H: Matrix) =>
  matmul(A_HAT, H).map((row, i) => scale(row, 1 / DEGREE_HAT[i]));

export const SMOOTH_MAX = 32;
export const SMOOTH: Matrix[] = range(1, SMOOTH_MAX).reduce<Matrix[]>(
  (steps) => [...steps, meanStep(steps[steps.length - 1])],
  [X],
);

const classMean = (H: Matrix, c: number) => centroid(H.filter((_, i) => CLASS[i] === c));
export const CLASS_GAP = SMOOTH.map((H) => distance(classMean(H, 0), classMean(H, 1)));
export const CLASS_MEANS = SMOOTH.map((H) => [classMean(H, 0), classMean(H, 1)]);
export const CLASS_SPREAD = SMOOTH.map(
  (H, k) => sum(H.map((h, i) => distance(h, CLASS_MEANS[k][CLASS[i]]))) / N,
);

export const AGGREGATE = (() => {
  const v = 1;
  const nbrs = NEIGHBORS[v];
  const total = nbrs.map((u) => X[u]).reduce(add);
  const mean = scale(total, 1 / nbrs.length);
  const self = SMOOTH[1][v];
  const steps = nbrs.reduce<Vec[]>((tips, u) => [...tips, add(tips[tips.length - 1], X[u])], [[0, 0]]);
  return { v, nbrs, total, mean, self, steps, closed: [v, ...nbrs] };
})();

export const BOUNDARY = { slope: 1.3, offset: 0.3 };

export const SUMS = matmul(A_HAT, X);
export const MEANS = SMOOTH[1];

export const A_SYM = A_HAT.map((row, i) =>
  row.map((v, j) => v / Math.sqrt(DEGREE_HAT[i] * DEGREE_HAT[j])),
);

export const LAYER = (() => {
  const W: Matrix = [
    [1.2, -0.4],
    [0.6, 1],
  ];
  const map = (p: Vec) => matmul([p], W)[0];
  const aggregated = matmul(A_SYM, X);
  const linear = matmul(aggregated, W);
  const out = linear.map(relu);
  return { W, map, aggregated, linear, out, stages: [X, aggregated, linear, out] };
})();

export const hops = (from: number) => {
  const dist = NODES.map((i) => (i === from ? 0 : Infinity));
  const queue = [from];
  while (queue.length) {
    const v = queue.shift()!;
    for (const u of NEIGHBORS[v]) {
      if (dist[u] === Infinity) {
        dist[u] = dist[v] + 1;
        queue.push(u);
      }
    }
  }
  return dist;
};

export const RECEPTIVE = (() => {
  const v = 0;
  const dist = hops(v);
  const depth = Math.max(...dist);
  const reach = range(0, depth).map((k) =>
    A.map((_, i) => hops(i).map((d) => d <= k)),
  );
  return { v, dist, depth, reach };
})();

export const ATTENTION = (() => {
  const v = 4;
  const nodes = [v, ...NEIGHBORS[v]];
  const aSelf = [0.3, 0.3];
  const aNbr = [0.6, -0.6];
  const raw = nodes.map((u) => dot(aSelf, X[v]) + dot(aNbr, X[u]));
  const scores = raw.map((s) => leakyRelu(s));
  const alpha = softmax(scores);
  const uniform = nodes.map(() => 1 / nodes.length);
  const weighted = (w: Vec) => nodes.map((u, k) => scale(X[u], w[k])).reduce(add);
  return {
    v,
    nodes,
    a: [...aSelf, ...aNbr],
    raw,
    scores,
    alpha,
    uniform,
    mean: weighted(uniform),
    out: weighted(alpha),
    hull: hull(nodes.map((u) => X[u])),
  };
})();

export function hull(points: Matrix): Vec[] {
  const sorted = [...points].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o: Vec, a: Vec, b: Vec) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (ps: Vec[]) =>
    ps.reduce<Vec[]>((h, p) => {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      return [...h, p];
    }, []);
  const lower = half(sorted);
  const upper = half([...sorted].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

export const MULTISETS = (() => {
  const u = [1.5, 0.4];
  const w = [0.3, 1.4];
  const c = [0.3, 0.3];
  const sets = [
    { name: "{u, w}", items: [u, w] },
    { name: "{u, u, w, w}", items: [u, u, w, w] },
    { name: "{u, w, c}", items: [u, w, c] },
  ];
  const summarize = (items: Matrix) => ({
    sum: items.reduce(add),
    mean: centroid(items),
    max: elementMax(items),
  });
  return { u, w, c, sets: sets.map((s) => ({ ...s, ...summarize(s.items) })) };
})();

export type Aggregator = "sum" | "mean" | "max";
export const AGGREGATORS: Aggregator[] = ["sum", "mean", "max"];

export function refine(neighbors: readonly Vec[], rounds: number) {
  const history = [neighbors.map(() => 0)];
  for (let r = 0; r < rounds; r++) {
    const colors = history[history.length - 1];
    const signature = neighbors.map(
      (nbrs, v) => `${colors[v]}|${nbrs.map((u) => colors[u]).sort((a, b) => a - b).join(",")}`,
    );
    const kept = new Map<number, string>();
    const fresh = new Map<string, number>();
    let next = Math.max(...colors) + 1;
    history.push(
      signature.map((s, v) => {
        const c = colors[v];
        if (!kept.has(c)) kept.set(c, s);
        if (kept.get(c) === s) return c;
        if (!fresh.has(s)) fresh.set(s, next++);
        return fresh.get(s)!;
      }),
    );
  }
  return history;
}

const cycle = (n: number, offset = 0): Edge[] =>
  range(0, n - 1).map((i) => [offset + i, offset + ((i + 1) % n)]);

export const WL = (() => {
  const rounds = 3;
  const main = refine(NEIGHBORS, rounds);
  const twinEdges = [...cycle(6), ...cycle(3, 6), ...cycle(3, 9)];
  const twins = refine(neighborsOf(adjacency(12, twinEdges)), rounds);
  const ring = (cx: number, cy: number, r: number, n: number): Vec[] =>
    range(0, n - 1).map((i) => {
      const a = (2 * Math.PI * i) / n - Math.PI / 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  const layout = [...ring(0, 0, 1, 6), ...ring(2.5, 0.15, 0.58, 3), ...ring(4.3, 0.15, 0.58, 3)];
  return { rounds, main, twins, twinEdges, twinLayout: layout };
})();

export const PERMUTATION = [5, 2, 7, 0, 3, 6, 1, 4] as const;
export const permuteMatrix = (M: Matrix, p: readonly number[]) => {
  const out = M.map((row) => [...row]);
  M.forEach((row, i) => row.forEach((v, j) => (out[p[i]][p[j]] = v)));
  return out;
};
export const A_PERMUTED = permuteMatrix(A, PERMUTATION);

export const EMBEDDING = (() => {
  const Z = LAYER.out;
  const pooled = centroid(Z);
  const same: Edge = [0, 2];
  const across: Edge = [2, 5];
  const score = ([u, v]: Edge) => dot(Z[u], Z[v]);
  return { Z, pooled, same, across, sameScore: score(same), acrossScore: score(across) };
})();

export const CORA = {
  nodes: 2708,
  features: 1433,
  classes: 7,
  edges: 10556,
  hidden: 16,
};
