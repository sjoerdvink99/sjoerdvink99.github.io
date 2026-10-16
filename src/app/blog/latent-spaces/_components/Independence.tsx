import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { EYE_DIR, INDEPENDENT, SMILE_DIR, dot, fmt, tex } from "./model";
import IndependenceVisual from "./visuals/IndependenceVisual";

const { before, tangled, clean } = INDEPENDENT;

export default function IndependenceChapter() {
  return (
    <>
      <Bridge>
        <p>We asked for a smile. Why did the eyes close?</p>
      </Bridge>
      <ScrollStage tall visual={<IndependenceVisual />}>
        <Step>
          <SectionHead label={<ChapterLabel n={4} />}>
            Remove what you did not ask for.
          </SectionHead>
          <P>
            The edit from chapter 2 raises the smile from {fmt(before.smile)}{" "}
            to {fmt(tangled.smile)}, but it also drops the eyes from{" "}
            {fmt(before.eyes)} to {fmt(tangled.eyes)}.
          </P>
          <P>
            The cause is the data, not the model. People who smile tend to
            squint, so the smiling examples also had narrower eyes. A
            difference of means captures every way the two groups differ,
            the correlations included.
          </P>
          <P>
            Real models have the same problem on a larger scale. In face
            GANs, the direction that makes a face older also tends to add
            glasses, because older people in the training photos wear
            glasses more often.
          </P>
        </Step>
        <Step>
          <P>
            To keep the eyes fixed, we first need a direction for eyes. Here
            it comes from a linear probe, a logistic regression trained to
            tell open eyes from closed ones. Its weight vector, scaled to
            length 1, is <Tex>n</Tex>. It is perpendicular to the probe&apos;s
            decision boundary and points toward wider eyes.
          </P>
          <P>
            The grey lines are perpendicular to <Tex>n</Tex>. Along each
            line, eye openness is constant: these are its level sets. Moving
            along a line leaves the eyes alone, and crossing lines changes
            them. The smile vector <Tex>v</Tex> crosses several.
          </P>
        </Step>
        <Step>
          <P>
            Split <Tex>v</Tex> into a part along <Tex>n</Tex> and a part
            perpendicular to it:
          </P>
          <Tex display>
            {"v = \\underbrace{(v \\cdot n)\\, n}_{\\text{changes the eyes}} + \\underbrace{v_{\\perp}}_{\\text{does not}}"}
          </Tex>
          <P>
            Here <Tex>{`v \\cdot n = ${tex(dot(SMILE_DIR, EYE_DIR))}`}</Tex>,
            so the smile vector was hiding a component that says &ldquo;close
            your eyes&rdquo;. Removing it is a projection, the dashed red
            segment in the figure:
          </P>
          <Tex display>{"v_{\\perp} = v - (v \\cdot n)\\, n"}</Tex>
          <P>
            This is one step of Gram–Schmidt, the procedure that makes
            vectors orthogonal to each other.
          </P>
        </Step>
        <Step>
          <P>
            Editing with <Tex>{"v_{\\perp}"}</Tex> moves the face along its
            own level line. The smile goes to {fmt(clean.smile)}, and the
            eyes stay at {fmt(clean.eyes)}.
          </P>
          <P>
            To hold several traits fixed at once, put their unit directions
            in the columns of a matrix <Tex>N</Tex>, make them orthonormal,
            and project out all of them together:
          </P>
          <Tex display>{"v_{\\perp} = (I - N N^{\\top})\\, v"}</Tex>
          <P>InterFaceGAN calls this conditional manipulation.</P>
          <P>
            It only works as well as the space is flat. If the level sets
            curve, a direction is only right locally. That is why some
            methods look for better coordinates after training, and others,
            such as β-VAE, try to untangle the axes during training.
          </P>
          <KeyLine>
            To change one thing, move along the lines where everything else
            stays the same.
          </KeyLine>
        </Step>
      </ScrollStage>
    </>
  );
}
