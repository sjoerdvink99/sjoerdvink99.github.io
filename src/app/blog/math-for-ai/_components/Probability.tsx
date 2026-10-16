import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { NEXT, SPREAD, SURPRISE, tex } from "./model";
import SpreadVisual from "./visuals/SpreadVisual";
import SoftmaxVisual from "./visuals/SoftmaxVisual";
import EntropyVisual from "./visuals/EntropyVisual";

const { mu, variance, sigma } = SPREAD;
const [best] = NEXT.tokens;

function Spread() {
  return (
    <ScrollStage tall visual={<SpreadVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={6} />}>
          Data has a center and a spread.
        </SectionHead>
        <P>
          Here are seven measurements. Networks constantly summarize and
          rescale numbers like these: their inputs, their activations inside
          every layer, and their weights when they are first set up.
        </P>
      </Step>
      <Step>
        <P>
          The mean is the balance point. If every value were a weight on a
          ruler, the ruler would balance there. To compute it, add the values
          and divide by how many there are.
        </P>
        <Tex display>{`\\mu = \\frac{1}{n} \\sum_i x_i = ${tex(mu, 0)}`}</Tex>
        <P>
          Papers write the mean as an expectation,{" "}
          <Tex>{"\\mathbb{E}[x]"}</Tex>. Read <Tex>{"\\mathbb{E}"}</Tex> as
          &ldquo;the average of&rdquo;.
        </P>
      </Step>
      <Step>
        <P>
          How far are the values from the mean? Draw each distance as a
          square. The variance is the average area of those squares.
        </P>
        <Tex display>
          {`\\sigma^2 = \\frac{1}{n} \\sum_i (x_i - \\mu)^2 = ${tex(variance, 0)}`}
        </Tex>
        <P>
          Squaring makes every distance positive, and it makes values far
          from the mean count much more than values close to it.
        </P>
      </Step>
      <Step>
        <P>
          Variance is measured in squared units. Its square root, the
          standard deviation <Tex>{`\\sigma = ${tex(sigma)}`}</Tex>, is the
          side of the average square, back in the original units. It is the
          typical distance from the mean.
        </P>
      </Step>
      <Step>
        <P>
          Many quantities bunch up around their mean in a bell shape. This is
          the normal distribution <Tex>{"\\mathcal{N}(\\mu, \\sigma^2)"}</Tex>,
          and the mean and variance are all it needs.
        </P>
        <Tex display>
          {
            "p(x) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\!\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right)"
          }
        </Tex>
        <P>
          It is everywhere in AI. Weights often start out as random draws from it,
          and variational autoencoders and diffusion models generate new
          samples by starting from it.
        </P>
      </Step>
      <Step>
        <P>
          Subtract the mean and divide by the standard deviation. The data
          now has mean 0 and standard deviation 1, and its shape is
          unchanged.
        </P>
        <Tex display>{"z = \\frac{x - \\mu}{\\sigma}"}</Tex>
        <P>
          LayerNorm does exactly this to every token vector inside a
          Transformer, and then applies a learned scale and shift. It keeps
          numbers in a steady range as they pass through dozens of layers.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Softmax() {
  return (
    <ScrollStage tall visual={<SoftmaxVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={6} sub="Softmax" />}>
          Softmax turns scores into probabilities.
        </SectionHead>
        <P>
          A language model ends with one score per word in its vocabulary.
          These raw scores are called logits. Here are four candidates for
          the next word in &ldquo;the cat sat on the&rdquo;.
        </P>
        <P>
          Logits can be any number, negative ones included. They are not
          probabilities yet.
        </P>
      </Step>
      <Step>
        <P>
          First, exponentiate. <Tex>{"e^z"}</Tex> is always positive and
          keeps the order of the scores. It also stretches the gaps: a logit
          that is 1 higher becomes <Tex>{"e \\approx 2.7"}</Tex> times larger.
        </P>
      </Step>
      <Step>
        <P>
          Then divide by the total. The results are positive and sum to 1, so
          they form a probability distribution. &ldquo;{best}&rdquo; gets{" "}
          {tex(NEXT.p[0])}.
        </P>
        <Tex display>
          {"\\operatorname{softmax}(z)_i = \\frac{e^{z_i}}{\\sum_j e^{z_j}}"}
        </Tex>
      </Step>
      <Step>
        <P>
          Dividing the logits by a temperature <Tex>T</Tex> first changes the
          shape. A low temperature sharpens the distribution towards the top
          word. A high temperature flattens it towards uniform.
        </P>
        <P>
          This is the temperature setting of a chatbot. Drag it and watch the
          probabilities move.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Surprise() {
  const [usual, wrong, right] = SURPRISE.loss;
  return (
    <ScrollStage tall visual={<EntropyVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={6} sub="Cross-entropy" />}>
          Cross-entropy measures surprise.
        </SectionHead>
        <P>
          The right next word is &ldquo;{best}&rdquo;, and the model gave it a
          probability of {tex(NEXT.p[0])}. The loss is the negative log of
          that probability.
        </P>
        <Tex display>{`-\\log ${tex(NEXT.p[0])} = ${tex(usual)}`}</Tex>
        <P>
          The curve shows this loss for every possible probability. It is 0
          when the model gives the right answer probability 1, and grows as
          that probability shrinks.
        </P>
      </Step>
      <Step>
        <P>
          A confident mistake is expensive. If the model gives{" "}
          &ldquo;{best}&rdquo; only {tex(SURPRISE.cases[1][0])}, the loss
          jumps to{" "}
          {tex(wrong)}. The curve rises steeply near zero, so wrong answers
          given with confidence are punished hard.
        </P>
      </Step>
      <Step>
        <P>
          A confident correct answer costs almost nothing: {tex(right)}.
          Averaged over every token in the training data, this is the
          cross-entropy loss.
        </P>
        <Tex display>
          {"L = -\\frac{1}{N} \\sum_{i=1}^{N} \\log p_\\theta(y_i \\mid x_i)"}
        </Tex>
        <P>
          Read <Tex>{"p_\\theta(y \\mid x)"}</Tex> as &ldquo;the probability
          the model with weights <Tex>{"\\theta"}</Tex> gives to <Tex>y</Tex>{" "}
          when it sees <Tex>x</Tex>&rdquo;. Minimizing this loss is the same
          as maximizing the likelihood of the data. Language model papers
          often report <Tex>{"e^{L}"}</Tex> instead, called perplexity.
        </P>
      </Step>
      <Step>
        <P>
          With softmax and cross-entropy combined, the gradient of one
          example&apos;s loss with respect to the logits is remarkably simple.
          With <Tex>y</Tex> the one-hot vector of the right answer:
        </P>
        <Tex display>{"\\frac{\\partial L}{\\partial z} = p - y"}</Tex>
        <P>
          The right word&apos;s logit gets a gradient of{" "}
          {tex(SURPRISE.grad[0])}, so a descent step raises it. Every other
          logit gets its own probability as gradient, so it is lowered in
          proportion to how likely the model thought it was.
        </P>
        <KeyLine>
          Prediction minus truth. That is the error signal backpropagation
          carries into the network.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

export default function ProbabilityChapter() {
  return (
    <>
      <Spread />
      <Bridge>
        <p>
          A model that predicts the next word has to say how likely each
          word is. Raw scores are not enough for that.
        </p>
      </Bridge>
      <Softmax />
      <Surprise />
    </>
  );
}
