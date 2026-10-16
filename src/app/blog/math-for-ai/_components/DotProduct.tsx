import Link from "next/link";
import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { DOT, NEURON, SEARCH, dot, norm, tex } from "./model";
import DotVisual from "./visuals/DotVisual";
import CosineVisual from "./visuals/CosineVisual";
import NeuronVisual from "./visuals/NeuronVisual";

const value = DOT.at(45);
const winner = (scores: number[]) => SEARCH.items[scores.indexOf(Math.max(...scores))].word;
const dog = SEARCH.items.findIndex((i) => i.word === "dog");
const puppy = SEARCH.items.findIndex((i) => i.word === "puppy");

function Dot() {
  return (
    <ScrollStage tall visual={<DotVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} />}>
          The dot product multiplies and adds.
        </SectionHead>
        <P>
          Take two vectors with the same number of entries. Multiply the
          entries that line up, then add the products. One number comes out.
        </P>
        <Tex display>
          {`a \\cdot b = \\sum_i a_i b_i = 3 \\times 1 + 1 \\times 2 = ${tex(value, 0)}`}
        </Tex>
        <P>
          Papers also write it as <Tex>{"a^{\\top} b"}</Tex> or{" "}
          <Tex>{"\\langle a, b \\rangle"}</Tex>. In NumPy it is{" "}
          <code>a @ b</code>.
        </P>
      </Step>
      <Step>
        <P>
          That number also has a meaning in the picture. It is the product of
          the two lengths and the cosine of the angle between the arrows.
        </P>
        <Tex display>
          {`a \\cdot b = \\lVert a \\rVert\\, \\lVert b \\rVert \\cos\\theta = \\sqrt{${dot(DOT.a, DOT.a)}} \\times \\sqrt{${dot(DOT.b, DOT.b)}} \\times \\cos 45^\\circ = ${tex(value, 0)}`}
        </Tex>
        <P>
          The lengths set the scale. The cosine measures agreement: 1 when the
          arrows point the same way, 0 at a right angle, −1 when they point in
          opposite directions.
        </P>
      </Step>
      <Step>
        <P>
          From the tip of <Tex>b</Tex>, drop a line onto the line through{" "}
          <Tex>a</Tex>, meeting it at a right angle. The stretch from the
          origin to where it lands, shown in amber, is the projection of{" "}
          <Tex>b</Tex> onto <Tex>a</Tex>. Think of it as the shadow{" "}
          <Tex>b</Tex> casts on <Tex>a</Tex>. It is{" "}
          {tex(value / norm(DOT.a))} long.
        </P>
        <P>
          The dot product equals the length of that shadow times the length of{" "}
          <Tex>a</Tex>.
        </P>
        <KeyLine>
          The dot product measures how far one vector goes in the direction of
          the other.
        </KeyLine>
      </Step>
      <Step>
        <P>
          Turn <Tex>b</Tex> until it makes a right angle with <Tex>a</Tex>. The
          shadow disappears and the dot product is 0.
        </P>
        <P>
          Vectors at right angles are called orthogonal. Neither has any part
          that points along the other.
        </P>
      </Step>
      <Step>
        <P>
          Turn further and the shadow falls behind the origin. The dot product
          becomes negative: {tex(DOT.at(150))} at 150°.
        </P>
        <Tex display>
          {
            "a \\cdot b \\begin{cases} > 0 & \\text{pointing the same way} \\\\ = 0 & \\text{at right angles} \\\\ < 0 & \\text{pointing apart} \\end{cases}"
          }
        </Tex>
      </Step>
      <Step>
        <P>
          Now turn <Tex>b</Tex> yourself. The value follows{" "}
          <Tex>{"\\cos\\theta"}</Tex>: largest when the arrows line up, zero at
          90°, most negative when they point opposite ways.
        </P>
        <P>
          The arithmetic does not care how many entries there are. In 4,096
          dimensions the dot product still means agreement in direction, even
          though nobody can draw the angle.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Similarity() {
  return (
    <ScrollStage tall visual={<CosineVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} sub="Similarity" />}>
          Only the direction should count.
        </SectionHead>
        <P>
          Search engines, recommendation systems and retrieval for chatbots all
          rank items by the dot product between their embeddings and a query
          vector <Tex>q</Tex>.
        </P>
        <P>
          Here the rose arrow <Tex>q</Tex> is a query about puppies. The raw dot product ranks
          “{winner(SEARCH.raw)}” first, with {tex(SEARCH.raw[dog])} against{" "}
          {tex(SEARCH.raw[puppy])}, only because its arrow is longer. In real
          embeddings, length often reflects how common a word is, not what it
          means.
        </P>
      </Step>
      <Step>
        <P>
          The fix is to divide every vector by its length first. All arrows
          then end on the unit circle, and the dot product is exactly the
          cosine of the angle between them.
        </P>
        <Tex display>
          {
            "\\cos(a, q) = \\frac{a \\cdot q}{\\lVert a \\rVert\\, \\lVert q \\rVert}"
          }
        </Tex>
        <P>
          Now “{winner(SEARCH.cosine)}” wins with {tex(SEARCH.cosine[puppy])}{" "}
          against {tex(SEARCH.cosine[dog])}. This is cosine similarity.
        </P>
      </Step>
      <Step>
        <P>
          Stack all item embeddings as the rows of a matrix <Tex>E</Tex>. One
          product, <code>E @ q</code>, then scores every item at once, and
          sorting the scores gives the best matches.
        </P>
        <P>
          Attention in a Transformer uses the same step. Every token has a
          query, and it scores every token, itself included, by a dot product. The{" "}
          <Link href="/blog/transformers/" className="underline underline-offset-4 hover:text-ir-ink">
            Transformer essay
          </Link>{" "}
          builds that up from here.
        </P>
      </Step>
    </ScrollStage>
  );
}

const { w, bias, probe } = NEURON;

function Neuron() {
  return (
    <ScrollStage tall visual={<NeuronVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} sub="Neuron" />}>
          A neuron is a dot product.
        </SectionHead>
        <P>
          An artificial neuron holds a weight vector <Tex>w</Tex> and a number{" "}
          <Tex>b</Tex> called the bias. Given an input <Tex>x</Tex>, it
          computes one score.
        </P>
        <Tex display>{"\\text{score} = w \\cdot x + b"}</Tex>
        <P>
          Here <Tex>{`w = [${w.join(", ")}]`}</Tex> and there are two kinds of
          points. We want the score to tell them apart.
        </P>
      </Step>
      <Step>
        <P>
          Ignore the bias for now. Which points have <Tex>{"w \\cdot x = 0"}</Tex>?
          Exactly the ones at a right angle to <Tex>w</Tex>. Together they form
          a line through the origin, perpendicular to <Tex>w</Tex>.
        </P>
        <P>
          In three dimensions this is a plane. In more, it is called a
          hyperplane, and the idea is the same.
        </P>
      </Step>
      <Step>
        <P>
          On the side <Tex>w</Tex> points to, the score is positive. On the
          other side it is negative. The marked point scores{" "}
          {tex(dot(w, probe), 1)}.
        </P>
        <P>
          The sign says which side of the line a point is on, and the size
          grows with its distance from the line. This line is in the wrong place, though:
          most rose points are on the positive side too.
        </P>
      </Step>
      <Step>
        <P>
          The bias moves the line without turning it. With{" "}
          <Tex>{`b = ${tex(bias, 0)}`}</Tex>, the boundary moves{" "}
          {tex(-bias / norm(w))} along <Tex>w</Tex>, and the sign of the score
          now separates the two classes.
        </P>
        <KeyLine>
          Training a neuron means finding the <Tex>w</Tex> and <Tex>b</Tex>{" "}
          that put the line in the right place.
        </KeyLine>
      </Step>
      <Step>
        <P>
          A layer has many neurons, each with its own weights and bias, and so
          each with its own line. Stack the weight vectors as the rows of a
          matrix <Tex>W</Tex>, and the whole layer becomes one operation.
        </P>
        <Tex display>
          {
            "Wx + b = \\begin{bmatrix} w_1 \\cdot x + b_1 \\\\ w_2 \\cdot x + b_2 \\\\ w_3 \\cdot x + b_3 \\end{bmatrix}"
          }
        </Tex>
        <P>
          A layer is many dot products computed at once. That is what a matrix
          does, which is the next chapter.
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function DotProductChapter() {
  return (
    <>
      <Dot />
      <Bridge>
        <p>
          A single dot product measures how much two vectors agree. Used on
          embeddings, it measures how similar two things are.
        </p>
      </Bridge>
      <Similarity />
      <Bridge>
        <p>
          A dot product compares a vector with a fixed direction. Make that
          direction learnable, and you have a neuron.
        </p>
      </Bridge>
      <Neuron />
    </>
  );
}
