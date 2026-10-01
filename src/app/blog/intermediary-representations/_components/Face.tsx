import { C } from "@/components/blog/palette";

const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

export function Face({
  smile,
  age,
  className = "",
}: {
  smile: number;
  age: number;
  className?: string;
}) {
  const curve = 132 + (smile - 0.25) * 30;
  const hair = `rgb(${mix(55, 209, age)}, ${mix(65, 213, age)}, ${mix(81, 219, age)})`;

  return (
    <svg
      viewBox="0 0 200 200"
      className={`block ${className}`}
      role="img"
      aria-label="A face"
    >
      <path
        d="M40 92 Q40 34 100 34 Q160 34 160 92 Q150 58 100 56 Q50 58 40 92 Z"
        fill={hair}
      />
      <ellipse
        cx={100}
        cy={106}
        rx={60}
        ry={68}
        fill="none"
        stroke={C.ink}
        strokeWidth={2}
      />
      <g stroke={C.ink} strokeWidth={2} strokeLinecap="round" fill="none">
        <path d="M68 86 Q78 82 88 86" />
        <path d="M112 86 Q122 82 132 86" />
        <path
          d={`M72 ${126 + age * 4} Q100 ${curve + age * 4} 128 ${126 + age * 4}`}
        />
      </g>
      <circle cx={78} cy={100} r={3.5} fill={C.ink} />
      <circle cx={122} cy={100} r={3.5} fill={C.ink} />
      <g
        stroke={C.ink}
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
        opacity={age}
      >
        <path d="M76 68 Q100 63 124 68" />
        <path d="M80 75 Q100 71 120 75" />
        <path d="M71 110 Q78 114 85 110" />
        <path d="M115 110 Q122 114 129 110" />
        <path d="M62 98 L56 95 M62 103 L55 103" />
        <path d="M138 98 L144 95 M138 103 L145 103" />
        <path d="M84 120 Q78 132 82 140" />
        <path d="M116 120 Q122 132 118 140" />
      </g>
    </svg>
  );
}
