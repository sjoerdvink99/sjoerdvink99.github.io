import Reveal from "@/components/blog/Reveal";
import { Tag } from "@/components/blog/Tag";
import { Tex } from "@/components/blog/Tex";
import { P, SectionHead } from "@/components/blog/Typography";
import { DECODE, GPU, RIDGE, fmt } from "./model";

const NUMBERS = [
  { tex: "C \\approx 2N", meaning: "FLOPs to process one token", value: "16 GFLOP for 8B" },
  { tex: "C \\approx 6ND", meaning: "FLOPs to train on D tokens", value: "forward + backward" },
  { tex: "P_{\\text{peak}}", meaning: `${GPU.name} dense BF16 tensor core rate`, value: `${fmt(GPU.bf16 / 1e12)} TFLOP/s` },
  { tex: "B_{\\text{mem}}", meaning: `${GPU.name} HBM bandwidth`, value: `${fmt(GPU.hbm / 1e12, 2)} TB/s` },
  { tex: "P_{\\text{peak}} / B_{\\text{mem}}", meaning: "the ridge: FLOPs needed per byte", value: `${fmt(RIDGE)} FLOP/B` },
  { tex: "I = n / 3", meaning: "intensity of an n × n × n BF16 matmul", value: `compute-bound above ${fmt(3 * RIDGE)}` },
  { tex: "I \\approx b", meaning: "intensity of decoding at batch size b", value: "memory-bound below the ridge" },
  { tex: "2N / B_{\\text{mem}}", meaning: "lower bound on time per decoded token", value: `${(DECODE.read(1, false) * 1e3).toFixed(1)} ms for 8B` },
  { tex: "2 L h_{kv} d_{\\text{head}} \\cdot 2", meaning: "KV cache bytes per token in BF16", value: `${fmt(DECODE.kvToken / 1024)} KB for 8B` },
  { tex: "2n^3 / T", meaning: "reads of a matmul tiled with T × T tiles", value: "T times fewer" },
  { tex: "\\text{MFU}", meaning: "share of peak FLOPs a training run achieves", value: "often 35 to 50%" },
];

export default function Numbers() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-[22vh]">
      <Reveal>
        <SectionHead label={<Tag>Field guide</Tag>}>Numbers to know</SectionHead>
        <P>
          Most questions about AI hardware can be answered with a handful of
          ratios. Here are the ones from this essay.
        </P>
      </Reveal>
      <Reveal delay={0.1}>
        <dl className="mt-10 border-t border-gray-200">
          {NUMBERS.map((n) => (
            <div
              key={n.tex}
              className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-5 gap-y-1 border-b border-gray-100 py-3.5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,12rem)]"
            >
              <dt className="row-span-2 self-center sm:row-span-1">
                <Tex>{n.tex}</Tex>
              </dt>
              <dd className="text-pretty text-[0.95rem] leading-snug text-gray-600 sm:self-center">
                {n.meaning}
              </dd>
              <dd className="break-words font-mono text-[0.78rem] text-ir-ink sm:self-center">
                {n.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
