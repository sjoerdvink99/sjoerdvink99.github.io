import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { BASE, FACES, SMILE_DIR, SMILE_MEANS, SMILING, add, decode, fmt, texList } from "./model";
import DirectionsVisual from "./visuals/DirectionsVisual";

const smiling = SMILING.filter(Boolean).length;
const before = decode(BASE);
const after = decode(add(BASE, SMILE_DIR));

export default function DirectionsChapter() {
  return (
    <>
      <Bridge>
        <p>
          If no axis means smile, where in the space does smiling live?
        </p>
      </Bridge>
      <ScrollStage tall visual={<DirectionsVisual />}>
        <Step>
          <SectionHead label={<ChapterLabel n={2} />}>
            A concept is a direction.
          </SectionHead>
          <P>
            Start with examples. Here are {FACES.length} faces from the
            model, each a point in the latent space, and a person has
            labelled each one: {smiling} smiling, filled, and{" "}
            {FACES.length - smiling} not smiling, hollow.
          </P>
          <P>
            The two groups overlap, but the smiling ones lean to the right.
            With a real image model you would get these points by encoding
            labelled photos, or by keeping the <Tex>z</Tex> behind each
            generated image.
          </P>
        </Step>
        <Step>
          <P>
            Average each group. The two crosses are the means, and the arrow
            from one to the other is the smile direction:
          </P>
          <Tex display>
            {`\\begin{aligned} v &= \\mu_{\\text{smiling}} - \\mu_{\\text{not}} \\\\ &= ${texList(SMILE_MEANS[1])} - ${texList(SMILE_MEANS[0])} = ${texList(SMILE_DIR)} \\end{aligned}`}
          </Tex>
          <P>
            That is the whole method. There is nothing to train, just two
            averages and a subtraction. This difference of means turns up
            everywhere, from word vectors to steering language models.
          </P>
        </Step>
        <Step>
          <P>
            To edit a face, add the direction to its latent vector and decode
            again:
          </P>
          <Tex display>{"z_{\\text{edit}} = z + \\alpha\\, v"}</Tex>
          <P>
            The hollow red point is a frowning face with smile{" "}
            {fmt(before.smile)}. One step of <Tex>v</Tex> takes it to{" "}
            {fmt(after.smile)}. The same <Tex>v</Tex> works on every face,
            which is the real claim: a concept is a single direction, the
            same everywhere in the space.
          </P>
          <P>
            This is the old word vector result,{" "}
            <Tex>{"\\text{king} - \\text{man} + \\text{woman} \\approx \\text{queen}"}</Tex>
            , and the DCGAN demo where a smiling woman, minus a neutral
            woman, plus a neutral man gave a smiling man.
          </P>
        </Step>
        <Step>
          <P>
            Now <Tex>{"\\alpha"}</Tex> is a dial. Turn it up and the face smiles
            more, turn it below zero and it frowns. Many sliders in face
            editing tools are a vector like this one with its own{" "}
            <Tex>{"\\alpha"}</Tex>.
          </P>
          <P>
            Watch the eyes, though. As the smile grows they close, from{" "}
            {fmt(before.eyes)} to {fmt(after.eyes)} at{" "}
            <Tex>{"\\alpha = 1"}</Tex>. We asked for a smile and got a squint
            as well. Chapter 4 is about why.
          </P>
        </Step>
        <Step>
          <P>
            A direction can also be read. Project any point onto the line
            through <Tex>v</Tex>, by dropping a perpendicular, and the
            position along the line is a smile score:
          </P>
          <Tex display>
            {"\\operatorname{score}(z) = z \\cdot \\hat{v} = \\frac{z \\cdot v}{\\lVert v \\rVert}"}
          </Tex>
          <P>
            On the right, every face is placed by its score. Smiling faces
            score high and the rest score low, with a little overlap in the
            middle. A single dot product says how much smile a point
            contains.
          </P>
          <KeyLine>
            One vector does two jobs. Adding it changes the concept, and
            projecting onto it measures the concept.
          </KeyLine>
        </Step>
      </ScrollStage>
    </>
  );
}
