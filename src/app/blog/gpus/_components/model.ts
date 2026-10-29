export type Point = [number, number];

export const sum = (a: readonly number[]) => a.reduce((s, v) => s + v, 0);
export const range = (n: number) => Array.from({ length: n }, (_, i) => i);
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function fmt(v: number, digits = 0) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const PREFIX = [
  [1e15, "P"],
  [1e12, "T"],
  [1e9, "G"],
  [1e6, "M"],
  [1e3, "k"],
] as const;

const trim = (v: number, digits: number) =>
  v.toLocaleString("en-US", { maximumFractionDigits: digits });

export function si(v: number, unit = "", digits = 1) {
  const hit = PREFIX.find(([p]) => Math.abs(v) >= p);
  return hit ? `${trim(v / hit[0], digits)} ${hit[1]}${unit}` : `${trim(v, digits)} ${unit}`;
}

export const big = (v: number) =>
  v >= 1e12 ? `${fmt(v / 1e12)}T` : `${fmt(v / 1e9)}B`;

export function sci(v: number, digits = 1) {
  const e = Math.floor(Math.log10(Math.abs(v)));
  return { mantissa: (v / 10 ** e).toFixed(digits), exponent: e };
}

export const texSci = (v: number, digits = 1) => {
  const { mantissa, exponent } = sci(v, digits);
  return `${mantissa} \\times 10^{${exponent}}`;
};

export const GPU = {
  name: "H100",
  bf16: 989e12,
  fp8: 1979e12,
  tf32: 495e12,
  fp32: 67e12,
  hbm: 3.35e12,
  memory: 80e9,
  sms: 132,
  lanes: 128,
  l2: 50e6,
  smem: 228e3,
  registers: 256e3,
};

export const RIDGE = GPU.bf16 / GPU.hbm;

export const attainable = (intensity: number) => Math.min(GPU.bf16, intensity * GPU.hbm);

export const MEMORY = [
  { name: "Registers", where: "inside each lane", size: GPU.registers * GPU.sms, bandwidth: 300e12, cycles: 1, kitchen: "in your hands" },
  { name: "Shared memory", where: "inside each SM", size: GPU.smem * GPU.sms, bandwidth: 33e12, cycles: 30, kitchen: "on the counter" },
  { name: "L2 cache", where: "middle of the chip", size: GPU.l2, bandwidth: 10e12, cycles: 200, kitchen: "in the pantry" },
  { name: "HBM", where: "stacks beside the chip", size: GPU.memory, bandwidth: GPU.hbm, cycles: 500, kitchen: "at the warehouse" },
];

export const MODEL = {
  params: 8.03e9,
  layers: 32,
  d: 4096,
  kvd: 1024,
  ffn: 14336,
  vocab: 128256,
  heads: 32,
  kvHeads: 8,
  headDim: 128,
  context: 4096,
};

export const OPS = (() => {
  const { d, kvd, ffn, heads, context } = MODEL;
  return [
    { name: "QKV", flops: 2 * d * (d + 2 * kvd), matmul: true },
    { name: "Attn", flops: 4 * context * d, matmul: true },
    { name: "Output", flops: 2 * d * d, matmul: true },
    { name: "MLP", flops: 6 * d * ffn, matmul: true },
    { name: "Other", flops: 5 * (2 * d + ffn + heads * context), matmul: false },
  ];
})();

export const FLOPS = (() => {
  const layer = sum(OPS.map((o) => o.flops));
  const matmul = sum(OPS.filter((o) => o.matmul).map((o) => o.flops));
  const head = 2 * MODEL.d * MODEL.vocab;
  return {
    layer,
    share: matmul / layer,
    head,
    token: MODEL.layers * layer + head,
    rule: 2 * MODEL.params,
  };
})();

export const TRAIN = (() => {
  const params = 70e9;
  const tokens = 15e12;
  const mfu = 0.4;
  const gpus = 16384;
  const flops = 6 * params * tokens;
  const seconds = flops / (GPU.bf16 * mfu);
  return {
    params,
    tokens,
    mfu,
    gpus,
    flops,
    seconds,
    hours: seconds / 3600,
    years: seconds / (3600 * 24 * 365),
    days: seconds / gpus / (3600 * 24),
    reported: 7.0e6,
  };
})();

export const DECODE = (() => {
  const { params, layers, kvHeads, headDim } = MODEL;
  const weights = 2 * params;
  const kvToken = 2 * layers * kvHeads * headDim * 2;
  const context = 8192;
  const kvSequence = kvToken * context;
  const read = (batch: number, cache: boolean) =>
    (weights + (cache ? batch * kvSequence : 0)) / GPU.hbm;
  const math = (batch: number) => (batch * 2 * params) / GPU.bf16;
  const time = (batch: number, cache: boolean) => Math.max(read(batch, cache), math(batch));
  return {
    weights,
    kvToken,
    context,
    kvSequence,
    maxBatch: Math.floor((GPU.memory - weights) / kvSequence),
    read,
    math,
    time,
    rate: (batch: number, cache: boolean) => batch / time(batch, cache),
    idle: 1 - math(1) / read(1, false),
  };
})();

export const BATCHES = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

export interface Format {
  name: string;
  e: number;
  m: number;
  max: number;
  tflops: number | null;
}

export const FORMATS: Format[] = [
  { name: "FP32", e: 8, m: 23, max: 3.4028234664e38, tflops: GPU.fp32 / 1e12 },
  { name: "BF16", e: 8, m: 7, max: 3.3895313892e38, tflops: GPU.bf16 / 1e12 },
  { name: "FP16", e: 5, m: 10, max: 65504, tflops: GPU.bf16 / 1e12 },
  { name: "FP8", e: 4, m: 3, max: 448, tflops: GPU.fp8 / 1e12 },
  { name: "FP4", e: 2, m: 1, max: 6, tflops: null },
];

export const bias = (f: Format) => 2 ** (f.e - 1) - 1;

export function quantize(x: number, f: Format) {
  const a = Math.abs(x);
  if (a === 0) return 0;
  const e = Math.max(Math.floor(Math.log2(a)), 1 - bias(f));
  const step = 2 ** (e - f.m);
  const q = Math.round(a / step) * step;
  return q > f.max ? Infinity : Math.sign(x) * q;
}

export function encode(q: number, f: Format) {
  if (!Number.isFinite(q)) return null;
  const a = Math.abs(q);
  const low = 1 - bias(f);
  const normal = a >= 2 ** low;
  const e = normal ? Math.floor(Math.log2(a)) : low;
  const exponent = normal ? e + bias(f) : 0;
  const mantissa = a === 0 ? 0 : Math.round((normal ? a / 2 ** e - 1 : a / 2 ** low) * 2 ** f.m);
  return {
    sign: q < 0 ? "1" : "0",
    exponent: exponent.toString(2).padStart(f.e, "0"),
    mantissa: mantissa.toString(2).padStart(f.m, "0"),
  };
}

export const VALUES = [
  { label: "π", value: Math.PI },
  { label: "0.1", value: 0.1 },
  { label: "1/3", value: 1 / 3 },
  { label: "70,000", value: 70000 },
  { label: "0.0001", value: 0.0001 },
];

export const TILE = { n: 8, t: 4 };
export const READS = {
  naive: 2 * TILE.n ** 3,
  tiled: (2 * TILE.n ** 3) / TILE.t,
};
