import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Depth } from "@/components/blog/Level";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { GPU, fmt } from "./model";
import RaceVisual from "./visuals/RaceVisual";
import ChipVisual from "./visuals/ChipVisual";

const lanes = fmt(GPU.sms * GPU.lanes);

function Race() {
  return (
    <ScrollStage tall visual={<RaceVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} />}>
          Every cell of a matrix product can be computed on its own.
        </SectionHead>
        <Depth only="intuition">
          <P>
            Think of filling in a giant multiplication table. Each square
            needs one row and one column, and nothing from any other square.
            A thousand people could each take one square and never need to
            talk to each other.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            Each entry of <Tex>{"C = AB"}</Tex> is the dot product of one
            row of <Tex>A</Tex> with one column of <Tex>B</Tex>. No entry
            depends on any other, so all of them can be computed at the same
            time, in any order.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{"C_{ij} = \\sum_{k} A_{ik} B_{kj}"}</Tex>
          <P>
            The only sequential part is the sum over <Tex>k</Tex> inside one
            cell. Across cells there are no dependencies at all. Problems
            like this are called embarrassingly parallel.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          A CPU has a handful of cores. Each is very fast and very clever,
          but it still fills the grid a few cells at a time.
        </P>
        <Depth only="intuition">
          <P>
            CPUs are built to finish one complicated task as quickly as
            possible: running your browser, your spreadsheet, your operating
            system. Most of the chip goes to being clever, not to doing
            arithmetic.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            A CPU core spends its transistors on reducing latency: deep
            pipelines, out-of-order execution, branch prediction and large
            caches. That is ideal for code full of branches and pointer
            chasing, and wasted on a grid of identical dot products. Vector
            instructions help, but only by a factor of 16 or so per core.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          A GPU has thousands of simple lanes. Each one is slower than a CPU
          core, but they all start at once, and the grid is done before the
          CPU is an eighth of the way through.
        </P>
        <KeyLine>A CPU minimizes latency. A GPU maximizes throughput.</KeyLine>
        <Depth from="mechanics">
          <P>
            An {GPU.name} has {lanes} lanes for ordinary 32-bit arithmetic,
            each running at under 2 GHz. Nobody cares how long one cell takes.
            What matters is how many cells finish per second.
          </P>
        </Depth>
        <Depth from="expert">
          <P>
            In CUDA you write the work of a single thread and launch a grid
            of them. Here each thread computes one cell, picking its{" "}
            <Tex>i</Tex> and <Tex>j</Tex> from its block and thread indices.
            The hardware schedules the blocks onto whatever is free.
          </P>
        </Depth>
      </Step>
    </ScrollStage>
  );
}

function Chip() {
  return (
    <ScrollStage tall visual={<ChipVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} sub="The chip" />}>
          The difference is visible in the silicon.
        </SectionHead>
        <Depth only="intuition">
          <P>
            Picture the chips from above. On a CPU, the parts that actually
            do arithmetic are small islands. The rest is there to keep a few
            workers busy and well informed.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            On a CPU die, the arithmetic units are a small fraction of each
            core. Most of the area goes to control logic, prediction, and
            several levels of cache shared by a few cores.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          A GPU flips the ratio. The chip is tiled with copies of the same
          block, and most of every block is arithmetic.
        </P>
        <Depth only="intuition">
          <P>
            Next to the chip sit stacks of memory, packed as close as
            possible, because thousands of workers get hungry fast.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            The {GPU.name} has {GPU.sms} streaming multiprocessors, or SMs,
            around a shared L2 cache. Stacks of high-bandwidth memory (HBM)
            sit on the same package, right beside the die.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Inside one block are four groups of 32 lanes, a small scratch
          space for each, and a special unit that multiplies whole small
          matrices at once.
        </P>
        <Depth from="mechanics">
          <P>
            Each SM has four partitions. Each partition has a warp
            scheduler, 32 lanes, a register file and a tensor core. A tensor
            core computes a small matrix product, such as a 16 by 16 block,
            as a single operation. They supply nearly all of the GPU&apos;s
            speed for AI: {fmt(GPU.bf16 / 1e12)} trillion operations per
            second in 16-bit, against {fmt(GPU.fp32 / 1e12)} trillion
            from the ordinary lanes.
          </P>
          <P>
            The four partitions share a fast on-chip memory, which will
            matter a lot in chapter four.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          The 32 lanes of a group do not act independently. They receive one
          instruction and execute it together, each on its own data.
        </P>
        <Depth only="intuition">
          <P>
            It is like a drill team: one call, thirty-two people moving at
            once. That is perfect for a grid of identical dot products, and
            a poor fit for work where everyone needs to do something
            different.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            NVIDIA calls this SIMT: single instruction, multiple threads. A
            group of 32 threads is a warp. If threads in a warp take
            different sides of an <code>if</code>, the warp runs both sides
            one after the other, with half the lanes switched off each time.
          </P>
        </Depth>
        <Depth from="expert">
          <P>
            An SM keeps up to 64 warps resident at once. When one warp stalls
            on a memory load, the scheduler issues from another on the very
            next cycle. GPUs hide memory latency with parallelism, not with
            big caches, which is why they need so much more work in flight
            than a CPU.
          </P>
        </Depth>
      </Step>
    </ScrollStage>
  );
}

export default function ParallelismChapter() {
  return (
    <>
      <Race />
      <Chip />
      <Bridge>
        <p>
          A GPU has arithmetic to spare. The hard part, it turns out, is
          getting numbers to it fast enough.
        </p>
      </Bridge>
    </>
  );
}
