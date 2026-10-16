import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Tag } from "@/components/blog/Tag";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { CORA, EMBEDDING, fmt } from "./model";
import TasksVisual from "./visuals/TasksVisual";
import TrainVisual from "./visuals/TrainVisual";

const { same, across, sameScore, acrossScore } = EMBEDDING;
const number = (v: number) => v.toLocaleString("en-US");

function Tasks() {
  return (
    <ScrollStage tall visual={<TasksVisual />}>
      <Step>
        <SectionHead label={<Tag>Putting it together</Tag>}>
          One set of node vectors, three kinds of tasks.
        </SectionHead>
        <P>
          After the GCN layer of chapter 3, every node has a vector{" "}
          <Tex>{"z_v"}</Tex>, a row of the matrix <Tex>Z</Tex>. These are
          the node embeddings. Each kind of task reads them in its own way.
        </P>
        <P>
          Node classification puts a classifier on every row. Here the dashed
          line is enough. Training uses cross-entropy on the nodes whose
          labels are known, but message passing carries what they teach to
          their unlabeled neighbors.
        </P>
      </Step>
      <Step>
        <P>
          Link prediction asks whether two nodes should be connected, for
          recommending friends or predicting which drugs interact. The usual
          score is the dot product of the two embeddings.
        </P>
        <Tex display>{"p(u \\sim v) = \\sigma\\big(z_u^{\\top} z_v\\big)"}</Tex>
        <P>
          The geometry of chapter 3 pays off. Blue vectors lie along one axis
          and rose vectors along the other, so they are orthogonal. Nodes{" "}
          {same.join(" and ")} score {fmt(sameScore)}, nodes{" "}
          {across.join(" and ")} score {fmt(acrossScore)}. The sigmoid turns
          these into {fmt(1 / (1 + Math.exp(-sameScore)))} and{" "}
          {fmt(1 / (1 + Math.exp(-acrossScore)))}, and the second is a coin
          flip. In practice the
          last layer has no ReLU, so scores can go negative, and training
          pushes random pairs that are not edges toward 0.
        </P>
      </Step>
      <Step>
        <P>
          Graph classification gives one answer for a whole graph, such as
          whether a molecule is toxic. A readout pools all node vectors into
          one, here the mean, shown as a star.
        </P>
        <Tex display>{"z_G = \\frac{1}{n} \\sum_{v} z_v"}</Tex>
        <P>
          The readout must not depend on the numbering either, so it uses the
          same order-independent operations as aggregation: sum, mean or max.
          A classifier on <Tex>{"z_G"}</Tex> makes the prediction.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Train() {
  return (
    <ScrollStage tall visual={<TrainVisual />}>
      <Step>
        <SectionHead label={<Tag>Putting it together</Tag>}>
          A complete GCN, trained on Cora.
        </SectionHead>
        <P>
          Cora is the citation graph from chapter 1: {number(CORA.nodes)} machine
          learning papers. Each is described by {number(CORA.features)}{" "}
          binary features that mark which words it contains. Citations are the
          edges, and the task is to predict each paper&apos;s topic, one of{" "}
          {CORA.classes}.
        </P>
        <P>
          PyTorch Geometric loads it as a single graph with{" "}
          <code>data.x</code>, <code>data.edge_index</code>,{" "}
          <code>data.y</code>, and masks that say which nodes are used for
          training and testing.
        </P>
      </Step>
      <Step>
        <P>
          The model is the two-layer GCN from chapter 3.{" "}
          <code>GCNConv</code> does the normalization, the multiplication by{" "}
          <Tex>W</Tex> and the aggregation, working directly on the edge list,
          and adds a bias.
        </P>
      </Step>
      <Step>
        <P>
          Only 140 nodes, 20 per class, have labels for training. The loss
          looks at those nodes alone. The forward pass still runs over the
          whole graph, so every unlabeled node takes part through the
          messages it sends and receives.
        </P>
        <P>
          This setting, a few labels and a large graph, is called
          semi-supervised node classification, and it is where GCNs first
          stood out.
        </P>
      </Step>
      <Step>
        <P>
          On the 1,000 test nodes this model reaches roughly 80 percent
          accuracy, close to the 81.5 percent reported by Kipf and Welling.
          An ordinary network that sees only the word features, and not the
          citations, stays below 60.
        </P>
        <KeyLine>
          The citations are worth about twenty points of accuracy, and two
          layers of averaging are enough to use them.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

export default function Together() {
  return (
    <>
      <Tasks />
      <Train />
    </>
  );
}
