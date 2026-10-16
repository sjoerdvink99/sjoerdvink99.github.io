import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Tag } from "@/components/blog/Tag";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { TRAINING, tex } from "./model";
import TrainingVisual from "./visuals/TrainingVisual";

const { losses } = TRAINING;

export default function Training() {
  return (
    <ScrollStage tall visual={<TrainingVisual />}>
      <Step>
        <SectionHead label={<Tag>Putting it together</Tag>}>
          One training loop uses every chapter.
        </SectionHead>
        <P>
          Here is a complete classifier trained from scratch in NumPy. The
          inputs are {TRAINING.n} points in the plane, each belonging to one
          of three classes. <Tex>X</Tex> holds one point per row, and{" "}
          <Tex>W</Tex> has one column of weights per class.
        </P>
        <P>
          The forward pass is a single matrix product. Every point is dotted
          with every class&apos;s weight vector.
        </P>
      </Step>
      <Step>
        <P>
          Softmax turns each row of logits into probabilities over the three
          classes.
        </P>
      </Step>
      <Step>
        <P>
          The loss is the average cross-entropy: the negative log probability
          of the correct class. Before training, every class gets a third, so
          the loss starts at <Tex>{`\\ln 3 = ${tex(losses[0])}`}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          <Tex>Y</Tex> holds the correct classes as one-hot rows. At the
          logits, the gradient of the average loss is{" "}
          <Tex>{"(P - Y)/n"}</Tex>: prediction minus truth, averaged. The
          chain rule carries it back through the matrix product.
        </P>
        <Tex display>
          {"\\frac{\\partial L}{\\partial W} = \\frac{1}{n} X^{\\top} (P - Y)"}
        </Tex>
        <P>
          The transpose is there because of the shapes:{" "}
          <code>(2, n) @ (n, 3)</code> gives <code>(2, 3)</code>, the shape of{" "}
          <Tex>W</Tex>.
        </P>
        <KeyLine>
          When you are unsure about a gradient formula, check that the shapes
          match.
        </KeyLine>
      </Step>
      <Step>
        <P>
          Then take one step of gradient descent against each gradient, with
          learning rate <Tex>{`\\eta = ${TRAINING.lr}`}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          Repeat. After {TRAINING.steps} steps the loss has dropped from{" "}
          {tex(losses[0])} to {tex(losses[losses.length - 1])}.
        </P>
        <P>
          Large language models are trained with this same loop. The forward
          pass is a far bigger function, gradients come from autograd, the
          optimizer is Adam instead of plain descent, and the data is
          trillions of tokens. The math is the same.
        </P>
      </Step>
    </ScrollStage>
  );
}
