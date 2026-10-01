import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import {
  AFTER_ONE_STEP,
  BATCHES,
  EPOCHS,
  GRAD,
  INIT,
  LOSS0,
  LR,
  N_ROWS,
  TRAINING,
  X0,
  XHAT0,
  Z0,
  fmt,
} from "./model";
import PipelineVisual from "./visuals/PipelineVisual";
import NeuronVisual from "./visuals/NeuronVisual";
import EncoderVisual from "./visuals/EncoderVisual";
import DecoderVisual from "./visuals/DecoderVisual";
import LossVisual from "./visuals/LossVisual";
import BackpropVisual from "./visuals/BackpropVisual";
import BatchVisual from "./visuals/BatchVisual";
import LearnedVisual from "./visuals/LearnedVisual";

const n = (v: number, digits = 1) => fmt(v, digits).replace("−", "-");
const vec = (v: readonly number[], digits = 1) =>
  `[${v.map((x) => n(x, digits)).join(",\\ ")}]`;

const FINAL_LOSS = TRAINING.losses[TRAINING.losses.length - 1];

function Pipeline() {
  return (
    <ScrollStage tall visual={<PipelineVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} />}>
          An autoencoder rebuilds its own input.
        </SectionHead>
        <P>
          It has two parts. An encoder turns the input into a new set of
          numbers. A decoder tries to turn those numbers back into the input.
        </P>
      </Step>
      <Step>
        <P>
          We call the input <Tex>x</Tex>, the numbers in the middle <Tex>z</Tex>
          , and the attempt to rebuild the input <Tex>{"\\hat{x}"}</Tex>. The
          vector <Tex>z</Tex> is the latent representation. It is latent because
          nobody observes or labels it.
        </P>
        <Tex display>
          {
            "x \\xrightarrow{\\ \\text{encoder}\\ } z \\xrightarrow{\\ \\text{decoder}\\ } \\hat{x}"
          }
        </Tex>
      </Step>
      <Step>
        <P>
          Training compares <Tex>{"\\hat{x}"}</Tex> with <Tex>x</Tex> and
          adjusts the weights to bring them closer. That comparison is the only
          feedback the model gets. Whatever <Tex>z</Tex> ends up containing is
          whatever helps the decoder rebuild <Tex>x</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          To see every computation, we use the smallest example that still means
          something. The input has two numbers. The latent has one.
        </P>
        <Tex display>{`x = ${vec(X0)}, \\qquad \\dim z = 1`}</Tex>
        <P>
          Here the latent is smaller than the input, so the model has to
          compress. That is a common choice, not a requirement. The last chapter
          uses a latent that is much wider than the input.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Neuron() {
  const [a, b] = INIT.wEnc;
  return (
    <ScrollStage tall visual={<NeuronVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="Encoder" />}>
          A single neuron is a weighted sum.
        </SectionHead>
        <P>
          This one line of NumPy is a complete encoder. It starts from the input
          vector <Tex>x</Tex>, which has shape <code>(2,)</code>.
        </P>
      </Step>
      <Step>
        <P>
          The weight matrix <Tex>{"\\Wenc"}</Tex> holds one weight per input
          dimension. Its shape <code>(2, 1)</code> says that it maps two numbers
          to one.
        </P>
        <Tex
          display
        >{`\\Wenc = \\begin{bmatrix} ${n(a)} \\\\ ${n(b)} \\end{bmatrix}`}</Tex>
      </Step>
      <Step>
        <P>
          The <code>@</code> operator pairs each entry of <Tex>x</Tex> with the
          matching weight. The first input meets the first weight, and the
          second meets the second.
        </P>
      </Step>
      <Step>
        <P>Each pair is multiplied.</P>
        <Tex display>
          {`\\begin{aligned} ${n(X0[0])} \\times ${n(a)} &= ${n(X0[0] * a)} \\\\ ${n(X0[1])} \\times (${n(b)}) &= ${n(X0[1] * b)} \\end{aligned}`}
        </Tex>
      </Step>
      <Step>
        <P>
          The products are added, together with the bias <Tex>{"\\benc"}</Tex>.
          The bias shifts the result by the same amount for every input.
        </P>
        <Tex display>
          {`${n(X0[0] * a)} + (${n(X0[1] * b)}) + ${n(INIT.bEnc)} = ${n(Z0)}`}
        </Tex>
      </Step>
      <Step>
        <P>
          The whole line reduces to one number, the latent representation of{" "}
          <Tex>x</Tex>.
        </P>
        <Tex display>{`z = x\\,\\Wenc + \\benc = ${n(Z0)}`}</Tex>
        <P>
          This is exactly what one neuron without an activation function
          computes. A layer is several neurons side by side, which is why{" "}
          <Tex>W</Tex> is a matrix.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Encoder() {
  return (
    <ScrollStage tall visual={<EncoderVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="Encoder" />}>
          The encoder folds a plane onto a line.
        </SectionHead>
        <P>
          An input with two numbers is a point in a plane. Here are seven
          inputs, including <Tex>x</Tex>. The encoder gives each of them one
          number.
        </P>
      </Step>
      <Step>
        <P>
          Inputs that share a value of <Tex>z</Tex> lie on a straight line at a
          right angle to the weight vector <Tex>{"\\Wenc"}</Tex>. Along each of
          these lines, <Tex>z</Tex> is constant.
        </P>
      </Step>
      <Step>
        <P>
          So the encoder slides every point along its line until it meets the
          direction of <Tex>{"\\Wenc"}</Tex>. Where the point sat along its line
          is forgotten.
        </P>
      </Step>
      <Step>
        <P>
          A point&apos;s position along that direction, scaled by the length of{" "}
          <Tex>{"\\Wenc"}</Tex> and shifted by the bias, is its value of{" "}
          <Tex>z</Tex>. Seven points in two dimensions are now seven numbers.
        </P>
      </Step>
      <Step>
        <P>
          This is not the same as deleting a coordinate. Dropping{" "}
          <Tex>{"x_2"}</Tex> would be one particular choice, the direction at
          0°. Training can choose any direction.
        </P>
        <P>
          Try a few with the slider. Some directions keep the points spread
          apart. Others squeeze them together, which leaves the decoder little
          to work with.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Decoder() {
  return (
    <ScrollStage tall visual={<DecoderVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="Decoder" />}>
          The decoder goes from one number back to two.
        </SectionHead>
        <P>
          It has the same form as the encoder, in reverse. It starts from{" "}
          <Tex>{`z = ${n(Z0)}`}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          <Tex>{"\\Wdec"}</Tex> has shape <code>(1, 2)</code>. Multiplying by{" "}
          <Tex>z</Tex> scales its single row, so the result always lies along
          the same direction. Only its length, and for negative <Tex>z</Tex> its
          sign, depends on <Tex>z</Tex>.
        </P>
        <Tex display>{`${n(Z0)} \\times ${vec(INIT.wDec)} = ${vec(
          INIT.wDec.map((w) => w * Z0),
          1,
        )}`}</Tex>
      </Step>
      <Step>
        <P>The bias moves the result to its final place.</P>
        <Tex display>
          {`\\begin{aligned} \\hat{x} &= ${vec(INIT.wDec.map((w) => w * Z0))} + ${vec(INIT.bDec)} \\\\ &= ${vec(XHAT0)} \\end{aligned}`}
        </Tex>
      </Step>
      <Step>
        <P>
          Because <Tex>z</Tex> is a single number, every possible output lies on
          one line. Move <Tex>z</Tex> to trace it. The other six inputs are
          decoded onto the same line.
        </P>
      </Step>
      <Step>
        <P>
          Now compare. The input was <Tex>{`x = ${vec(X0)}`}</Tex>. The
          reconstruction is <Tex>{`\\hat{x} = ${vec(XHAT0)}`}</Tex>.
        </P>
        <P>
          Nothing has been learned yet. The weights are numbers we picked by
          hand, so every reconstruction misses its input.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Loss() {
  const d = [XHAT0[0] - X0[0], XHAT0[1] - X0[1]];
  return (
    <ScrollStage tall visual={<LossVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="Loss" />}>
          The loss turns a miss into one number.
        </SectionHead>
        <P>
          Start with the difference between the reconstruction and the input.
        </P>
        <Tex display>{`\\hat{x} - x = ${vec(d)}`}</Tex>
      </Step>
      <Step>
        <P>
          Square each entry, so that misses in either direction count and large
          misses count more. Then take the mean over the two coordinates. In the
          figure, each squared error is the area of a square.
        </P>
        <Tex display>
          {`\\begin{aligned} L &= \\tfrac{1}{2}\\big((${n(d[0])})^2 + (${n(d[1])})^2\\big) \\\\ &= \\tfrac{1}{2}(${n(d[0] ** 2, 2)} + ${n(d[1] ** 2, 2)}) = ${n(LOSS0, 2)} \\end{aligned}`}
        </Tex>
      </Step>
      <Step>
        <P>
          The loss depends only on the distance between <Tex>{"\\hat{x}"}</Tex>{" "}
          and <Tex>x</Tex>. Every point on a circle around <Tex>x</Tex> has the
          same loss. These circles are the contour lines of the loss.
        </P>
      </Step>
      <Step>
        <P>
          The gradient tells us how the loss changes as <Tex>{"\\hat{x}"}</Tex>{" "}
          moves. For the mean over <Tex>n</Tex> coordinates it is
        </P>
        <Tex display>
          {`\\frac{\\partial L}{\\partial \\hat{x}} = \\frac{2}{n}(\\hat{x} - x) = \\hat{x} - x \\quad (n = 2)`}
        </Tex>
        <P>
          It points straight away from <Tex>x</Tex>, across the contour lines.
          That is the direction in which the loss grows fastest.
        </P>
      </Step>
      <Step>
        <P>
          Its negative points toward <Tex>x</Tex>. A small step in that
          direction lowers the loss. Gradient descent repeats such small steps.
        </P>
      </Step>
      <Step>
        <P>
          Drag <Tex>{"\\hat{x}"}</Tex>, or focus it and use the arrow keys. The
          gradient grows as <Tex>{"\\hat{x}"}</Tex> moves away from <Tex>x</Tex>
          , and it always points away from it.
        </P>
        <P>
          But we cannot move <Tex>{"\\hat{x}"}</Tex> directly. It is computed
          from the weights. What we need is the gradient for each weight.
        </P>
      </Step>
    </ScrollStage>
  );
}

const PARTIALS = [
  "\\partial L / \\partial \\hat{x}",
  "\\partial L / \\partial \\Wdec",
  "\\partial L / \\partial \\bdec",
  "\\partial L / \\partial z",
  "\\partial L / \\partial \\Wenc",
  "\\partial L / \\partial \\benc",
];

function Backprop() {
  return (
    <ScrollStage
      tall
      visual={
        <BackpropVisual
          labels={PARTIALS.map((p) => (
            <Tex key={p}>{p}</Tex>
          ))}
        />
      }
    >
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="Backpropagation" />}>
          The error travels backward.
        </SectionHead>
        <P>
          The forward pass computed every value in this graph. Each operation
          knows only its own inputs and outputs.
        </P>
        <P>
          Backpropagation lets every operation answer one local question. How
          much did my input contribute to the final error?
        </P>
      </Step>
      <Step>
        <P>It starts at the loss, where we already know the answer.</P>
        <Tex
          display
        >{`\\frac{\\partial L}{\\partial \\hat{x}} = \\hat{x} - x = ${vec(GRAD.dXhat)}`}</Tex>
      </Step>
      <Step>
        <P>
          The decoder computed <Tex>{"\\hat{x} = z\\,\\Wdec + \\bdec"}</Tex>. A
          weight&apos;s gradient is the input it multiplied, times the gradient
          arriving from above. The bias passes that gradient through unchanged.
        </P>
        <Tex display>
          {`\\begin{aligned} \\frac{\\partial L}{\\partial \\Wdec} &= z\\,\\frac{\\partial L}{\\partial \\hat{x}} \\\\ &= ${n(Z0)} \\times ${vec(GRAD.dXhat)} \\\\ &= ${vec(GRAD.dWDec, 2)} \\end{aligned}`}
        </Tex>
      </Step>
      <Step>
        <P>
          The gradient also passes through the decoder to <Tex>z</Tex>. This is
          the chain rule. The slope of <Tex>{"\\hat{x}"}</Tex> with respect to{" "}
          <Tex>z</Tex> is <Tex>{"\\Wdec"}</Tex>, so
        </P>
        <Tex display>
          {`\\begin{aligned} \\frac{\\partial L}{\\partial z} &= \\frac{\\partial L}{\\partial \\hat{x}}\\,\\Wdec^{\\top} \\\\ &= (${n(GRAD.dXhat[0])})(${n(INIT.wDec[0])}) + (${n(GRAD.dXhat[1])})(${n(INIT.wDec[1])}) \\\\ &= ${n(GRAD.dZ)} \\end{aligned}`}
        </Tex>
        <P>
          The sign is informative. Increasing <Tex>z</Tex> would lower the loss,
          because it moves <Tex>{"\\hat{x}"}</Tex> along the decoder line toward{" "}
          <Tex>x</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          The same rule reaches the encoder. Its weights multiplied <Tex>x</Tex>
          , so their gradient is <Tex>x</Tex> times the gradient at <Tex>z</Tex>
          .
        </P>
        <Tex display>
          {`\\begin{aligned} \\frac{\\partial L}{\\partial \\Wenc} &= x^{\\top}\\frac{\\partial L}{\\partial z} \\\\ &= \\begin{bmatrix} ${n(X0[0])} \\\\ ${n(X0[1])} \\end{bmatrix} (${n(GRAD.dZ)}) \\\\ &= \\begin{bmatrix} ${n(GRAD.dWEnc[0])} \\\\ ${n(GRAD.dWEnc[1])} \\end{bmatrix} \\end{aligned}`}
        </Tex>
      </Step>
      <Step>
        <P>
          Every weight now has a gradient. Each takes a small step against it,
          scaled by a learning rate <Tex>{"\\eta"}</Tex>.
        </P>
        <Tex display>
          {"W \\leftarrow W - \\eta\\,\\frac{\\partial L}{\\partial W}"}
        </Tex>
        <P>
          With <Tex>{`\\eta = ${LR}`}</Tex>, one step lowers the loss from{" "}
          {fmt(LOSS0, 2)} to {fmt(AFTER_ONE_STEP.loss, 2)}. Repeating this step
          is training.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Batches() {
  const per = N_ROWS / BATCHES;
  return (
    <ScrollStage tall visual={<BatchVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="Training" />}>
          From one input to a dataset.
        </SectionHead>
        <P>
          A dataset is a matrix with one row per observation. Here <Tex>X</Tex>{" "}
          has {N_ROWS} rows and 2 columns. Its first row is our <Tex>x</Tex>.
        </P>
        <Tex
          display
        >{`x \\in \\mathbb{R}^{2} \\quad\\longrightarrow\\quad X \\in \\mathbb{R}^{${N_ROWS} \\times 2}`}</Tex>
      </Step>
      <Step>
        <P>
          The model does not change. The same weights are applied to every row,
          in a single matrix multiplication. The bias is added to each row,
          which NumPy calls broadcasting.
        </P>
        <Tex
          display
        >{`Z = X\\,\\Wenc + \\benc, \\qquad Z \\in \\mathbb{R}^{${N_ROWS} \\times 1}`}</Tex>
      </Step>
      <Step>
        <P>
          Before each pass over the data, the rows are shuffled. That way the
          updates do not see the data in the same order every time.
        </P>
      </Step>
      <Step>
        <P>
          The shuffled rows are cut into mini-batches, here {BATCHES} batches of{" "}
          {per} rows.
        </P>
      </Step>
      <Step>
        <P>
          Each batch produces one update. The loss is averaged over the rows of
          the batch, so the gradient is an average as well. It is noisier than
          the gradient over all the data, and much cheaper when the data is
          large.
        </P>
      </Step>
      <Step>
        <P>
          One pass through all batches is an epoch. Here an epoch makes{" "}
          {BATCHES} updates.
        </P>
        <P>
          After {EPOCHS} epochs, {EPOCHS * BATCHES} updates in all, the loss
          over the dataset has dropped from {fmt(TRAINING.losses[0], 2)} to{" "}
          {fmt(FINAL_LOSS, 3)}. In the code, <code>gradients</code> is the
          backward pass from the previous section, averaged over the batch.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Learned() {
  return (
    <ScrollStage tall visual={<LearnedVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="Result" />}>
          What did the autoencoder learn?
        </SectionHead>
        <P>
          This data lies close to a line, with some scatter around it. It has
          two coordinates, but most of its variation runs in one direction.
        </P>
      </Step>
      <Step>
        <P>
          The trained encoder gives each point one number. Points that are close
          together along the line get similar values of <Tex>z</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          The decoder sends each <Tex>z</Tex> back to a line in the plane.
          Training has turned and shifted that line until it runs through the
          data.
        </P>
      </Step>
      <Step>
        <P>
          Hover over a point, or use the slider, to follow one input through the
          model. What survives in <Tex>z</Tex> is the position along the line.
          What is lost is how far the point sits from the line, and that offset
          is the reconstruction error.
        </P>
      </Step>
      <Step>
        <KeyLine>
          The model found the direction that best describes the data, without
          being told that it existed.
        </KeyLine>
        <div className="mt-6">
          <P>
            For a linear autoencoder like this one, that direction is the same
            one principal component analysis finds. With nonlinear layers the
            idea extends to curved structure.
          </P>
        </div>
      </Step>
    </ScrollStage>
  );
}

export default function AutoencoderChapter() {
  return (
    <>
      <Pipeline />
      <Bridge>
        <p>
          Start with the encoder. In its simplest form it is one linear
          operation.
        </p>
      </Bridge>
      <Neuron />
      <Encoder />
      <Decoder />
      <Bridge>
        <p>
          To improve the weights, we first need a number that says how wrong a
          reconstruction is.
        </p>
      </Bridge>
      <Loss />
      <Backprop />
      <Bridge>
        <p>
          So far the model has seen one input. A useful representation has to
          work for many.
        </p>
      </Bridge>
      <Batches />
      <Learned />
    </>
  );
}
