import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Depth } from "@/components/blog/Level";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { FORMATS, GPU, fmt } from "./model";
import BitsVisual from "./visuals/BitsVisual";

const [, , fp16] = FORMATS;

export default function PrecisionChapter() {
  return (
    <ScrollStage tall visual={<BitsVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={5} />}>
          Fewer bits, more math.
        </SectionHead>
        <P>
          A computer stores a decimal number like scientific notation: a
          sign, a power that sets the scale, and a few digits of detail.
          The classic format uses 32 bits for all three.
        </P>
        <Depth from="mechanics">
          <P>
            In FP32, 1 bit is the sign, 8 bits are the exponent and 23 bits
            are the mantissa. The exponent sets the range, the mantissa sets
            the precision: about 7 decimal digits.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{"x = (-1)^{s} \\cdot 2^{\\,e - \\text{bias}} \\cdot \\Big(1 + \\frac{m}{2^{M}}\\Big)"}</Tex>
          <Tex display>{"\\text{bias} = 2^{E-1} - 1"}</Tex>
          <P>
            Here <Tex>E</Tex> and <Tex>M</Tex> are the exponent and mantissa
            widths. An exponent field of all zeros switches to subnormals,
            which drop the leading 1 to reach closer to zero.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Neural networks do not need seven digits. BF16 keeps all of the
          scale and drops most of the detail. π becomes 3.140625.
        </P>
        <Depth only="intuition">
          <P>
            The numbers get a little blurry, and the network does not mind.
            In exchange, each number takes half the space and the GPU can
            multiply many more of them per second.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            BF16 is FP32 with the mantissa cut to 7 bits. It has the same
            range, so nothing overflows, and about 3 significant digits.
            Training noise from data and batching is far larger than the
            rounding error.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          FP16 splits its 16 bits differently: more detail, less scale. Pick
          70,000 and it overflows, because nothing above{" "}
          {fmt(fp16.max)} fits.
        </P>
        <Depth from="mechanics">
          <P>
            Early mixed-precision training used FP16 and had to multiply the
            loss by a large factor so small gradients would not underflow to
            zero. BF16 made that loss scaling unnecessary, which is why it
            became the default for training.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Keep going. FP8 has 8 bits and FP4 only 4. π becomes 3.25, then
          3, and 0.0001 vanishes to zero.
        </P>
        <Depth only="intuition">
          <P>
            That sounds hopeless, but there is a trick: store a shared scale
            for each small group of numbers, then each number only needs to
            say where it sits within its group.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            These formats work because each block of values gets its own
            scaling factor, so the few bits are spent on the range the block
            actually uses. Inference widely runs in FP8 and 4-bit formats,
            and large models such as DeepSeek-V3 have been trained in FP8.
          </P>
        </Depth>
        <Depth from="expert">
          <P>
            The microscaling formats MXFP8 and NVFP4 attach a shared
            exponent to every block of 32 or 16 values, keeping the
            per-element formats E4M3 and E2M1.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Every halving of the bits roughly doubles how many multiplications
          a tensor core can do per second, and halves how many bytes have to
          move.
        </P>
        <KeyLine>
          Lower precision speeds up both ceilings of the roofline at once.
        </KeyLine>
        <Depth from="mechanics">
          <P>
            On the {GPU.name}, BF16 tensor cores reach {fmt(GPU.bf16 / 1e12)}{" "}
            TFLOP/s and FP8 {fmt(GPU.fp8 / 1e12)}, against{" "}
            {fmt(GPU.fp32 / 1e12)} for plain FP32 lanes. Blackwell GPUs add
            FP4 tensor cores at twice the FP8 rate.
          </P>
        </Depth>
        <Depth from="expert">
          <P>
            The trick is mixed precision. Inputs to each matrix product are
            low precision, but the sums are accumulated in FP32, and the
            optimizer keeps an FP32 master copy of the weights.{" "}
            <code>torch.autocast</code> chooses the precision per operation.
          </P>
        </Depth>
      </Step>
    </ScrollStage>
  );
}
