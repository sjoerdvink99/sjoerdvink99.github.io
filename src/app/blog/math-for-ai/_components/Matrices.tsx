import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { LINEAR, MATMUL, tex, type Matrix, type Vec } from "./model";
import TransformVisual from "./visuals/TransformVisual";
import MatmulVisual from "./visuals/MatmulVisual";
import FoldVisual from "./visuals/FoldVisual";

const matrix = (M: Matrix) =>
  `\\begin{bmatrix} ${M.map((r) => r.map((v) => tex(v, 0)).join(" & ")).join(" \\\\ ")} \\end{bmatrix}`;
const column = (v: Vec) => matrix(v.map((x) => [x]));

const { A, R, RA, x, Ax } = LINEAR;

function Transform() {
  return (
    <ScrollStage tall visual={<TransformVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} />}>
          A matrix moves space.
        </SectionHead>
        <P>
          A matrix is a grid of numbers. Multiplying it by a vector gives a
          new vector. Read row by row, each output entry is the dot product
          of one row with the input, exactly like a layer of neurons.
        </P>
        <Tex display>{`Ax = ${matrix(A)} ${column(x)} = ${column(Ax)}`}</Tex>
      </Step>
      <Step>
        <P>
          The same product can also be read column by column.{" "}
          <Tex>Ax</Tex> takes {x[0]} of the first column and {x[1]} of the
          second, and adds them.
        </P>
        <Tex display>
          {`Ax = ${x[0]} ${column([A[0][0], A[1][0]])} + ${x[1]} ${column([A[0][1], A[1][1]])}`}
        </Tex>
        <P>
          In the picture, <Tex>x</Tex> is {x[0]} step along{" "}
          <Tex>{"e_1 = [1, 0]"}</Tex> followed by {x[1]} steps along{" "}
          <Tex>{"e_2 = [0, 1]"}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          Now apply <Tex>A</Tex> to every point of the plane at once. The grid
          tilts and stretches, but its lines stay straight, parallel and
          evenly spaced, and the origin does not move. That is what linear
          means.
        </P>
        <KeyLine>
          The columns of a matrix are where <Tex>{"e_1"}</Tex> and{" "}
          <Tex>{"e_2"}</Tex> land.
        </KeyLine>
        <P>
          Every other point follows the same recipe as before: {x[0]} step
          along the new <Tex>{"e_1"}</Tex>, {x[1]} along the new{" "}
          <Tex>{"e_2"}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          The unit square becomes a parallelogram. Its area is the
          determinant, and every area in the plane is scaled by the same
          factor.
        </P>
        <Tex display>
          {`\\det A = ${tex(A[0][0], 0)} \\cdot ${tex(A[1][1], 0)} - (${tex(A[0][1], 0)}) \\cdot ${tex(A[1][0], 0)} = ${tex(LINEAR.det, 0)}`}
        </Tex>
        <P>
          A determinant of 0 means the plane is squashed onto a line or a
          point, and some information is lost for good. A negative
          determinant means the plane is flipped over.
        </P>
      </Step>
      <Step>
        <P>
          Follow <Tex>A</Tex> with a quarter turn <Tex>R</Tex>. The two steps
          together are a single matrix, the product <Tex>RA</Tex>.
        </P>
        <Tex display>{`RA = ${matrix(R)} ${matrix(A)} = ${matrix(RA)}`}</Tex>
        <P>
          Multiplying matrices composes transformations, and{" "}
          <Tex>{"(RA)x = R(Ax)"}</Tex>. The order matters: <Tex>AR</Tex>{" "}
          turns first and gives a different result.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Matmul() {
  return (
    <ScrollStage tall visual={<MatmulVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} sub="Multiplication" />}>
          Matrix multiplication is a grid of dot products.
        </SectionHead>
        <P>
          Matrices do not have to be square. A matrix with 2 rows and 3
          columns has shape <code>(2, 3)</code> and lives in{" "}
          <Tex>{"\\mathbb{R}^{2 \\times 3}"}</Tex>.
        </P>
        <P>
          Two matrices can be multiplied when the inner sizes match. Those
          sizes are summed over and disappear.
        </P>
        <Tex display>{"(m \\times n)\\,(n \\times p) \\to (m \\times p)"}</Tex>
      </Step>
      <Step>
        <P>
          Each entry of the result is a row of <Tex>A</Tex> dotted with a
          column of <Tex>B</Tex>. Entry <Tex>{"(i, j)"}</Tex> uses row{" "}
          <Tex>i</Tex> and column <Tex>j</Tex>.
        </P>
        <Tex display>{"C_{ij} = \\sum_k A_{ik} B_{kj}"}</Tex>
      </Step>
      <Step>
        <P>
          Every row meets every column. An <Tex>{"m \\times n"}</Tex> by{" "}
          <Tex>{"n \\times p"}</Tex> product is <Tex>{"m \\cdot p"}</Tex> dot
          products, each of length <Tex>n</Tex>.
        </P>
        <Tex display>{`${matrix(MATMUL.A)} ${matrix(MATMUL.B)} = ${matrix(MATMUL.C)}`}</Tex>
        <P>
          All of those dot products are independent of each other, so they
          can run in parallel. GPUs are built to do exactly that.
        </P>
      </Step>
      <Step>
        <P>
          This is how a layer runs on a batch. Each row of <Tex>X</Tex> is an
          input, each column of <Tex>W</Tex> is one neuron&apos;s weights, and
          one product scores every input against every neuron.
        </P>
        <Tex display>{"Y = XW + b"}</Tex>
        <P>
          Papers often write a single input as a column and use{" "}
          <Tex>Wx</Tex>, with one row of <Tex>W</Tex> per neuron, as in the
          previous chapter. Code puts inputs in rows and writes{" "}
          <code>X @ W</code>, with one column per neuron. It is the same
          computation with everything transposed, because{" "}
          <Tex>{"(Wx)^{\\top} = x^{\\top} W^{\\top}"}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          The transpose <Tex>{"A^{\\top}"}</Tex> swaps rows and columns:{" "}
          <Tex>{"(A^{\\top})_{ij} = A_{ji}"}</Tex>. PyTorch&apos;s{" "}
          <code>nn.Linear</code> stores its weight with shape{" "}
          <code>(out, in)</code>, so it computes{" "}
          <code>x @ W.T + b</code>.
        </P>
        <KeyLine>
          When shapes do not line up, a missing transpose is the first thing
          to check.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

function Fold() {
  return (
    <ScrollStage tall visual={<FoldVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} sub="Nonlinearity" />}>
          Depth needs a bend.
        </SectionHead>
        <P>
          Here is the plane again, with a circle drawn on it. We will push
          it through a tiny network with two layers and watch what happens to
          the shape.
        </P>
      </Step>
      <Step>
        <P>
          The first layer, <Tex>{"W_1 x + b_1"}</Tex>, turns and shrinks the
          plane, and the bias shifts it. The circle shrinks and moves, and the
          grid lines stay straight.
        </P>
      </Step>
      <Step>
        <P>
          Apply the second layer straight away and the grid is still
          straight. Two linear layers multiply into one:
        </P>
        <Tex display>
          {"W_2(W_1 x + b_1) + b_2 = (W_2 W_1)\\,x + (W_2 b_1 + b_2)"}
        </Tex>
        <P>
          A hundred linear layers in a row can do no more than a single one.
          Depth alone adds nothing.
        </P>
      </Step>
      <Step>
        <P>
          Put a ReLU between them. ReLU keeps positive numbers and replaces
          negative ones with zero, entry by entry.
        </P>
        <Tex display>{"\\operatorname{ReLU}(z) = \\max(0, z)"}</Tex>
        <P>
          Every point with a negative coordinate is pushed onto an axis. The
          plane folds, and everything outside the top-right quarter is
          pressed flat against its edges.
        </P>
      </Step>
      <Step>
        <P>
          The second layer then moves the folded sheet. The result is no
          longer one straight grid. It is made of flat pieces joined at
          creases, and each ReLU neuron adds a crease.
        </P>
        <Tex display>
          {"f(x) = W_2\\, \\operatorname{ReLU}(W_1 x + b_1) + b_2"}
        </Tex>
        <P>
          This two-layer network is an MLP. Every Transformer block contains
          one, with thousands of dimensions instead of two and often a
          smoother cousin of ReLU such as GELU.
          With enough creases it can bend space into almost any shape.
        </P>
        <KeyLine>
          Matrices move space. Nonlinearities bend it. Training chooses the
          matrices.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

export default function MatricesChapter() {
  return (
    <>
      <Transform />
      <Matmul />
      <Bridge>
        <p>
          Multiplying matrices only ever gives another matrix. Something else
          has to bend space.
        </p>
      </Bridge>
      <Fold />
    </>
  );
}
