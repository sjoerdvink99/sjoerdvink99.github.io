import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { GUIDANCE_STEPS, SEEDS, fmt, sample, summarize } from "./model";
import GuidanceVisual from "./visuals/GuidanceVisual";

const [free, conditional, strong] = GUIDANCE_STEPS.map((w) => summarize(sample(w)));
const count = (share: number) => Math.round(share * SEEDS.length);

export default function GuidanceChapter() {
  return (
    <>
      <Bridge>
        <p>
          A diffusion model starts from fresh noise every time, so there is
          no single <span className="font-math italic">z</span> to edit. How
          do you steer something that is always moving?
        </p>
      </Bridge>
      <ScrollStage tall visual={<GuidanceVisual />}>
        <Step>
          <SectionHead label={<ChapterLabel n={5} />}>
            Guidance is a direction, recomputed at every step.
          </SectionHead>
          <P>
            A diffusion model generates by removing noise a little at a
            time. At each step it estimates which way the data lies, the
            gradient of the log density, called the score:
          </P>
          <Tex display>{"s(x) = \\nabla_x \\log p(x)"}</Tex>
          <P>
            Following the score is like walking uphill on the density. In
            our plane the data has two clusters, frowning and smiling faces.
            Each grey dot is a starting point of pure noise, each line is its
            path, and the green dots are where the paths end. Without
            guidance, {count(free.smiling)} of {SEEDS.length} samples smile and
            the rest frown, a mix of both clusters like the data itself.
          </P>
        </Step>
        <Step>
          <P>
            Train the same network with a prompt <Tex>c</Tex> as an extra
            input, and it learns the score of <Tex>{"p(x \\mid c)"}</Tex>.
            With the prompt &ldquo;a smiling face&rdquo; every path ends in
            the smiling cluster.
          </P>
          <P>Bayes&apos; rule shows what the prompt adds:</P>
          <Tex display>
            {"\\nabla_x \\log p(x \\mid c) = \\nabla_x \\log p(x) + \\nabla_x \\log p(c \\mid x)"}
          </Tex>
          <P>
            The last term is the gradient of a classifier, the direction in
            which <Tex>x</Tex> looks most like <Tex>c</Tex>. It plays the
            same role as the smile vector of chapter 2, except that it is
            recomputed at every point and every step. Using a separately
            trained classifier for it is called classifier guidance.
          </P>
        </Step>
        <Step>
          <P>
            Classifier-free guidance gets that direction without a
            classifier. The network is trained with the prompt sometimes
            dropped, so it can predict both with and without it. Their
            difference is the prompt direction, and the guidance weight{" "}
            <Tex>w</Tex> plays the role of <Tex>{"\\alpha"}</Tex>:
          </P>
          <Tex display>
            {"\\hat{\\epsilon} = \\epsilon_\\theta(x_t) + w \\big(\\epsilon_\\theta(x_t, c) - \\epsilon_\\theta(x_t)\\big)"}
          </Tex>
          <P>
            Here <Tex>{"\\epsilon_\\theta"}</Tex> is the predicted noise,
            which is the score times <Tex>{"-\\sigma_t"}</Tex>, the noise
            level at step <Tex>t</Tex>. With{" "}
            <Tex>{"w = 1"}</Tex> this is just the conditional model. With{" "}
            <Tex>{"w > 1"}</Tex> it overshoots, sampling roughly from{" "}
            <Tex>{"p(x)\\, p(c \\mid x)^{w}"}</Tex>, which favors the points
            the classifier is most sure about.
          </P>
          <P>
            At <Tex>{"w = 4"}</Tex> the mean smile rises from{" "}
            {fmt(conditional.average)} to {fmt(strong.average)}, and the
            spread between samples falls from {fmt(conditional.spread)} to{" "}
            {fmt(strong.spread)}. Every face becomes the same broad grin.
          </P>
        </Step>
        <Step>
          <P>
            Try other weights. Image models usually run around{" "}
            <Tex>{"w = 7"}</Tex>, where pictures look sharp and on prompt
            but start to look alike. Much higher, and colors saturate and
            textures go strange.
          </P>
          <P>
            Negative prompts use the same formula with the unconditional
            prediction replaced by a prediction for the thing you do not
            want, so the sample is pushed away from it.
          </P>
          <KeyLine>
            Guidance trades diversity for fidelity, by pushing every step
            along the difference between with the prompt and without it.
          </KeyLine>
        </Step>
      </ScrollStage>
    </>
  );
}
