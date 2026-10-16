import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { CHAIN, GRAPH, tex } from "./model";
import ChainVisual from "./visuals/ChainVisual";
import BackpropVisual from "./visuals/BackpropVisual";

function Chain() {
  return (
    <ScrollStage tall visual={<ChainVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={5} />}>
          Rates multiply.
        </SectionHead>
        <P>
          A neural network is a chain of functions: each layer feeds the
          next. Take a short chain, <Tex>{"u = x^2"}</Tex> followed by{" "}
          <Tex>{"y = 3u + 1"}</Tex>.
        </P>
        <P>
          At <Tex>{`x = ${tex(CHAIN.x, 1)}`}</Tex> we get{" "}
          <Tex>{`u = ${tex(CHAIN.u)}`}</Tex> and{" "}
          <Tex>{`y = ${tex(CHAIN.y)}`}</Tex>. How strongly does{" "}
          <Tex>y</Tex> react when <Tex>x</Tex> changes?
        </P>
      </Step>
      <Step>
        <P>
          Nudge <Tex>x</Tex> by a small amount. Near{" "}
          <Tex>{`x = ${tex(CHAIN.x, 1)}`}</Tex>, the square changes about{" "}
          <Tex>{`2x = ${tex(CHAIN.du, 0)}`}</Tex> times as fast as{" "}
          <Tex>x</Tex>, so the nudge is stretched {tex(CHAIN.du, 0)} times on
          its way to <Tex>u</Tex>.
        </P>
        <P>
          Then <Tex>{"y = 3u + 1"}</Tex> stretches it {tex(CHAIN.dy, 0)} times
          more. Every function in the chain stretches the nudge by its own
          derivative.
        </P>
      </Step>
      <Step>
        <P>
          So <Tex>y</Tex> moves about {tex(CHAIN.du, 0)} ×{" "}
          {tex(CHAIN.dy, 0)} = {tex(CHAIN.total, 0)} times as much as{" "}
          <Tex>x</Tex>. That is the chain rule: the rate of a chain is the
          product of the rates of its links.
        </P>
        <Tex display>
          {"\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}"}
        </Tex>
        <P>
          The notation makes it look as though the <Tex>du</Tex>&apos;s
          cancel like in a fraction. They are not really fractions, but it is
          a good way to remember the rule.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Backprop() {
  return (
    <ScrollStage tall visual={<BackpropVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={5} sub="Backpropagation" />}>
          Backpropagation runs the chain rule backwards.
        </SectionHead>
        <P>
          Here is one neuron with a sigmoid, scored by a squared error
          against a target <Tex>y</Tex>, drawn as a computation graph. Each
          circle is one simple operation.
        </P>
        <P>
          The forward pass computes left to right. The values are written in
          blue above the edges, ending in a loss of {tex(GRAPH.loss, 3)}.
        </P>
      </Step>
      <Step>
        <P>
          Now ask how the loss depends on every value, starting from the end.
          The last operation is a square, whose derivative is simple.
        </P>
        <Tex display>
          {`\\frac{\\partial L}{\\partial a} = 2(a - y) = ${tex(GRAPH.dA)}`}
        </Tex>
        <P>
          It is negative: raising <Tex>a</Tex> would lower the loss.
        </P>
      </Step>
      <Step>
        <P>
          Next comes the sigmoid. Its local derivative is{" "}
          <Tex>{`\\sigma'(z) = \\sigma(z)(1 - \\sigma(z)) = ${tex(GRAPH.local)}`}</Tex>.
          By the chain rule, multiply it with what arrived from the right.
        </P>
        <Tex display>
          {`\\frac{\\partial L}{\\partial z} = \\frac{\\partial L}{\\partial a}\\,\\sigma'(z) = ${tex(GRAPH.dZ)}`}
        </Tex>
      </Step>
      <Step>
        <P>
          An addition passes the gradient on unchanged to both of its inputs,
          because nudging either input nudges the sum by the same amount. So{" "}
          <Tex>{`\\partial L / \\partial b = ${tex(GRAPH.dZ)}`}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          For a multiplication <Tex>{"p = wx"}</Tex>, the local derivative
          with respect to each input is the other input. So the gradient for{" "}
          <Tex>w</Tex> is scaled by <Tex>x</Tex>, and the gradient for{" "}
          <Tex>x</Tex> by <Tex>w</Tex>.
        </P>
        <Tex display>
          {`\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial p}\\, x = ${tex(GRAPH.dW)}`}
        </Tex>
        <KeyLine>
          Each operation only needs its own local derivative. Multiply them
          together on the way back.
        </KeyLine>
      </Step>
      <Step>
        <P>
          That is backpropagation. During the forward pass, autograd records
          the graph. <code>loss.backward()</code> then walks it in reverse and
          fills in the gradient of every weight. One backward pass costs only
          a small multiple of a forward pass, typically about two, however
          many weights there are.
        </P>
        <P>
          Deep networks multiply many local derivatives together, and that
          can go wrong. The sigmoid&apos;s derivative is never more than
          0.25, so a long chain of sigmoids drives gradients towards zero.
          This vanishing gradient problem is one reason modern networks use
          ReLU and residual connections.
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function ChainRuleChapter() {
  return (
    <>
      <Chain />
      <Backprop />
    </>
  );
}
