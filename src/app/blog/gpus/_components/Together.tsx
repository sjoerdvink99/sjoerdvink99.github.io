import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Depth } from "@/components/blog/Level";
import { Tag } from "@/components/blog/Tag";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { TRAIN, big, fmt, texSci } from "./model";
import ScaleVisual from "./visuals/ScaleVisual";

const mfu = `${fmt(TRAIN.mfu * 100)}%`;

export default function Together() {
  return (
    <ScrollStage tall visual={<ScaleVisual />}>
      <Step>
        <SectionHead label={<Tag>Putting it together</Tag>}>
          Training a large model, on the back of an envelope.
        </SectionHead>
        <P>
          Take a {big(TRAIN.params)} model trained on {big(TRAIN.tokens)}{" "}
          tokens, roughly the scale of Llama 3.1 70B. Chapter one gives the
          total work.
        </P>
        <Depth from="expert">
          <Tex display>{"C = 6ND = 6 \\times 7 \\times 10^{10} \\times 1.5 \\times 10^{13}"}</Tex>
          <Tex display>{`\\approx ${texSci(TRAIN.flops)}\\ \\text{FLOP}`}</Tex>
        </Depth>
      </Step>
      <Step>
        <P>
          Real training runs keep about {mfu} of the tensor cores busy. The
          rest is lost to memory-bound operations, communication and waiting.
          At that rate one GPU would need {fmt(TRAIN.years)} years.
        </P>
        <Depth from="mechanics">
          <P>
            That fraction is the model FLOPs utilization, or MFU. Every
            chapter shows up in it: tiling and fusion push it up, small
            matrices and memory traffic pull it down, and lower precision
            raises the peak it is measured against.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          So the work is split across {fmt(TRAIN.gpus)} GPUs, and{" "}
          {fmt(TRAIN.years)} years becomes {fmt(TRAIN.days, 0)} days.
        </P>
        <Depth from="mechanics">
          <P>
            Splitting it is its own art. Data parallelism gives each group of
            GPUs different examples. Tensor parallelism splits each matrix
            product across the GPUs of one server, linked by NVLink. Pipeline
            parallelism gives different layers to different servers. All of
            them trade arithmetic for communication, which is one more
            roofline to stay under.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Meta reported about {fmt(TRAIN.reported / 1e6, 1)} million
          H100-hours for Llama 3.1 70B. Our envelope says{" "}
          {fmt(TRAIN.hours / 1e6, 1)} million. Hardware failures, restarts
          and lower utilization in practice likely make up the difference.
        </P>
        <KeyLine>
          A FLOP count, a peak rate and a utilization get you within a
          factor of two of a real training run.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}
