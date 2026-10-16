import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { WL } from "./model";
import AggregatorVisual from "./visuals/AggregatorVisual";
import WLVisual from "./visuals/WLVisual";

const colors = (round: number) => new Set(WL.main[round]).size;

function Aggregators() {
  return (
    <ScrollStage tall visual={<AggregatorVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={6} />}>
          What a sum can see that a mean cannot.
        </SectionHead>
        <P>
          An aggregation receives a multiset: a collection in which order does
          not matter but the same vector may appear more than once. Ideally,
          different multisets give different results.
        </P>
        <P>
          Compare a node with neighbors <Tex>u</Tex> and <Tex>w</Tex> to a
          node with two copies of each. The mean lands on the same centroid.
          The element-wise maximum, which takes the largest value in every
          coordinate, lands on the same corner. Only the sum notices: it
          doubles.
        </P>
      </Step>
      <Step>
        <P>
          Now add a small vector <Tex>c</Tex>. It is below the maximum in
          every coordinate, so the maximum does not move. The mean does move,
          and so does the sum.
        </P>
        <P>
          The pattern is general. The maximum ignores how often a vector
          occurs, and can miss a vector entirely, like <Tex>c</Tex>. The
          mean sees the proportions of the neighbors but not how many there
          are. The sum keeps the count.
        </P>
        <KeyLine>
          The sum remembers how many neighbors there are. The mean and the
          maximum forget it.
        </KeyLine>
      </Step>
      <Step>
        <P>
          The graph isomorphism network, or GIN, builds on this. It sums the
          neighbors and passes the result through a small MLP instead of a
          single linear map.
        </P>
        <Tex display>
          {"h_v' = \\operatorname{MLP}\\Big((1 + \\epsilon)\\, h_v + \\sum_{u \\in \\mathcal{N}(v)} h_u\\Big)"}
        </Tex>
        <P>
          The factor <Tex>{"1 + \\epsilon"}</Tex> keeps a node&apos;s own
          vector from blending in with its neighbors. Xu and colleagues proved
          in 2019 that when node features come from a countable set, such as
          categories, a suitable transformation followed by a sum can tell
          apart any two different multisets. No mean or maximum can do that.
          With enough capacity, GIN is as powerful as message passing gets.
        </P>
        <P>
          That is about what a model can tell apart, not what it learns best.
          When the number of neighbors is mostly noise, a mean often works
          better in practice.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Refinement() {
  return (
    <ScrollStage tall visual={<WLVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={6} sub="The WL test" />}>
          Some graphs look the same to every message-passing network.
        </SectionHead>
        <P>
          How much can message passing tell apart at best? A graph algorithm
          from 1968 gives the answer. It is called color refinement, or the
          Weisfeiler-Leman test, WL for short.
        </P>
        <P>
          Every node starts with the same color, as if all features were
          equal. Only the structure of the graph is left.
        </P>
      </Step>
      <Step>
        <P>
          In each round, a node gets a new color determined by its own color
          and the multiset of its neighbors&apos; colors. Nodes with the same
          old color and the same neighbor colors get the same new color.
        </P>
        <P>
          After one round the colors simply count neighbors: {colors(1)}{" "}
          colors, one for each degree.
        </P>
      </Step>
      <Step>
        <P>
          In the second round, nodes with the same degree split up if their
          neighbors have different degrees. There are now {colors(2)} colors.
        </P>
        <P>
          Nodes 1 and 2 still share a color. They are mirror images: swap them
          and the graph does not change, so nothing could tell them apart.
        </P>
      </Step>
      <Step>
        <P>
          A third round changes nothing, so the colors are stable.
        </P>
        <P>
          Compare the code with a GNN layer. The new color depends on the
          node&apos;s own color and the multiset of its neighbors&apos;
          colors, exactly like aggregate and update. The hash is a perfect
          aggregation that never confuses two multisets.
        </P>
        <P>
          It follows that if WL, started from the node features, gives two
          nodes the same color, every message-passing GNN gives them the same
          vector, whatever its weights. Xu and colleagues and Morris and colleagues proved this
          independently in 2019.
        </P>
      </Step>
      <Step>
        <P>
          Here are two graphs that are clearly different. One is a single
          ring of six nodes. The other is two separate triangles. Every node
          in both has exactly two neighbors.
        </P>
      </Step>
      <Step>
        <P>
          Run the refinement and nothing ever splits. Every node sees two
          neighbors with its own color, in every round. The color histograms
          of the two graphs are identical, so any sum or mean over the nodes
          is too.
        </P>
        <P>
          No message-passing GNN can tell these graphs apart, however deep or
          wide, as long as the node features are equal. In particular, it
          cannot count triangles.
        </P>
        <P>
          Stronger models break the symmetry. Some add features that describe
          a node&apos;s position in the graph, others pass messages between
          pairs of nodes or count small subgraphs.
        </P>
        <KeyLine>
          Message passing sees a graph only through what each node can learn
          from its neighbors.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

export default function ExpressivityChapter() {
  return (
    <>
      <Bridge>
        <p>
          Every layer so far combines the neighbors with a sum, a mean, or a
          weighted mean. Does the choice matter?
        </p>
      </Bridge>
      <Aggregators />
      <Refinement />
    </>
  );
}
