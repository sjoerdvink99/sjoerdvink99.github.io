import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Depth } from "@/components/blog/Level";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { DECODE, GPU, MODEL, RIDGE, fmt } from "./model";
import DecodeVisual from "./visuals/DecodeVisual";

const gb = (v: number) => fmt(v / 1e9);
const ms = (DECODE.read(1, false) * 1e3).toFixed(1);
const rate = fmt(DECODE.rate(1, false));

export default function InferenceChapter() {
  return (
    <ScrollStage tall visual={<DecodeVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={6} />}>
          Writing text is limited by memory, not math.
        </SectionHead>
        <P>
          Reading your prompt is easy for a GPU: every word goes through the
          model at once, which makes big, efficient matrix products. Writing
          the answer is harder, because it happens one token at a time.
        </P>
        <Depth only="intuition">
          <P>
            For each new word, the GPU has to read the entire model from
            memory, all {gb(DECODE.weights)} gigabytes, and do only a couple
            of operations with each number.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            The first phase is prefill, a matrix times a matrix. The second
            is decode, a matrix times a single vector, with an intensity of
            about 1. Every step streams all {gb(DECODE.weights)} GB of 16-bit
            weights out of HBM to produce one token.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Reading the weights takes {ms} milliseconds. The arithmetic takes a
          sliver of that. One user gets about {rate} tokens per second, and
          the math units sit idle {fmt(DECODE.idle * 100, 1)}% of the time.
        </P>
        <Depth from="expert">
          <Tex display>{"t_{\\text{token}} \\ge \\frac{2N\\ \\text{bytes}}{B_{\\text{mem}}}"}</Tex>
          <Tex display>{`= \\frac{${gb(DECODE.weights)}\\ \\text{GB}}{${fmt(GPU.hbm / 1e12, 2)}\\ \\text{TB/s}} \\approx ${ms}\\ \\text{ms}`}</Tex>
        </Depth>
        <Depth from="mechanics">
          <P>
            This is why single-user speed tracks memory bandwidth, and why
            4-bit weights make chatbots faster: a quarter of the bytes is
            nearly four times the tokens per second.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          The fix is to serve many people at once. The weights are read once
          per step no matter how many sequences use them, so a batch of 32
          gets nearly 32 times the throughput for free.
        </P>
        <Depth from="mechanics">
          <P>
            Batching turns the matrix-vector product back into a
            matrix-matrix product. Try the batch sizes: throughput grows
            linearly until the math catches up with the memory, near a batch
            of {fmt(RIDGE)}. That is the ridge of the roofline again.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{"I_{\\text{decode}}(b) \\approx \\frac{2bN\\ \\text{FLOP}}{2N\\ \\text{bytes}} = b"}</Tex>
        </Depth>
        <KeyLine>Batching is how one GPU serves thousands of users.</KeyLine>
      </Step>
      <Step>
        <P>
          There is a catch. To avoid redoing work, each conversation keeps
          the keys and values of every token so far. This KV cache grows with
          every token, and it lives in the same memory as the weights.
        </P>
        <Depth only="intuition">
          <P>
            With long conversations, the memory fills up after a few dozen
            users, and fetching their saved context takes longer than
            fetching the model itself.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            Here each token costs {fmt(DECODE.kvToken / 1024)} KB of cache,
            so one {fmt(DECODE.context)}-token conversation needs{" "}
            {fmt(DECODE.kvSequence / 1e9, 1)} GB. The GPU fits{" "}
            {DECODE.maxBatch} of them. Grouped-query attention, paged
            allocation in servers like vLLM, and quantized caches all exist to
            push that number up.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{"\\text{bytes per token} = 2 \\cdot L \\cdot h_{kv} \\cdot d_{\\text{head}} \\cdot 2"}</Tex>
          <Tex display>{`= 2 \\cdot ${MODEL.layers} \\cdot ${MODEL.kvHeads} \\cdot ${MODEL.headDim} \\cdot 2 = ${fmt(DECODE.kvToken)}`}</Tex>
          <P>
            The first 2 counts keys and values, the last is bytes per BF16
            number. With {MODEL.heads} query heads sharing {MODEL.kvHeads}{" "}
            key-value heads, this is already four times smaller than full
            multi-head attention.
          </P>
        </Depth>
      </Step>
    </ScrollStage>
  );
}
