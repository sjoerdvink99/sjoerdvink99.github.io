import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { BOWL, SLOPE, tex } from "./model";
import SlopeVisual from "./visuals/SlopeVisual";
import GradientVisual from "./visuals/GradientVisual";

const { f, df, x0, secant } = SLOPE;
const walk = (xs: number[]) => xs.map((x) => tex(x)).join(",\\ ");
const g = BOWL.grad(BOWL.start);

function Slope() {
  return (
    <ScrollStage tall visual={<SlopeVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={4} />}>
          A derivative is a slope.
        </SectionHead>
        <P>
          Training means turning a model&apos;s weights until a loss, a number
          that measures its mistakes, is as small as possible. Start with a
          single weight <Tex>x</Tex> and a loss <Tex>{"f(x)"}</Tex>.
        </P>
        <P>
          We are at <Tex>{`x = ${tex(x0, 1)}`}</Tex>, where the loss is{" "}
          {tex(f(x0))}. Should <Tex>x</Tex> go up or down? From the picture it
          is obvious. A computer has no picture. It can only evaluate{" "}
          <Tex>f</Tex> at points.
        </P>
      </Step>
      <Step>
        <P>
          So it tries a nearby point. Move <Tex>x</Tex> by{" "}
          <Tex>{`h = ${tex(SLOPE.h[0], 1)}`}</Tex> and compare the two values
          of <Tex>f</Tex>. Rise over run gives the slope of the line through
          both points.
        </P>
        <Tex display>
          {`\\frac{f(x + h) - f(x)}{h} = ${tex(secant(SLOPE.h[0]))}`}
        </Tex>
      </Step>
      <Step>
        <P>
          A smaller step, <Tex>{`h = ${tex(SLOPE.h[1], 1)}`}</Tex>, gives a
          slope of {tex(secant(SLOPE.h[1]))}. The line turns and hugs the
          curve more closely around <Tex>x</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          Let <Tex>h</Tex> shrink towards zero. The line ends up touching the
          curve at a single point. This is the tangent, and its slope is the
          derivative.
        </P>
        <Tex display>
          {`f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h} = ${tex(df(x0))}`}
        </Tex>
        <P>
          Nobody takes these limits by hand. A few rules, such as{" "}
          <Tex>{"x^n \\to n x^{n-1}"}</Tex>, <Tex>{"e^x \\to e^x"}</Tex> and{" "}
          <Tex>{"\\ln x \\to 1/x"}</Tex>, together with the chain rule from
          the next chapter, cover nearly everything in deep learning.
        </P>
      </Step>
      <Step>
        <P>
          A positive slope means the loss goes up to the right, so we step
          left, against the slope. This is gradient descent.
        </P>
        <Tex display>{"x \\leftarrow x - \\eta\\, f'(x)"}</Tex>
        <P>
          The step size <Tex>{"\\eta"}</Tex> is the learning rate. With{" "}
          <Tex>{"\\eta = 0.75"}</Tex>, each step here halves the distance to
          the minimum: <Tex>{walk(SLOPE.slow)}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          Make the learning rate too large, <Tex>{"\\eta = 3.3"}</Tex>, and
          every step overshoots to the other side and lands further out than
          it started: <Tex>{walk(SLOPE.fast)}</Tex>. The loss gets worse and
          worse.
        </P>
        <KeyLine>
          The derivative gives the direction. The learning rate decides how
          far to trust it.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

function Gradient() {
  return (
    <ScrollStage tall visual={<GradientVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={4} sub="Gradient" />}>
          The gradient points uphill.
        </SectionHead>
        <P>
          With two weights the loss becomes a landscape over the plane. Here
          it is drawn as a contour map: each ellipse joins points with the
          same loss, like height lines on a hiking map. The minimum sits in
          the middle.
        </P>
        <Tex display>{"L(w_1, w_2) = \\tfrac{1}{2} w_1^2 + 2 w_2^2"}</Tex>
      </Step>
      <Step>
        <P>
          Freeze <Tex>{"w_2"}</Tex> and move only along <Tex>{"w_1"}</Tex>.
          That is an ordinary one-dimensional slope, called the partial
          derivative <Tex>{"\\partial L / \\partial w_1"}</Tex>. Then do the
          same in the other direction.
        </P>
        <Tex display>
          {`\\frac{\\partial L}{\\partial w_1} = w_1 = ${tex(g[0], 1)} \\qquad \\frac{\\partial L}{\\partial w_2} = 4 w_2 = ${tex(g[1], 1)}`}
        </Tex>
        <P>
          The curly <Tex>{"\\partial"}</Tex> means: change one input and hold
          all the others still.
        </P>
      </Step>
      <Step>
        <P>
          Put the partial derivatives in a vector and you get the gradient,{" "}
          <Tex>{`\\nabla L = [${tex(g[0], 1)},\\ ${tex(g[1], 1)}]`}</Tex>. It
          points in the direction where the loss rises fastest, which is
          always at right angles to the contour line through the point.
        </P>
        <KeyLine>
          The gradient is the slope in many dimensions: one number per weight,
          pointing uphill.
        </KeyLine>
      </Step>
      <Step>
        <P>
          Gradient descent takes a small step against the gradient, computes
          a new gradient, and repeats. It is the same update as before, now
          with vectors.
        </P>
        <Tex display>{"w \\leftarrow w - \\eta\\, \\nabla L(w)"}</Tex>
        <P>
          With <Tex>{"\\eta = 0.2"}</Tex> the path curves down into the
          valley and settles at the minimum.
        </P>
      </Step>
      <Step>
        <P>
          With <Tex>{"\\eta = 0.45"}</Tex> the path zigzags. The valley is
          steep across <Tex>{"w_2"}</Tex> and shallow along{" "}
          <Tex>{"w_1"}</Tex>, so a step that suits one direction overshoots
          in the other.
        </P>
        <P>
          Real loss landscapes are full of valleys like this, and better
          optimizers reduce the zigzag. Momentum keeps a running average of
          past gradients, so the back-and-forth cancels out. Adam does the
          same and also gives each weight its own step size.
        </P>
      </Step>
      <Step>
        <P>
          In PyTorch you never write the gradient yourself.{" "}
          <code>loss.backward()</code> fills <code>w.grad</code> with{" "}
          <Tex>{"\\nabla L"}</Tex>, for millions of weights at once. It can do
          that because of the chain rule.
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function DerivativesChapter() {
  return (
    <>
      <Slope />
      <Bridge>
        <p>
          Real networks do not have one weight. They have millions or
          billions. Start with two.
        </p>
      </Bridge>
      <Gradient />
    </>
  );
}
