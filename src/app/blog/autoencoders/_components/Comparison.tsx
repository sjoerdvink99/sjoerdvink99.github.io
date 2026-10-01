import type { ReactNode } from "react";
import Reveal from "@/components/blog/Reveal";
import { C } from "@/components/blog/palette";
import { Tex } from "@/components/blog/Tex";
import { CHAPTERS } from "./chapters";

const Y = 36;

function Cells({
  x,
  n,
  dashed = false,
}: {
  x: number;
  n: number;
  dashed?: boolean;
}) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          x={x}
          y={Y - (n * 14 + (n - 1) * 3) / 2 + i * 17}
          width={14}
          height={14}
          rx={3}
          fill="#fff"
          stroke={C.ink}
          strokeOpacity={0.5}
          strokeDasharray={dashed ? "2 2" : undefined}
        />
      ))}
    </g>
  );
}

const arrow = (x1: number, x2: number) =>
  `M ${x1} ${Y} H ${x2} M ${x2 - 4} ${Y - 3} L ${x2} ${Y} L ${x2 - 4} ${Y + 3}`;

function Diagram({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 260 72"
      className="block w-full max-w-[18rem]"
      role="img"
      aria-label={label}
    >
      <Cells x={8} n={2} />
      <path d={arrow(30, 70)} stroke={C.muted} fill="none" strokeWidth={1.25} />
      {children}
      <path
        d={arrow(190, 230)}
        stroke={C.muted}
        fill="none"
        strokeWidth={1.25}
      />
      <Cells x={238} n={2} dashed />
    </svg>
  );
}

const MODELS = [
  {
    name: "Autoencoder",
    flow: "x \\to z \\to \\hat{x}",
    goal: "A compact code that keeps what the decoder needs.",
    latent: "A single point.",
    diagram: (
      <Diagram label="An input passes through a single latent point to a reconstruction.">
        <circle cx={130} cy={Y} r={6} fill={C.rep} />
      </Diagram>
    ),
  },
  {
    name: "Variational autoencoder",
    flow: "x \\to \\mu, \\sigma \\to z \\sim \\N(\\mu, \\sigma^2) \\to \\hat{x}",
    goal: "A smooth, probabilistic latent space that supports generation.",
    latent: "A distribution.",
    diagram: (
      <Diagram label="An input is encoded as a Gaussian region, from which z is sampled.">
        <ellipse
          cx={130}
          cy={Y}
          rx={34}
          ry={18}
          fill={C.rep}
          fillOpacity={0.12}
          stroke={C.rep}
        />
        <circle cx={142} cy={Y - 5} r={3.5} fill={C.rep} />
      </Diagram>
    ),
  },
  {
    name: "Sparse autoencoder",
    flow: "x \\to \\text{wide, sparse } z \\to \\hat{x}",
    goal: "Describe each input with a few active features from a large learned dictionary.",
    latent: "High-dimensional, mostly zero.",
    diagram: (
      <Diagram label="An input is encoded as a wide vector in which only two units are active.">
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={78 + i * 9.5}
            y={Y - 7}
            width={7}
            height={14}
            rx={1.5}
            fill={i === 3 || i === 8 ? C.rep : "#fff"}
            stroke={i === 3 || i === 8 ? C.rep : C.faint}
          />
        ))}
      </Diagram>
    ),
  },
];

export default function Comparison() {
  return (
    <section
      aria-labelledby="comparison"
      className="mx-auto max-w-3xl px-6 py-[18vh]"
    >
      <Reveal>
        <h2
          id="comparison"
          className="text-balance text-center text-[1.9rem] font-light leading-[1.15] tracking-tight text-ir-ink md:text-[2.25rem]"
        >
          One structure, three constraints.
        </h2>
      </Reveal>
      <ol className="mt-16 space-y-14">
        {MODELS.map((m, i) => (
          <li key={m.name}>
            <Reveal delay={0.05 * i}>
              <div className="grid items-center gap-x-10 gap-y-4 md:grid-cols-[18rem_minmax(0,1fr)]">
                {m.diagram}
                <div>
                  <p className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${CHAPTERS[i].dot}`}
                      aria-hidden
                    />
                    <span className={CHAPTERS[i].ink}>{m.name}</span>
                  </p>
                  <p className="mt-2 text-[1.05rem]">
                    <Tex>{m.flow}</Tex>
                  </p>
                  <dl className="mt-3 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-y-1 text-[0.98rem] leading-relaxed text-gray-600">
                    <dt className="text-ir-ink-muted">goal</dt>
                    <dd>{m.goal}</dd>
                    <dt className="text-ir-ink-muted">latent</dt>
                    <dd>{m.latent}</dd>
                  </dl>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
