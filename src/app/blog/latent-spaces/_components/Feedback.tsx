import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { BELIEFS, degrees, fmt } from "./model";
import FeedbackVisual from "./visuals/FeedbackVisual";

const rounds = BELIEFS.length - 1;
const left = degrees(BELIEFS[rounds].half);

export default function FeedbackChapter() {
  return (
    <>
      <Bridge>
        <p>
          So far someone always knew the direction they wanted. Often a
          person cannot say what they want, but they know it when they see
          it.
        </p>
      </Bridge>
      <ScrollStage tall visual={<FeedbackVisual />}>
        <Step>
          <SectionHead label={<ChapterLabel n={7} />}>
            Every comparison cuts the possibilities in half.
          </SectionHead>
          <P>
            Someone wants faces that smile with their eyes open. They could
            not write that down as a vector <Tex>w</Tex>, but they can look
            at two faces and pick one.
          </P>
          <P>
            Assume their taste is linear, a score{" "}
            <Tex>{"r(z) = w \\cdot z"}</Tex>. Then picking A over B says
          </P>
          <Tex display>{"w \\cdot z_A > w \\cdot z_B \\iff w \\cdot (z_A - z_B) > 0"}</Tex>
          <P>
            That is a half-plane. Every direction <Tex>w</Tex> on the wrong
            side of the line through the origin perpendicular to{" "}
            <Tex>{"z_A - z_B"}</Tex> is ruled out. On the dial of all
            possible directions, one answer removes half the circle.
          </P>
        </Step>
        <Step>
          <P>
            The next pair is chosen so that its line splits what is left
            exactly in half. After {rounds} answers the uncertainty has
            shrunk from ±180° to ±{fmt(left, 0)}°, a factor of{" "}
            {2 ** rounds}. The face in the middle of the dial is the
            model&apos;s current best guess.
          </P>
          <P>
            This is binary search over directions. Choosing the most
            informative question is called active learning. Real answers are
            noisy and real spaces have many more dimensions, so it takes more
            questions, but each answer still removes a half-space.
          </P>
        </Step>
        <Step>
          <P>
            Your turn. Think of the face you would like to see, then keep
            pressing A or B for the one that is closer. The face in the
            middle comes to match what you have in mind, although you never
            said what that was.
          </P>
          <P>
            This is human–AI interaction at its simplest. The person only
            has to recognise what they like, and the geometry turns their
            choices into a direction.
          </P>
        </Step>
        <Step>
          <P>
            People are not perfectly consistent, so real systems use a soft
            version, the Bradley–Terry model:
          </P>
          <Tex display>{"P(A \\succ B) = \\sigma\\big(r(z_A) - r(z_B)\\big)"}</Tex>
          <P>
            Fitting <Tex>w</Tex> to many comparisons with this likelihood is
            the code above. Replace <Tex>z</Tex> with a language model&apos;s
            last hidden state and you have the reward model of RLHF.
            Reinforcement learning then shifts the model so its outputs score
            higher, like guidance that is built into the weights.
          </P>
          <P>
            Push too far and the outputs leave the region where the reward
            model was fitted, the same mistake as leaving the shell in
            chapter 3. The reward keeps rising while real quality falls, a
            failure called reward hacking. RLHF therefore keeps the new
            model close to the original:
          </P>
          <Tex display>
            {"\\max_{\\pi}\\; \\mathbb{E}_{y \\sim \\pi}\\big[r(y)\\big] - \\beta\\, \\mathrm{KL}\\big(\\pi \\,\\Vert\\, \\pi_{\\text{ref}}\\big)"}
          </Tex>
          <KeyLine>
            Comparisons reveal a direction, and alignment is the craft of
            following it without going too far.
          </KeyLine>
        </Step>
      </ScrollStage>
    </>
  );
}
