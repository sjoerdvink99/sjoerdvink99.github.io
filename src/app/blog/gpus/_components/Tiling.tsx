import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Depth } from "@/components/blog/Level";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { GPU, READS, RIDGE, TILE, fmt } from "./model";
import TilingVisual from "./visuals/TilingVisual";

const { n, t } = TILE;

export default function TilingChapter() {
  return (
    <ScrollStage tall visual={<TilingVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={4} />}>
          Load each number once, use it many times.
        </SectionHead>
        <P>
          Computed naively, every output cell fetches its own row and column
          from main memory. Neighboring cells fetch the same numbers again
          and again.
        </P>
        <Depth only="intuition">
          <P>
            It is a chef who drives to the warehouse for every single dish,
            even when the next dish needs exactly the same ingredients.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            For two {n} by {n} matrices that is {2 * n} reads per output and{" "}
            {fmt(READS.naive)} in total, even though the inputs hold only{" "}
            {2 * n * n} numbers.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Instead, a group of threads copies one block of <Tex>A</Tex> and
          one block of <Tex>B</Tex> into fast memory on the chip. Every
          number in those blocks now serves {t} outputs instead of one.
        </P>
        <Depth from="mechanics">
          <P>
            The blocks are tiles, and the fast memory is the SM&apos;s shared
            memory. One thread block owns one tile of <Tex>C</Tex>, and its
            threads cooperate to load the input tiles.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Then it slides along: the next block of <Tex>A</Tex> to the right,
          the next block of <Tex>B</Tex> below, adding to the same outputs
          each time.
        </P>
        <Depth from="mechanics">
          <P>
            The partial sums for the output tile stay in registers for the
            whole loop and are written to HBM exactly once, at the end.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{"C_{IJ} = \\sum_{K} A_{IK}\\, B_{KJ}"}</Tex>
          <P>
            The same formula as before, with blocks in place of numbers.
            Matrix multiplication does not care whether its entries are
            scalars or matrices.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Do this for every output tile and the trips to main memory drop
          from {fmt(READS.naive)} to {fmt(READS.tiled)}: {t} times fewer.
          Bigger tiles save more.
        </P>
        <Depth from="expert">
          <P>
            With <Tex>{"T \\times T"}</Tex> tiles the reads fall to{" "}
            <Tex>{"2n^3 / T"}</Tex>, and the intensity seen by the memory
            feeding the tiles is about <Tex>{"T/2"}</Tex> FLOPs per byte in
            16-bit. Clearing a ridge of {fmt(RIDGE)} from HBM alone would need
            tiles too big for {fmt(GPU.smem / 1e3)} KB of shared memory, so
            real kernels also order their tiles so that neighbors hit in L2.
          </P>
        </Depth>
        <KeyLine>
          Tiling turns a memory-bound computation into a compute-bound one.
        </KeyLine>
      </Step>
      <Step>
        <P>
          At the very bottom, the product of two small tiles is exactly what
          the GPU&apos;s matrix units were built for.
        </P>
        <Depth only="intuition">
          <P>
            The counter comes with a machine that combines whole trays at
            once. Hand it two trays and it hands back a finished one.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            Tensor cores take small tiles straight from registers or shared
            memory and multiply them in one instruction. Libraries like
            cuBLAS and CUTLASS stack the whole hierarchy: HBM to L2 to shared
            memory to registers to tensor cores, each level tiled for the
            next. <code>torch.matmul</code> calls them for you.
          </P>
        </Depth>
        <Depth from="expert">
          <P>
            In Triton you write the tiled loop directly. Each program owns
            one output tile, <code>tl.load</code> brings tiles on chip, and{" "}
            <code>tl.dot</code> compiles to tensor core instructions while
            accumulating in 32-bit.
          </P>
        </Depth>
      </Step>
    </ScrollStage>
  );
}
