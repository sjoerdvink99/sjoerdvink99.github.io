import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { fmt, lerpNorm, shell } from "./model";
import PathsVisual from "./visuals/PathsVisual";

const wide = shell(512);
const root = Math.sqrt(512);

export default function PathsChapter() {
  return (
    <>
      <Bridge>
        <p>
          An edit is a straight line through the space. Is a straight line
          always a safe way to travel?
        </p>
      </Bridge>
      <ScrollStage tall visual={<PathsVisual />}>
        <Step>
          <SectionHead label={<ChapterLabel n={3} />}>
            In high dimensions, the straight line cuts through empty space.
          </SectionHead>
          <P>
            The simplest path between two latent vectors <Tex>a</Tex> and{" "}
            <Tex>b</Tex> is the straight one, linear interpolation, or lerp:
          </P>
          <Tex display>{"z(t) = (1 - t)\\, a + t\\, b, \\qquad t \\in [0, 1]"}</Tex>
          <P>
            In two dimensions it works. The faces along the bottom morph
            smoothly from a wide-eyed frown into a squinting grin. The chart tracks the
            length of <Tex>{"z(t)"}</Tex>, which dips in the middle but
            stays well inside the shaded band where samples usually fall.
          </P>
        </Step>
        <Step>
          <P>
            Most generative models draw their latent vectors from a standard
            Gaussian, <Tex>{"z \\sim \\mathcal{N}(0, I)"}</Tex>. Its squared
            length is a sum of <Tex>d</Tex> independent squares, each about 1
            on average, so
          </P>
          <Tex display>{"\\lVert z \\rVert^2 = \\sum_{i=1}^{d} z_i^2 \\approx d, \\qquad \\lVert z \\rVert \\approx \\sqrt{d}"}</Tex>
          <P>
            and the spread around <Tex>{"\\sqrt{d}"}</Tex> stays near{" "}
            <Tex>{"1/\\sqrt{2}"}</Tex> no matter how large <Tex>d</Tex>{" "}
            gets. With <Tex>{"d = 512"}</Tex>, almost every sample has a
            length within {fmt(200 * wide.sd, 0)} percent of{" "}
            {fmt(root, 1)}. The samples live on a thin shell, and the center
            of the Gaussian, its single most likely point, is never drawn.
          </P>
          <P>
            Two random samples are also nearly at right angles, so the
            midpoint of the straight line has length{" "}
            <Tex>{`${fmt(lerpNorm(0.5))}\\sqrt{d}`}</Tex>, far inside the
            shell. The decoder has never seen anything like it. Real models
            give blurry, washed-out images there, drawn here as faded faces.
          </P>
        </Step>
        <Step>
          <P>
            The fix is to travel along the shell instead of through it.
            Spherical interpolation, or slerp, rotates from <Tex>a</Tex> to{" "}
            <Tex>b</Tex> along the arc between them, where{" "}
            <Tex>{"\\Omega"}</Tex> is the angle between the two vectors:
          </P>
          <Tex display>
            {"z(t) = \\frac{\\sin\\big((1 - t)\\Omega\\big)}{\\sin \\Omega}\\, a + \\frac{\\sin(t\\Omega)}{\\sin \\Omega}\\, b"}
          </Tex>
          <P>
            The length stays the same all the way, and every face stays
            sharp. Many image pipelines interpolate their starting noise
            this way.
          </P>
          <P>
            The same goes for edits. A large <Tex>{"\\alpha"}</Tex> in{" "}
            <Tex>{"z + \\alpha v"}</Tex> pushes a point off the shell, so a
            common trick is to rescale it back to length{" "}
            <Tex>{"\\sqrt{d}"}</Tex> afterward.
          </P>
        </Step>
        <Step>
          <P>
            Change <Tex>d</Tex> yourself. At <Tex>{"d = 2"}</Tex> the
            shell is a thick ring, and nearly any point is a plausible input.
            Each step up makes the shell thinner relative to its radius, and
            the straight line falls off it sooner.
          </P>
          <KeyLine>
            A latent space is not a uniform box. Good control stays where
            the model has seen data.
          </KeyLine>
        </Step>
      </ScrollStage>
    </>
  );
}
