import { C } from "@/components/blog/palette";

const COLUMNS = [
  [-12, 12],
  [-20, 0, 20],
  [-12, 12],
];

const NODES = COLUMNS.map((col, c) => col.map((ny) => [(c - 1) * 24, ny]));

export function ModelGlyph({
  x,
  y,
  label,
  labelSize = 14,
}: {
  x: number;
  y: number;
  label?: string;
  labelSize?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-44}
        y={-32}
        width={88}
        height={64}
        rx={12}
        fill="#fff"
        stroke={C.ink}
        strokeOpacity={0.45}
        strokeWidth={1.25}
      />
      <g stroke={C.ink} strokeOpacity={0.4} strokeWidth={1}>
        {NODES.slice(0, -1).flatMap((col, c) =>
          col.flatMap(([ax, ay]) =>
            NODES[c + 1].map(([bx, by]) => (
              <line key={`${ax}${ay}${bx}${by}`} x1={ax} y1={ay} x2={bx} y2={by} />
            ))
          )
        )}
      </g>
      <g fill={C.ink}>
        {NODES.flat().map(([nx, ny]) => (
          <circle key={`${nx}${ny}`} cx={nx} cy={ny} r={3.5} />
        ))}
      </g>
      {label && (
        <text
          y={32 + labelSize * 1.6}
          textAnchor="middle"
          fontSize={labelSize}
          fill={C.muted}
        >
          {label}
        </text>
      )}
    </g>
  );
}
