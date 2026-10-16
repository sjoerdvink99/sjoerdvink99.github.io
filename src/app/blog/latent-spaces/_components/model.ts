import { gauss } from "@/components/blog/random";

export type Vec = readonly number[];
export type Point = [number, number];

export const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);
export const dot = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + v * b[i], 0);
export const add = (a: Vec, b: Vec) => a.map((v, i) => v + b[i]);
export const sub = (a: Vec, b: Vec) => a.map((v, i) => v - b[i]);
export const scale = (a: Vec, k: number) => a.map((v) => v * k);
export const norm = (a: Vec) => Math.hypot(...a);
export const unit = (a: Vec) => scale(a, 1 / norm(a));
export const mean = (points: readonly Vec[]) => scale(points.reduce(add), 1 / points.length);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpVec = (a: Vec, b: Vec, t: number) => a.map((v, i) => lerp(v, b[i], t));
export const polar = (angle: number, r = 1): Vec => [r * Math.cos(angle), r * Math.sin(angle)];
export const perp = (a: Vec): Vec => [-a[1], a[0]];
export const sigmoid = (v: number) => 1 / (1 + Math.exp(-v));
export const project = (v: Vec, u: Vec) => scale(unit(u), dot(v, unit(u)));
const reject = (v: Vec, u: Vec) => sub(v, project(v, u));
export const degrees = (radians: number) => (radians * 180) / Math.PI;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function fmt(v: number, digits = 2) {
  const s = Math.abs(v) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : v.toFixed(digits);
  return s.replace("-", "−");
}

export const tex = (v: number, digits = 2) => fmt(v, digits).replace("−", "-");
export const list = (a: Vec, digits = 2) => `[${a.map((v) => fmt(v, digits)).join(", ")}]`;
export const texList = (a: Vec, digits = 2) => `[${a.map((v) => tex(v, digits)).join(",\\ ")}]`;

const SMILE = polar(Math.PI / 6);
const EYES = polar((2 * Math.PI) / 3);

export interface Look {
  smile: number;
  eyes: number;
}

export const decode = (z: Vec): Look => ({
  smile: Math.tanh(0.8 * dot(z, SMILE)),
  eyes: sigmoid(1.6 * dot(z, EYES)),
});

const compose = (smile: number, eyes: number) => add(scale(SMILE, smile), scale(EYES, eyes));

export const FACES: Vec[] = range(0, 39).map((i) => {
  const s = 2.4 * gauss(3 * i + 1);
  return compose(s, -0.5 * s + 1.6 * gauss(3 * i + 2));
});

export const SMILING = FACES.map((z) => decode(z).smile > 0);
const OPEN = FACES.map((z) => decode(z).eyes > 0.5);

const where = (flags: readonly boolean[], want: boolean) => FACES.filter((_, i) => flags[i] === want);

export const SMILE_MEANS = [mean(where(SMILING, false)), mean(where(SMILING, true))] as const;
export const SMILE_DIR = sub(SMILE_MEANS[1], SMILE_MEANS[0]);

export const ATLAS = range(0, 6).flatMap((r) =>
  range(0, 6).map((c) => [-2.4 + c * 0.8, 2.4 - r * 0.8] as Vec),
);

export const TOUR: Vec[] = [
  [-1.6, -1.2],
  [0.4, -1.6],
  [1.6, 0],
];

export const BASE = compose(-0.9, 0.7);
export const EDIT_STEPS = [0, 0, 1, 1];

function trainProbe(labels: readonly boolean[]) {
  let w: Vec = [0, 0];
  let b = 0;
  for (let k = 0; k < 3000; k++) {
    let gw: Vec = [0, 0];
    let gb = 0;
    FACES.forEach((z, i) => {
      const err = sigmoid(dot(w, z) + b) - (labels[i] ? 1 : 0);
      gw = add(gw, scale(z, err));
      gb += err;
    });
    w = sub(w, scale(add(scale(gw, 1 / FACES.length), scale(w, 0.002)), 0.8));
    b -= (0.8 * gb) / FACES.length;
  }
  return w;
}

export const EYE_DIR = unit(trainProbe(OPEN));
export const SMILE_ONLY = reject(SMILE_DIR, EYE_DIR);

export const INDEPENDENT = (() => {
  const before = decode(BASE);
  const tangled = decode(add(BASE, SMILE_DIR));
  const clean = decode(add(BASE, SMILE_ONLY));
  return { before, tangled, clean };
})();

function logGamma(x: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  const y = x - 1;
  const t = y + 7.5;
  const s = g.reduce((acc, c, i) => acc + c / (y + i + 1), 0.99999999999980993);
  return 0.5 * Math.log(2 * Math.PI) + (y + 0.5) * Math.log(t) - t + Math.log(s);
}

export function shell(d: number) {
  const m = Math.SQRT2 * Math.exp(logGamma((d + 1) / 2) - logGamma(d / 2));
  const sd = Math.sqrt(Math.max(d - m * m, 0));
  return { mean: m / Math.sqrt(d), sd: sd / Math.sqrt(d) };
}

export const typicality = (r: number, d: number) => {
  const { mean: m, sd } = shell(d);
  return Math.exp(-0.5 * ((r - m) / sd) ** 2);
};

export const DIMS = [2, 8, 32, 128, 512, 4096];
export const PATH_STEPS = range(0, 6).map((i) => i / 6);

export const lerpNorm = (t: number) => Math.hypot(1 - t, t);
export const slerpWeights = (t: number, omega = Math.PI / 2) => [
  Math.sin((1 - t) * omega) / Math.sin(omega),
  Math.sin(t * omega) / Math.sin(omega),
];

export const PATH_ENDS = [compose(-1.8, 1.4), compose(1.8, -1.2)] as const;

export const MIXTURE = {
  means: [compose(-1.4, 0.4), compose(1.4, -0.4)] as const,
  sd: 0.5,
};

const SCHEDULE = [...range(0, 49).map((k) => sigmoid(-9 + (18 * k) / 49)), 1];

function noise(x: Vec, alphaBar: number) {
  const signal = Math.sqrt(alphaBar);
  const sigma = Math.sqrt(1 - alphaBar);
  const v = alphaBar * MIXTURE.sd ** 2 + sigma ** 2;
  const centers = MIXTURE.means.map((m) => scale(m, signal));
  const logits = centers.map((c) => -dot(sub(x, c), sub(x, c)) / (2 * v));
  const top = Math.max(...logits);
  const weights = logits.map((l) => Math.exp(l - top));
  const total = weights[0] + weights[1];
  const eps = centers.map((c) => scale(sub(x, c), sigma / v));
  return {
    uncond: add(scale(eps[0], weights[0] / total), scale(eps[1], weights[1] / total)),
    cond: eps[1],
  };
}

export const SEEDS: Vec[] = range(0, 13).map((i) => [2 * gauss(101 + 2 * i), 2 * gauss(102 + 2 * i)]);

export function sample(w: number) {
  return SEEDS.map((seed) =>
    SCHEDULE.slice(0, -1).reduce<Vec[]>(
      (path, alphaBar, k) => {
        const x = path[path.length - 1];
        const { uncond, cond } = noise(x, alphaBar);
        const eps = add(uncond, scale(sub(cond, uncond), w));
        const x0 = scale(sub(x, scale(eps, Math.sqrt(1 - alphaBar))), 1 / Math.sqrt(alphaBar));
        const next = SCHEDULE[k + 1];
        return [...path, add(scale(x0, Math.sqrt(next)), scale(eps, Math.sqrt(1 - next)))];
      },
      [seed],
    ),
  );
}

export function summarize(paths: Vec[][]) {
  const ends = paths.map((p) => p[p.length - 1]);
  const smiles = ends.map((z) => decode(z).smile);
  const average = smiles.reduce((s, v) => s + v, 0) / smiles.length;
  const spread = Math.sqrt(smiles.reduce((s, v) => s + (v - average) ** 2, 0) / smiles.length);
  return { ends, smiling: smiles.filter((s) => s > 0).length / smiles.length, average, spread };
}

export const GUIDANCE_STEPS = [0, 1, 4];

const REFUSE = polar(-Math.PI / 9);
const REFUSE_PERP = perp(REFUSE);
const prompt = (along: number, across: number) => add(scale(REFUSE, along), scale(REFUSE_PERP, across));

export const HARMLESS: Vec[] = range(0, 10).map((i) =>
  prompt(0.1 + 0.7 * gauss(301 + 2 * i), 0.5 + gauss(302 + 2 * i)),
);
export const HARMFUL: Vec[] = range(0, 10).map((i) =>
  prompt(2 + 0.7 * gauss(331 + 2 * i), -0.3 + gauss(332 + 2 * i)),
);

export const ACTIVATIONS = (() => {
  const means = [mean(HARMLESS), mean(HARMFUL)] as const;
  const r = sub(means[1], means[0]);
  const rHat = unit(r);
  const threshold = (dot(means[0], rHat) + dot(means[1], rHat)) / 2;
  return { means, r, rHat, threshold, ablate: (h: Vec) => reject(h, r) };
})();

export const refuses = (h: Vec) => dot(h, ACTIVATIONS.rHat) > ACTIVATIONS.threshold;

export const PREFERENCE = (5 * Math.PI) / 12;
const PREFERRED = polar(PREFERENCE);

export interface Belief {
  center: number;
  half: number;
}

export const START: Belief = { center: 0, half: Math.PI };

export function query({ center }: Belief, reach = 1.1) {
  const d = polar(center + Math.PI / 2);
  const base = polar(center, 0.6);
  return { d, a: add(base, scale(d, reach)), b: sub(base, scale(d, reach)) };
}

export const update = ({ center, half }: Belief, pickedA: boolean): Belief => ({
  center: center + ((pickedA ? 1 : -1) * half) / 2,
  half: half / 2,
});

export const honest = (belief: Belief) => dot(PREFERRED, query(belief).d) > 0;

export const BELIEFS = range(1, 5).reduce<Belief[]>(
  (all) => [...all, update(all[all.length - 1], honest(all[all.length - 1]))],
  [START],
);
