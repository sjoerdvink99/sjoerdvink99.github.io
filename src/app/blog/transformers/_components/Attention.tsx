import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { DOG, SIM_W, VECS, WORDS, tex } from "./model";

const products = (a: number[], b: number[]) =>
  a.map((v, i) => `${tex(v, 1)} \\times ${tex(b[i], 1)}`).join(" + ");
import SentenceVisual from "./visuals/SentenceVisual";
import SimilarityVisual from "./visuals/SimilarityVisual";
import AllTokensVisual from "./visuals/AllTokensVisual";

const matrix = (A: number[][], digits = 1) =>
  `\\begin{bmatrix} ${A.map((r) => r.map((v) => tex(v, digits)).join(" & ")).join(" \\\\ ")} \\end{bmatrix}`;

const [wDog, wPuppy, wCar] = DOG.weights.map((w) => tex(w));

function Sentence() {
  return (
    <ScrollStage tall visual={<SentenceVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} />}>
          Every token starts on its own.
        </SectionHead>
        <P>
          A Transformer first turns each token of its input into a vector. In
          this sentence each of the five tokens gets four numbers, drawn as a
          column of shaded cells.
        </P>
        <P>
          At this point a vector only describes its own word. The vector for
          “chased” is the same in every sentence, no matter who did the chasing.
        </P>
      </Step>
      <Step>
        <P>
          To mean something here, “chased” needs information from the other
          tokens: who chased, and what was chased.
        </P>
        <KeyLine>
          How can one token gather useful information from the others?
        </KeyLine>
      </Step>
      <Step>
        <P>
          Attention gives every other token a weight, then mixes their
          information according to those weights. Here “chased” takes most from
          “dog” and “ball”.
        </P>
        <P>
          The result is a new vector for “chased” that carries its context. The
          rest of this essay builds the operation that produces these weights.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Similarity() {
  return (
    <ScrollStage tall visual={<SimilarityVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="Similarity" />}>
          Similar vectors have large dot products.
        </SectionHead>
        <P>
          Here are three word vectors with two numbers each. “dog” and “puppy”
          point in nearly the same direction. “car” points elsewhere. Stacked
          as rows, they form a matrix <Tex>X</Tex> of shape{" "}
          <code>(3, 2)</code>.
        </P>
        <Tex display>{`X = ${matrix(VECS)}`}</Tex>
      </Step>
      <Step>
        <P>
          Pick “dog”. To measure how related another vector is to it, take the
          dot product. Multiply matching entries and add them up.
        </P>
        <Tex display>
          {`\\begin{aligned} \\text{dog} \\cdot \\text{dog} &= ${products(VECS[0], VECS[0])} \\\\ &= ${tex(DOG.scores[0])} \\end{aligned}`}
        </Tex>
      </Step>
      <Step>
        <P>
          Do the same for every word. <code>X @ x</code> computes all three dot
          products at once, one per row of <Tex>X</Tex>.
        </P>
        <P>
          A dot product is large when two vectors point the same way, near zero
          when they are at right angles, and negative when they point apart.
          “puppy” scores {tex(DOG.scores[1])}, “car” only{" "}
          {tex(DOG.scores[2])}.
        </P>
      </Step>
      <Step>
        <P>
          These scores are not weights yet. They could be negative, and they do
          not add up to anything in particular. Softmax fixes both. First it
          exponentiates every score, which makes it positive.
        </P>
        <Tex display>
          {`\\begin{aligned} ${DOG.scores.map((s, i) => `e^{${tex(s)}} &= ${tex(DOG.exps[i])}`).join(" \\\\ ")} \\end{aligned}`}
        </Tex>
      </Step>
      <Step>
        <P>
          Then it divides each by their total, {tex(DOG.total)}. The results
          are positive and sum to 1, and the highest score still gets the most
          weight.
        </P>
        <Tex display>
          {"\\operatorname{softmax}(s)_i = \\frac{e^{s_i}}{\\sum_j e^{s_j}}"}
        </Tex>
      </Step>
      <Step>
        <P>
          Now use the weights. The new vector for “dog” is the weighted sum of
          all three vectors. In the figure the three scaled vectors are laid end
          to end.
        </P>
        <Tex display>
          {`\\begin{aligned} &${wDog}\\,\\text{dog} + ${wPuppy}\\,\\text{puppy} \\\\ &+ ${wCar}\\,\\text{car} \\\\ &= [${DOG.out.map((v) => tex(v)).join(",\\ ")}] \\end{aligned}`}
        </Tex>
        <KeyLine>
          The weights decide how much to take from each vector. The output is
          the mix.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

function AllTokens() {
  return (
    <ScrollStage tall visual={<AllTokensVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="All tokens" />}>
          Every token asks at once.
        </SectionHead>
        <P>
          The row of scores we computed belongs to “dog”. In the full picture,
          each row belongs to one token, the one that asks. Each column is a
          token that is looked at.
        </P>
      </Step>
      <Step>
        <P>
          Filling in every row gives the score matrix{" "}
          <Tex>{"S = XX^{\\top}"}</Tex>, of shape <code>(T, T)</code> for{" "}
          <Tex>T</Tex> tokens. Entry <Tex>{"(i, j)"}</Tex> is the dot product of
          token <Tex>i</Tex> with token <Tex>j</Tex>.
        </P>
        <P>
          This matrix is symmetric. “dog” scores “car” exactly as “car” scores
          “dog”.
        </P>
      </Step>
      <Step>
        <P>
          Softmax is applied to each row separately. That is what{" "}
          <code>axis=-1</code> says: normalize along the last axis, across the
          columns of a row. Each row of <Tex>A</Tex> is one token&apos;s weights
          and sums to 1. The columns do not.
        </P>
        <Tex display>
          {`\\begin{aligned} A &= \\operatorname{softmax}(XX^{\\top}) \\\\ &= ${matrix(SIM_W, 2)} \\end{aligned}`}
        </Tex>
      </Step>
      <Step>
        <P>
          One matrix product now does the mixing for every token. Row{" "}
          <Tex>i</Tex> of <Tex>AX</Tex> is token <Tex>i</Tex>&apos;s weighted
          sum of all rows of <Tex>X</Tex>, so the output has one new vector per
          token, shape <code>(T, D)</code> with <Tex>D</Tex> = 2 numbers per
          token.
        </P>
        <Tex display>
          {"\\text{output} = \\operatorname{softmax}(XX^{\\top})\\,X"}
        </Tex>
        <P>
          Its first row is the vector for “{WORDS[0]}” from before.
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function AttentionChapter() {
  return (
    <>
      <Sentence />
      <Bridge>
        <p>
          Start with something simpler: three words, two numbers each, and
          nothing learned.
        </p>
      </Bridge>
      <Similarity />
      <AllTokens />
    </>
  );
}
