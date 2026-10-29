import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Depth } from "@/components/blog/Level";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { FLOPS, MODEL, TRAIN, big, fmt, texSci } from "./model";
import FlopsVisual from "./visuals/FlopsVisual";

const { d, ffn, layers, kvd } = MODEL;
const share = `${(FLOPS.share * 100).toFixed(1)}%`;

export default function WorkChapter() {
  return (
    <ScrollStage tall visual={<FlopsVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} />}>
          A language model runs once for every word it writes.
        </SectionHead>
        <Depth only="intuition">
          <P>
            When a chatbot answers you, it does not plan the whole reply. It
            picks one word, adds it to the text, and starts over. Each pick
            sends the text through the entire model, bottom to top.
          </P>
          <P>
            The model is a tall stack of identical layers. A small open model
            like Llama 3 8B has {layers} of them.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            Models generate text one token at a time. A token is a word or a
            piece of one, and each new token costs one full forward pass
            through the network.
          </P>
          <P>
            We will use a model shaped like Llama 3 8B throughout:{" "}
            {layers} Transformer blocks, a hidden size of {fmt(d)}, and{" "}
            {big(MODEL.params)} parameters.
          </P>
        </Depth>
        <Depth from="expert">
          <P>
            Each block maps a sequence of hidden states{" "}
            <Tex>{"X \\in \\mathbb{R}^{n \\times d}"}</Tex> to a new one of
            the same shape, with <Tex>{`d = ${d}`}</Tex>.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Zoom into one layer and follow one token through it. Most of the
          work happens in a few large steps.
        </P>
        <Depth only="intuition">
          <P>
            First the token is turned into a question, a label and an answer
            to share with the words before it. Then it looks back at those
            words. Then it passes through a large block, the MLP, that does
            most of the thinking.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            The token is projected to a query, key and value. Attention
            compares its query with every earlier key, a projection mixes
            the result back into the hidden state, and an MLP with{" "}
            {fmt(ffn)} hidden units transforms it. The MLP alone takes{" "}
            {fmt((MODEL.d * 6 * ffn * 100) / FLOPS.layer)}% of the work.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{"\\underbrace{2d(d + 2d_{kv})}_{\\text{QKV}} + \\underbrace{4nd}_{\\text{attn}}"}</Tex>
          <Tex display>{"+\\, \\underbrace{2d^2}_{\\text{out}} + \\underbrace{6 d\\, d_{ff}}_{\\text{MLP}}"}</Tex>
          <P>
            Grouped-query attention shrinks keys and values to{" "}
            <Tex>{`d_{kv} = ${kvd}`}</Tex>. The attention term grows with the
            context length <Tex>n</Tex>, here {fmt(MODEL.context)}.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Every one of those large steps is the same operation: multiplying
          two grids of numbers, a matrix multiplication.
        </P>
        <KeyLine>
          Matrix multiplication is {share} of the arithmetic.
        </KeyLine>
        <Depth only="intuition">
          <P>
            Everything else, like normalizing numbers or picking the most
            relevant words, is a rounding error. Make matrix multiplication
            fast and you have made the model fast.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            Normalization, rotary embeddings, softmax and activation
            functions touch each number only a few times. They matter for
            memory traffic, as we will see, but not for arithmetic.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Add up all {layers} layers and the final step that scores every
          word in the vocabulary, and one token costs about{" "}
          {fmt(FLOPS.token / 1e9)} billion operations.
        </P>
        <Depth only="intuition">
          <P>
            There is a neat shortcut: about two operations for every number
            in the model. Each weight is used once per word, to multiply and
            then to add.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            That is close to two FLOPs per parameter. A FLOP is one
            floating-point operation, and every weight takes part in exactly
            one multiply and one add per token.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{`C_{\\text{forward}} \\approx 2N \\approx ${(FLOPS.rule / 1e9).toFixed(1)}\\ \\text{GFLOP}`}</Tex>
          <P>
            The gap to the exact count is the attention term{" "}
            <Tex>{"4nd"}</Tex> per layer, which has no weights and grows with
            context.
          </P>
        </Depth>
      </Step>
      <Step>
        <P>
          Training multiplies this twice over: by the number of tokens the
          model reads, and by three, because learning also has to run the
          model backwards.
        </P>
        <Depth only="intuition">
          <P>
            A {big(TRAIN.params)} model trained on {big(TRAIN.tokens)} tokens
            needs about 6 followed by 24 zeros operations. Counting one per
            second, it would take more than ten million times the age of
            the universe.
          </P>
        </Depth>
        <Depth from="mechanics">
          <P>
            The backward pass costs about twice the forward pass, because
            each matrix multiplication produces two gradients: one for its
            input and one for its weights. For a {big(TRAIN.params)} model
            on {big(TRAIN.tokens)} tokens, that is{" "}
            <Tex>{`${texSci(TRAIN.flops)}`}</Tex> FLOPs.
          </P>
        </Depth>
        <Depth from="expert">
          <Tex display>{"Y = XW \\;\\Rightarrow\\; \\frac{\\partial L}{\\partial X} = \\frac{\\partial L}{\\partial Y} W^{\\top}"}</Tex>
          <Tex display>{"\\frac{\\partial L}{\\partial W} = X^{\\top} \\frac{\\partial L}{\\partial Y}"}</Tex>
          <Tex display>{"C_{\\text{train}} \\approx (2 + 4)\\,ND = 6ND"}</Tex>
        </Depth>
        <KeyLine>
          The question is not whether a computer can do this. It is how many
          matrix multiplications it can do per second.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}
