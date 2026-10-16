import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { ARROWS, tex } from "./model";
import VectorVisual from "./visuals/VectorVisual";

const column = (v: readonly number[], digits = 0) =>
  `\\begin{bmatrix} ${v.map((x) => tex(x, digits)).join(" \\\\ ")} \\end{bmatrix}`;

export default function VectorsChapter() {
  return (
    <ScrollStage tall visual={<VectorVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} />}>
          A vector is a list of numbers.
        </SectionHead>
        <P>
          A neural network can only work with numbers. A pixel, a word and a
          sound all get turned into lists of numbers called vectors. This one
          has two entries.
        </P>
        <Tex display>{`v = ${column(ARROWS.v)}`}</Tex>
        <P>
          Papers write <Tex>{"v \\in \\mathbb{R}^2"}</Tex>, which means{" "}
          <Tex>v</Tex> is a list of two real numbers. Its entries are{" "}
          <Tex>v_1 = 3</Tex> and <Tex>v_2 = 2</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          The same two numbers are also directions: 3 steps to the right, then
          2 up. An arrow from the origin to where you end up shows the vector
          as a point in space, with a direction.
        </P>
        <KeyLine>
          Every vector is both a list of numbers to compute with and an arrow
          to think with.
        </KeyLine>
      </Step>
      <Step>
        <P>
          The arrow has a length, written <Tex>{"\\lVert v \\rVert"}</Tex>. The
          two entries are the sides of a right triangle, so Pythagoras gives
          it.
        </P>
        <Tex display>
          {`\\lVert v \\rVert = \\sqrt{3^2 + 2^2} = ${tex(ARROWS.length)}`}
        </Tex>
        <P>
          With more entries the rule stays the same: square each entry, add
          them up, take the square root. This length is called the norm.
        </P>
      </Step>
      <Step>
        <P>
          Multiplying a vector by a number scales every entry. The arrow keeps
          its direction and changes length. A negative number also flips it to
          point the other way.
        </P>
        <Tex display>
          {`1.5\\,v = ${column(ARROWS.long, 1)} \\qquad -0.5\\,v = ${column(ARROWS.flip, 1)}`}
        </Tex>
      </Step>
      <Step>
        <P>
          Adding two vectors adds their entries. In the picture, put{" "}
          <Tex>w</Tex> at the tip of <Tex>v</Tex>. The sum is the arrow from
          the origin to the end of <Tex>w</Tex>.
        </P>
        <Tex display>{`v + w = ${column(ARROWS.v)} + ${column(ARROWS.w)} = ${column(ARROWS.sum)}`}</Tex>
        <P>
          Scaling and adding are all you need for most of what follows. A
          weighted sum such as <Tex>{"0.7\\,a + 0.3\\,b"}</Tex> is the two
          operations together.
        </P>
      </Step>
      <Step>
        <P>
          Language models give every token a vector called its embedding.
          Directions in that space can carry meaning. In a famous result from
          early word embeddings, the step from “man” to “woman” is roughly the
          same arrow as the step from “king” to “queen”.
        </P>
        <Tex display>
          {"\\text{king} - \\text{man} + \\text{woman} \\approx \\text{queen}"}
        </Tex>
        <P>
          Real embeddings have hundreds or thousands of entries, not two. Nobody
          can draw them, but length, scaling and addition work exactly the
          same way.
        </P>
      </Step>
    </ScrollStage>
  );
}
