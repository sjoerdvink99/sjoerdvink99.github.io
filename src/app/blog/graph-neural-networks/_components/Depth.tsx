import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { CLASS_GAP, CLASS_SPREAD, NEIGHBORS, RECEPTIVE, SMOOTH_MAX, fmt } from "./model";
import ReceptiveVisual from "./visuals/ReceptiveVisual";
import SmoothingVisual from "./visuals/SmoothingVisual";

const { v, dist, depth } = RECEPTIVE;
const far = dist.indexOf(depth);

function Receptive() {
  return (
    <ScrollStage tall visual={<ReceptiveVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={4} />}>
          Each layer reaches one hop further.
        </SectionHead>
        <P>
          One layer mixes each node with its direct neighbors. After one
          layer, node {v} holds information from nodes{" "}
          {NEIGHBORS[v].join(", ")} and from itself, and from nothing else.
        </P>
      </Step>
      <Step>
        <P>
          In the second layer, node {v} aggregates again. But node 3 already
          took in node 4 during the first layer, so information from node 4
          now reaches node {v} through node 3.
        </P>
        <P>
          After <Tex>k</Tex> layers, a node has heard from every node at most{" "}
          <Tex>k</Tex> edges away. This set is the node&apos;s receptive
          field, the same idea as in a convolutional network for images.
        </P>
      </Step>
      <Step>
        <P>
          The matrix view says the same. Entry <Tex>{"(v, u)"}</Tex> of{" "}
          <Tex>{"\\tilde{A}^k"}</Tex> counts the walks of length{" "}
          <Tex>k</Tex> from <Tex>v</Tex> to <Tex>u</Tex>, where a self-loop
          lets a walk pause. It is nonzero exactly when <Tex>u</Tex> is at
          most <Tex>k</Tex> hops away.
        </P>
        <P>
          Node {far} is {depth} hops from node {v}, so it takes {depth} layers
          before node {v} can depend on it at all. Now every entry in row{" "}
          {v} is filled.
        </P>
      </Step>
      <Step>
        <P>
          Change the number of layers and watch both views grow together.
        </P>
        <P>
          Most GCNs use two or three layers. That sounds like very few, but
          real graphs tend to be small worlds: friends of friends of friends
          already cover a large part of a social network.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Smoothing() {
  return (
    <ScrollStage tall visual={<SmoothingVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={4} sub="Over-smoothing" />}>
          Too many layers, and every node looks the same.
        </SectionHead>
        <P>
          So why not use many layers? Repeat the mean aggregation of chapter 2
          without any weights and watch what happens. The crosses mark the mean
          of each class.
        </P>
        <P>
          One round cuts the average distance of a point to its class mean
          from {fmt(CLASS_SPREAD[0])} to {fmt(CLASS_SPREAD[1])}, while the gap
          between the two class means stays at {fmt(CLASS_GAP[1])}. This is
          the useful part: each class pulls together.
        </P>
      </Step>
      <Step>
        <P>
          After four rounds the classes are tighter still. But the gap between
          them has started to shrink too, down to {fmt(CLASS_GAP[4])}. The
          bridge nodes 3 and 4 drift toward each other and drag their classes
          along.
        </P>
      </Step>
      <Step>
        <P>
          After {SMOOTH_MAX} rounds, every node sits at nearly the same point.
          This is over-smoothing, and it is not a coincidence of this graph.
        </P>
        <P>
          Each row of <Tex>{"\\tilde{D}^{-1}\\tilde{A}"}</Tex> sums to 1, so it
          describes a random walk that moves to a random neighbor or stays
          put. Run the walk long enough and where it ends no longer depends on
          where it started. Every node ends up with the same mixture of all
          features, weighted by degree.
        </P>
        <Tex display>
          {"\\big(\\tilde{D}^{-1}\\tilde{A}\\big)^k X \\;\\longrightarrow\\; \\mathbf{1}\\, \\pi^{\\top} X, \\qquad \\pi_u = \\frac{\\tilde{d}_u}{\\sum_w \\tilde{d}_w}"}
        </Tex>
      </Step>
      <Step>
        <P>
          Drag the slider. The differences between nodes never vanish
          completely, but after the first round they shrink by about 10
          percent every round, until they are smaller than the noise and the
          bias terms that real layers add.
        </P>
        <P>
          Learned weights and nonlinearities between the layers do not prevent
          this in general. Deeper models use residual connections, so each
          layer only adds a change,{" "}
          <Tex>{"h^{(l+1)} = h^{(l)} + f(h^{(l)})"}</Tex>, or combine the
          outputs of all layers, or normalize the vectors to keep them apart.
        </P>
        <KeyLine>
          Depth widens what a node can see, and blurs what it sees.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

export default function DepthChapter() {
  return (
    <>
      <Bridge>
        <p>
          One layer lets a node hear from its neighbors. Stacking layers lets
          it hear from their neighbors too.
        </p>
      </Bridge>
      <Receptive />
      <Smoothing />
    </>
  );
}
