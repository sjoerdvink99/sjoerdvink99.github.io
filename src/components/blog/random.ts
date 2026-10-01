export function rand(n: number) {
  let t = (n * 0x6d2b79f5 + 0x9e3779b9) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function gauss(n: number) {
  return rand(n) + rand(n + 7919) + rand(n + 15887) - 1.5;
}

export const round = (v: number) => Math.round(v * 10) / 10;
