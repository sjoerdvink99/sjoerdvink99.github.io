import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { ATT, MASKED, P as POS, TOKENS, X, X_POS, tex } from "./model";
import PositionVisual from "./visuals/PositionVisual";
import BlockVisual from "./visuals/BlockVisual";
import ModelVisual from "./visuals/ModelVisual";
import MaskVisual from "./visuals/MaskVisual";

const row = (v: number[]) => `[${v.map((x) => tex(x, 1)).join(",\\ ")}]`;

function Position() {
  return (
    <ScrollStage tall visual={<PositionVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={4} />}>
          Attention does not see order.
        </SectionHead>
        <P>
          Swap “dog” and “ball”. The sentence means something else, but the
          output for “dog” is exactly the same. Every step so far treats the
          tokens as a set. Scores depend on the vectors, never on where they
          sit.
        </P>
        <P>For the same reason, the two copies of “the” get identical outputs.</P>
      </Step>
      <Step>
        <P>
          The fix is to add a position vector to every token vector before the
          first block. It has the same width <Tex>D</Tex>, and it is added
          entry by entry.
        </P>
        <Tex display>
          {`\\begin{array}{rl} & ${row(X[0])} \\\\ + & ${row(POS[0])} \\\\ \\hline = & ${row(X_POS[0])} \\end{array}`}
        </Tex>
        <P>
          Position is not a new axis. The vector is still <Tex>D</Tex> numbers
          wide. Each number now mixes what the token is with where it is.
        </P>
      </Step>
      <Step>
        <P>
          The same word at two positions now starts from two different vectors,
          so attention can tell them apart.
        </P>
        <P>
          Position vectors can be fixed sine and cosine waves, as in the
          original Transformer, or learned like the token embeddings. The model
          at the end of this essay learns them. The values here are made up.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Block() {
  return (
    <ScrollStage tall visual={<BlockVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={4} sub="Block" />}>
          Attention, then a small network per token.
        </SectionHead>
        <P>
          A Transformer block wraps multi-head attention with a few standard
          parts. Attention is the only place in the block where tokens exchange
          information.
        </P>
      </Step>
      <Step>
        <P>
          A residual connection adds the block&apos;s input to the attention
          output, so attention only has to learn a change to each vector.
          LayerNorm then rescales each token&apos;s vector to mean 0 and
          variance 1, followed by a learned scale and shift.
        </P>
      </Step>
      <Step>
        <P>
          The MLP is two linear layers with a nonlinearity between them, usually{" "}
          <Tex>4D</Tex> wide inside. It is applied to every token separately,
          with the same weights. Attention moved information between tokens.
          The MLP transforms what each token now holds.
        </P>
      </Step>
      <Step>
        <P>
          A second residual connection and LayerNorm finish the block. The
          output has shape <code>(T, D)</code>, like the input.
        </P>
        <P>
          This is the arrangement of the original Transformer. Many recent
          models normalize before each part instead,{" "}
          <code>X + self.attn(self.norm1(X))</code>, which trains more reliably
          in deep stacks.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Model() {
  return (
    <ScrollStage tall visual={<ModelVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={4} sub="Model" />}>
          Stack the blocks.
        </SectionHead>
        <P>
          A model starts with two lookup tables, one row per vocabulary token
          and one row per position. Their sum is <Tex>X</Tex>, shape{" "}
          <code>(B, T, D)</code>. The position part has shape{" "}
          <code>(T, D)</code> and is broadcast over the batch.
        </P>
      </Step>
      <Step>
        <P>
          <Tex>X</Tex> passes through a Transformer block. Out comes a tensor of
          the same shape, every vector now informed by the others.
        </P>
      </Step>
      <Step>
        <P>
          Because the shape never changes, blocks stack. Each block works on
          what the blocks before it gathered, so information can travel in
          several hops and be combined along the way.
        </P>
      </Step>
      <Step>
        <P>
          A final linear layer turns every vector into one score per word in
          the vocabulary. A language model reads the scores at each position
          as a guess for the token that comes next.
        </P>
      </Step>
    </ScrollStage>
  );
}

const CHASED = TOKENS.indexOf("chased");
const exponent = (v: number) => tex(v, Number.isInteger(v) ? 0 : 2);

function Mask() {
  return (
    <ScrollStage tall visual={<MaskVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={4} sub="Masked attention" />}>
          No looking ahead.
        </SectionHead>
        <P>
          A model that predicts the next token is trained on every position of
          a sentence at once. At “chased” it must guess “the”, so it may not
          see the words that follow. Plain attention lets every token see every
          other token.
        </P>
      </Step>
      <Step>
        <P>
          The fix happens between the scaled scores and the softmax. Every
          score where a token looks at a later position, everything above the
          diagonal, is replaced by <Tex>{"-\\infty"}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          Because <Tex>{"e^{-\\infty} = 0"}</Tex>, those positions get weight
          0, and softmax spreads each row over the positions that remain. The
          row of “chased” now covers three tokens instead of five.
        </P>
        <Tex display>
          {`\\begin{aligned} &\\frac{e^{${exponent(ATT.scaled[CHASED][1])}}}{e^{0} + e^{${exponent(ATT.scaled[CHASED][1])}} + e^{0}} \\\\ &= \\frac{${tex(Math.exp(ATT.scaled[CHASED][1]))}}{${tex(1 + Math.exp(ATT.scaled[CHASED][1]) + 1)}} = ${tex(MASKED[CHASED][1])} \\end{aligned}`}
        </Tex>
      </Step>
      <Step>
        <P>
          The first token can only attend to itself. The last one sees the
          whole sentence, so its row is the same as without the mask. Nothing
          else in the model changes.
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function TransformerChapter() {
  return (
    <>
      <Bridge>
        <p>
          Attention is nearly a Transformer. Two pieces are missing: a sense of
          order, and somewhere to process what was gathered.
        </p>
      </Bridge>
      <Position />
      <Block />
      <Model />
      <Mask />
    </>
  );
}
