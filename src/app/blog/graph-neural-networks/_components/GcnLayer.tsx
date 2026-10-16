import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { CORA, LAYER, list, tex } from "./model";
import LayerVisual from "./visuals/LayerVisual";
import ModuleVisual from "./visuals/ModuleVisual";

const W = `\\begin{bmatrix} ${LAYER.W.map((r) => r.map((v) => tex(v, 1)).join(" & ")).join(" \\\\ ")} \\end{bmatrix}`;

function Layer() {
  return (
    <ScrollStage tall visual={<LayerVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} />}>
          Aggregate, transform, bend.
        </SectionHead>
        <P>
          Averaging has no parameters, so there is nothing to learn. A graph
          convolutional network, or GCN, adds the two ingredients of an
          ordinary neural network layer: a weight matrix and a nonlinearity.
          It was introduced by Kipf and Welling in 2017 and is still the usual
          starting point.
        </P>
        <P>
          Start again from the raw features. The grey arrows mark the two unit
          vectors along the axes, so we can see what happens to the plane
          itself.
        </P>
      </Step>
      <Step>
        <P>
          First, aggregate. A GCN uses a slightly different average. Instead
          of dividing by the degree of the receiving node, it divides each
          message by the square root of both degrees.
        </P>
        <Tex display>
          {"\\hat{A} = \\tilde{D}^{-1/2}\\, \\tilde{A}\\, \\tilde{D}^{-1/2}, \\qquad \\hat{A}_{vu} = \\frac{1}{\\sqrt{\\tilde{d}_v \\tilde{d}_u}}"}
        </Tex>
        <P>
          A node with many neighbors now sends weaker messages, because its
          features are shared with many nodes. The weights in a row no longer
          add up to exactly 1, but the result is close to the mean, and the
          matrix stays symmetric.
        </P>
        <P>
          Look at the grid: it does not move. Aggregation is not a function
          of the plane. Where a point goes depends on its neighbors, not on
          where it is.
        </P>
      </Step>
      <Step>
        <P>
          Then, transform. Every row is multiplied by the same weight matrix{" "}
          <Tex>W</Tex>, the same for every node.
        </P>
        <Tex display>{`W = ${W}`}</Tex>
        <P>
          This is a linear map of the whole plane. Grid lines stay straight,
          parallel and evenly spaced. The two grey arrows land on the rows of{" "}
          <Tex>W</Tex>, and every point moves along with the grid.
        </P>
        <P>
          Here <Tex>W</Tex> is 2 by 2 so we can draw it. In practice it also
          changes the width. On Cora the first layer maps {CORA.features}{" "}
          features to {CORA.hidden}.
        </P>
      </Step>
      <Step>
        <P>
          Finally, bend. ReLU replaces every negative coordinate with zero,
          which folds the plane onto the positive quadrant. Points left of the
          vertical axis land on it, points below the horizontal axis land on
          that, and the bottom-left quarter collapses onto the origin.
        </P>
        <P>
          The fold sorts the nodes. The blue points end up on or right next to
          the vertical axis, the rose points on or next to the horizontal one.
          Node 6 started at{" "}
          {list(LAYER.stages[0][6])} and ends at {list(LAYER.stages[3][6])}.
        </P>
      </Step>
      <Step>
        <P>Together, that is one GCN layer.</P>
        <Tex display>{"H^{(l+1)} = \\sigma\\big(\\hat{A}\\, H^{(l)}\\, W^{(l)}\\big)"}</Tex>
        <P>
          Papers often write the same layer for a single node. The sum runs
          over the node and its neighbors.
        </P>
        <Tex display>
          {"h_v^{(l+1)} = \\sigma\\Big(\\sum_{u \\in \\mathcal{N}(v) \\cup \\{v\\}} \\frac{1}{\\sqrt{\\tilde{d}_v \\tilde{d}_u}}\\, h_u^{(l)} W^{(l)}\\Big)"}
        </Tex>
        <P>
          The name comes from images. A convolution applies the same small
          filter at every pixel and its neighbors. A GCN applies the same{" "}
          <Tex>W</Tex> at every node and its neighbors. An image is a graph
          too: a grid where each pixel links to the pixels around it.
        </P>
        <KeyLine>
          Aggregation moves information between nodes. The weights and the
          nonlinearity transform each node on its own, with the same
          parameters everywhere.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

function Module() {
  return (
    <ScrollStage tall visual={<ModuleVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} sub="In PyTorch" />}>
          The same layer in PyTorch.
        </SectionHead>
        <P>
          The layer first builds <Tex>{"\\hat{A}"}</Tex>.{" "}
          <code>d[:, None] * d[None, :]</code> is an <code>(n, n)</code>{" "}
          matrix whose entry <Tex>{"(v, u)"}</Tex> is{" "}
          <Tex>{"\\tilde{d}_v \\tilde{d}_u"}</Tex>, so one division normalizes
          every entry at once.
        </P>
      </Step>
      <Step>
        <P>
          <code>nn.Linear</code> without a bias is the multiplication by{" "}
          <Tex>W</Tex>. It works on every row at once and turns shape{" "}
          <code>(n, d)</code> into <code>(n, d′)</code>.
        </P>
        <P>
          Matrix products can be grouped either way:{" "}
          <Tex>{"\\hat{A}(HW) = (\\hat{A}H)W"}</Tex>. Applying{" "}
          <Tex>W</Tex> first is cheaper when it shrinks the vectors, as with
          the {CORA.features} to {CORA.hidden} layer on Cora.
        </P>
      </Step>
      <Step>
        <P>
          Multiplying by <code>A_norm</code> does the aggregation. The number
          of rows stays <Tex>n</Tex>, one vector per node, and the rows are
          in the same order as the input. The layer is equivariant.
        </P>
      </Step>
      <Step>
        <P>
          A typical GCN stacks two of these layers with a ReLU between them.
          The last layer outputs one score per class for every node, and
          training uses cross-entropy on the nodes whose labels are known.
        </P>
        <P>
          Libraries such as PyTorch Geometric provide this layer as{" "}
          <code>GCNConv</code>, working from <code>edge_index</code> instead
          of a dense matrix, with a bias added.
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function GcnLayerChapter() {
  return (
    <>
      <Bridge>
        <p>
          Averaging already separated the classes in our small graph. To
          learn what to keep and what to ignore, the layer needs weights.
        </p>
      </Bridge>
      <Layer />
      <Module />
    </>
  );
}
