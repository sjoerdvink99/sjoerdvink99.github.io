import type { Vec2 } from "./model";
import { K, Label, Sym, plane } from "./svg";

export const INPUT_PLANE = plane({ x: [-0.5, 4], y: [-1.5, 2.5] }, 56, 8, 76);

export const LATENT_AXIS = {
  y: 356,
  x0: INPUT_PLANE.box.x,
  x1: INPUT_PLANE.box.x + INPUT_PLANE.box.w,
  dom: [-2.6, 2.6] as Vec2,
};

export const zx = (z: number) =>
  LATENT_AXIS.x0 +
  ((z - LATENT_AXIS.dom[0]) / (LATENT_AXIS.dom[1] - LATENT_AXIS.dom[0])) *
    (LATENT_AXIS.x1 - LATENT_AXIS.x0);

export function LatentAxis() {
  const { y, x0, x1 } = LATENT_AXIS;
  return (
    <g>
      <line x1={x0} x2={x1} y1={y} y2={y} stroke="#c4c9d1" />
      {[-2, -1, 0, 1, 2].map((v) => (
        <g key={v}>
          <line x1={zx(v)} x2={zx(v)} y1={y - 3} y2={y + 3} stroke="#c4c9d1" />
          <Label x={zx(v)} y={y + 15} size={10} fill="#9ca3af">
            {String(v).replace("-", "−")}
          </Label>
        </g>
      ))}
      <Sym x={x1 + 14} y={y} size={15} fill={K.z}>
        z
      </Sym>
    </g>
  );
}
