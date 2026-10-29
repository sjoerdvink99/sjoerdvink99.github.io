import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Depth } from "@/components/blog/Level";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { FLOPS, GPU, RIDGE, attainable, fmt } from "./model";
import HierarchyVisual from "./visuals/HierarchyVisual";
import RooflineVisual from "./visuals/RooflineVisual";

const ridge = fmt(RIDGE);
const peak = fmt(GPU.bf16 / 1e12);
const pct = (i: number, digits = 1) => `${fmt((attainable(i) / GPU.bf16) * 100, digits)}%`;

function Hierarchy() {
  return (
    <ScrollStage tall visual={<HierarchyVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} />}>
          Arithmetic is cheap. Moving numbers is expensive.
        </SectionHead>
        <Depth only="intuition">
          <P>
            Imagine a chef who can chop hundreds of vegetables in the time
            it takes a courier to bring one more. The chef will spend most
            of the day waiting. That is a GPU reading from its main memory.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            An {GPU.name} does {peak} trillion 16-bit FLOPs per second, but
            its main memory delivers {fmt(GPU.hbm / 1e12, 2)} trillion bytes
            per second. To keep the math busy, every byte that comes in has
            to be used about {ridge} times.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{`\\frac{P_{\\text{peak}}}{B_{\\text{mem}}} = \\frac{${peak} \\times 10^{12}\\ \\text{FLOP/s}}{${fmt(GPU.hbm / 1e12, 2)} \\times 10^{12}\\ \\text{B/s}} \\approx ${ridge}\\ \\text{FLOP/B}`}</Tex>
          <P>
            This ratio is the machine balance. It has grown with every
            generation, because transistors for arithmetic get cheaper much
            faster than pins and wires for memory.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          So GPUs keep several layers of memory, each closer to the lanes
          and smaller than the last.
        </P>
        <Depth only="intuition">
          <P>
            In the kitchen: a few ingredients in your hands, a tray on the
            counter, a pantry down the hall, and a warehouse across town that
            holds everything.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            Registers belong to a single thread. Shared memory belongs to one
            SM and is managed by the programmer. The L2 cache is shared by
            every SM. HBM holds all {fmt(GPU.memory / 1e9)} GB: the weights,
            the activations, everything.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          The closer the memory, the faster it is. Registers and shared
          memory move data ten to a hundred times faster than HBM, and
          answer in a few cycles instead of hundreds.
        </P>
        <KeyLine>
          The whole game is to fetch each number from far away once, and use
          it many times up close.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

function Roofline() {
  return (
    <ScrollStage tall visual={<RooflineVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} sub="The roofline" />}>
          One plot tells you what limits a computation.
        </SectionHead>
        <P>
          Count how many operations a computation does for each byte it
          reads or writes. Few, and it waits for memory. Many, and it is
          limited only by the arithmetic.
        </P>
        <Depth from="mechanics">
          <P>
            That count is the arithmetic intensity. The achievable speed is
            the smaller of two ceilings: the peak FLOP rate, and the
            intensity times the memory bandwidth. They meet at the ridge,{" "}
            {ridge} FLOPs per byte.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{"I = \\frac{\\text{FLOPs}}{\\text{bytes moved}}"}</Tex>
          <Tex display>{"P(I) = \\min\\big(P_{\\text{peak}},\\; I \\cdot B_{\\text{mem}}\\big)"}</Tex>
        </Depth>
      </Step>
      <Step>
        <P>
          A ReLU reads a number, compares it with zero and writes it back.
          One operation for every four bytes moved.
        </P>
        <Depth only="intuition">
          <P>
            The GPU spends nearly all its time waiting. Steps like this are
            a tiny part of the math in a model, but they can still eat a
            surprising share of the time.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            At an intensity of 0.25, it reaches {pct(0.25, 2)} of peak. All
            elementwise operations live here: activations, residual adds,
            normalization. They are {fmt((1 - FLOPS.share) * 100, 1)}% of a model&apos;s FLOPs
            and, run naively, a large share of its time.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Matrix multiplication is different, because every number is used
          many times. Each entry of <Tex>A</Tex> meets a whole column of{" "}
          <Tex>B</Tex>.
        </P>
        <Depth from="mechanics">
          <P>
            Multiplying a matrix by a single vector still uses each weight
            only once: intensity 1, {pct(1)} of peak. Multiplying two{" "}
            {fmt(4096)} by {fmt(4096)} matrices reaches the roof.
          </P>
        </Depth>
        <Depth from="expert">
          <P>
            For two <Tex>{"n \\times n"}</Tex> matrices in 16-bit, the work
            grows as <Tex>{"n^3"}</Tex> but the data only as{" "}
            <Tex>{"n^2"}</Tex>:
          </P>
          <Tex display>{"I = \\frac{2n^3}{3 \\cdot 2n^2} = \\frac{n}{3}"}</Tex>
        </Depth>
      </Step>
      <Step>
        <P>
          Try it. Small products fall on the slope, large ones climb onto
          the roof.
        </P>
        <Depth from="mechanics">
          <P>
            The crossover is at <Tex>{`n \\approx 3 \\times ${ridge} \\approx ${fmt(3 * RIDGE)}`}</Tex>.
            This is why models have wide layers and why training uses big
            batches: both turn thin products into fat ones.
          </P>
        </Depth>
        <KeyLine>
          A GPU is only fast when each byte is reused many times.
        </KeyLine>
      </Step>
      <Step>
        <P>
          Operations that cannot reuse data can still be combined. Do three
          elementwise steps in one pass, while the numbers are close by, and
          the intensity triples.
        </P>
        <Depth from="mechanics">
          <P>
            This is kernel fusion. Compilers such as{" "}
            <code>torch.compile</code> fuse chains of elementwise operations
            automatically, and FlashAttention fuses the whole of attention so
            the large score matrix never touches HBM.
          </P>
        </Depth>
      </Step>
    </ScrollStage>
  );
}

export default function MemoryChapter() {
  return (
    <>
      <Hierarchy />
      <Roofline />
    </>
  );
}
