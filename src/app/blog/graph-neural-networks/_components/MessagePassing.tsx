import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { AGGREGATE, MEANS, X, list, texList } from "./model";
import AggregateVisual from "./visuals/AggregateVisual";
import SumMatrixVisual from "./visuals/SumMatrixVisual";

const { v, nbrs, total, mean, self } = AGGREGATE;

function Aggregate() {
  return (
    <ScrollStage tall visual={<AggregateVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} />}>
          Every node listens to its neighbors.
        </SectionHead>
        <P>
          Take node {v}. Its own features say rose, but its neighbors,{" "}
          {nbrs.join(" and ")}, are both blue. The idea behind every graph
          neural network is to let each node collect the vectors of its
          neighbors and update its own vector with what it finds.
        </P>
        <P>
          The collecting step is called aggregation. It has one hard rule from
          the previous chapter: it may not depend on the order in which the
          neighbors are numbered.
        </P>
      </Step>
      <Step>
        <P>
          The simplest aggregation is a sum. Geometrically, the neighbor
          vectors are laid tip to tail, and the sum is the arrow from the start
          of the first to the end of the last.
        </P>
        <Tex display>
          {`\\sum_{u \\in \\mathcal{N}(${v})} x_u = ${texList(X[nbrs[0]], 1)} + ${texList(X[nbrs[1]], 1)} = ${texList(total, 1)}`}
        </Tex>
        <P>
          Addition does not care about order: <Tex>{"x_0 + x_3"}</Tex> equals{" "}
          <Tex>{"x_3 + x_0"}</Tex>. That is exactly the property we need.
        </P>
      </Step>
      <Step>
        <P>
          A sum grows with the number of neighbors. A node with fifty
          neighbors gets a vector about twenty-five times longer than a node
          with two, even if the neighbors look alike.
        </P>
        <P>
          Dividing by the count gives the mean. In the plane, the mean of two
          points is the midpoint between them. The mean of many points is
          their centroid, the center of mass they would balance on.
        </P>
        <Tex display>
          {`\\frac{1}{|\\mathcal{N}(${v})|} \\sum_{u \\in \\mathcal{N}(${v})} x_u = ${texList(mean, 1)}`}
        </Tex>
      </Step>
      <Step>
        <P>
          Averaging only the neighbors would throw away the node&apos;s own
          features. So the node counts itself as one of its neighbors. The
          mean is now the centroid of the shaded triangle.
        </P>
        <Tex display>
          {`h_${v} = \\tfrac{1}{3}\\left(x_${v} + x_${nbrs[0]} + x_${nbrs[1]}\\right) = ${texList(self)}`}
        </Tex>
        <P>
          Node {v} has moved from {list(X[v])} into
          the blue region. Its neighbors outvoted its own features.
        </P>
      </Step>
      <Step>
        <P>
          Now every node does the same, all at once, each using the old
          vectors of its neighbors. Every point moves to the centroid of its
          own neighborhood.
        </P>
        <P>
          Node 6 crosses over too, from {list(X[6])}{" "}
          to {list(MEANS[6])}. A straight line now
          separates the two classes, which no line could do before.
        </P>
        <KeyLine>
          Averaging over neighbors smooths the features along the edges. When
          neighbors tend to share a class, smoothing removes noise.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

function AsMatrix() {
  return (
    <ScrollStage tall visual={<SumMatrixVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} sub="As matrices" />}>
          One matrix product updates every node.
        </SectionHead>
        <P>
          Row <Tex>v</Tex> of <Tex>A</Tex> has a 1 for every neighbor of{" "}
          <Tex>v</Tex> and a 0 everywhere else. So row <Tex>v</Tex> of the
          product <Tex>AX</Tex> adds up exactly the feature vectors of the
          neighbors of <Tex>v</Tex>.
        </P>
        <Tex display>
          {"(AX)_v = \\sum_u A_{vu}\\, x_u = \\sum_{u \\in \\mathcal{N}(v)} x_u"}
        </Tex>
      </Step>
      <Step>
        <P>
          To let every node count itself, add the identity matrix. This puts a
          1 on the diagonal, a self-loop on every node. Papers write it with a
          tilde.
        </P>
        <Tex display>{"\\tilde{A} = A + I"}</Tex>
      </Step>
      <Step>
        <P>
          For the mean, divide every row by its number of ones. Collect those
          counts in a diagonal matrix <Tex>{"\\tilde{D}"}</Tex>, with{" "}
          <Tex>{"\\tilde{D}_{vv} = \\sum_u \\tilde{A}_{vu}"}</Tex>. Multiplying
          by its inverse divides each row by its count.
        </P>
        <Tex display>{"H = \\tilde{D}^{-1} \\tilde{A} X"}</Tex>
        <P>
          Row {v} of <Tex>H</Tex> is the centroid from before. Every other row
          is the centroid of that node&apos;s neighborhood.
        </P>
      </Step>
      <Step>
        <P>
          Graph libraries usually skip <Tex>{"\\tilde{A}"}</Tex> altogether. Each edge copies the
          vector of its source node, a message, to its target node, and each
          node reduces the messages it receives. The cost grows with the
          number of edges, not with <Tex>{"n^2"}</Tex>. This is why the whole
          family is called message passing.
        </P>
        <P>
          Equivariance now comes for free. Renumbering turns{" "}
          <Tex>{"\\tilde{A}X"}</Tex> into{" "}
          <Tex>{"(P\\tilde{A}P^{\\top})(PX)"}</Tex>, and because{" "}
          <Tex>{"P^{\\top}P = I"}</Tex> that is <Tex>{"P(\\tilde{A}X)"}</Tex>:
          the same rows in the new order.
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function MessagePassingChapter() {
  return (
    <>
      <Bridge>
        <p>
          How can a node use the features of its neighbors in a way that does
          not depend on how they are numbered?
        </p>
      </Bridge>
      <Aggregate />
      <AsMatrix />
    </>
  );
}
