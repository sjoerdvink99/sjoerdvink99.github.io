import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { A, A_PERMUTED, CORA, DEGREE, EDGES, N, NEIGHBORS, PERMUTATION, range } from "./model";
import GraphVisual from "./visuals/GraphVisual";
import AdjacencyVisual from "./visuals/AdjacencyVisual";
import PermutationVisual from "./visuals/PermutationVisual";

const changed = A.flat().filter((v, k) => v !== A_PERMUTED.flat()[k]).length;
const orderings = range(1, N).reduce((p, k) => p * k, 1);
const density = (CORA.edges / CORA.nodes ** 2) * 100;
const number = (v: number) => v.toLocaleString("en-US");

function Graph() {
  return (
    <ScrollStage tall visual={<GraphVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} />}>
          A graph is things, and the links between them.
        </SectionHead>
        <P>
          Molecules are atoms joined by bonds. A social network is people
          joined by friendships. Papers cite papers, proteins bind proteins,
          roads join crossings. All of these are graphs: a set of nodes, and a
          set of edges that connect pairs of nodes.
        </P>
        <P>
          This graph has {N} nodes, numbered 0 to {N - 1}, and {EDGES.length}{" "}
          edges. The edges have no direction: if 0 is linked to 1, then 1 is
          linked to 0.
        </P>
      </Step>
      <Step>
        <P>
          Every node also carries a vector of features. In a molecule they
          might describe the element of each atom. In a citation network, the
          words in each paper.
        </P>
        <P>
          Here every node has two features, so each node can be drawn as a
          point in the plane on the right. The number next to a point is its
          node.
        </P>
        <KeyLine>
          A graph holds two kinds of information: what each node is, and what
          it is connected to.
        </KeyLine>
      </Step>
      <Step>
        <P>
          Say the nodes belong to two classes, blue and rose, and the task is
          to predict the class of every node. From the features alone, that is
          hard.
        </P>
        <P>
          Node 1 is blue, but its point sits among the rose ones. Node 6 is
          rose, but sits next to the blue ones. No straight line in the plane
          puts all blue points on one side and all rose points on the other.
        </P>
      </Step>
      <Step>
        <P>
          The edges tell a different story. Node 1 is linked to nodes 0 and 3,
          and both are blue. Nine of the ten edges join two nodes of the same
          class. Only the bridge between 3 and 4 crosses over.
        </P>
        <P>
          Many real graphs work this way. Friends share interests, and papers
          cite papers on the same topic. The pattern is called homophily, and
          it is what the simplest graph neural networks rely on.
        </P>
        <KeyLine>
          A graph neural network decides about a node using its own features
          and the features of its neighbors.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

function Matrices() {
  return (
    <ScrollStage tall visual={<AdjacencyVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="As matrices" />}>
          Two matrices hold the whole graph.
        </SectionHead>
        <P>
          Stack the feature vectors as rows and you get the feature matrix{" "}
          <Tex>X</Tex>. Row <Tex>i</Tex> belongs to node <Tex>i</Tex>. With{" "}
          <Tex>n</Tex> nodes and <Tex>d</Tex> features its shape is{" "}
          <code>(n, d)</code>, here <code>(8, 2)</code>.
        </P>
        <Tex display>{"X \\in \\mathbb{R}^{n \\times d}"}</Tex>
      </Step>
      <Step>
        <P>
          The edges go into the adjacency matrix <Tex>A</Tex>, of shape{" "}
          <code>(n, n)</code>. Entry <Tex>{"A_{ij}"}</Tex> is 1 when nodes{" "}
          <Tex>i</Tex> and <Tex>j</Tex> share an edge, and 0 otherwise.
        </P>
        <P>
          Row 3 has ones in columns {NEIGHBORS[3].join(", ")}. Those are the
          neighbors of node 3, written <Tex>{"\\mathcal{N}(3)"}</Tex>.
        </P>
        <Tex display>{"\\mathcal{N}(v) = \\{\\, u : A_{vu} = 1 \\,\\}"}</Tex>
      </Step>
      <Step>
        <P>
          Edges have no direction, so <Tex>A</Tex> is symmetric: row 3 and
          column 3 hold the same entries, and <Tex>{"A = A^{\\top}"}</Tex>.
        </P>
        <P>
          Adding up a row counts the neighbors of that node. This is its
          degree <Tex>{"d_v"}</Tex>. Node 3 has degree {DEGREE[3]}, node 7 only{" "}
          {DEGREE[7]}.
        </P>
        <Tex display>{"d_v = \\sum_u A_{vu}"}</Tex>
      </Step>
      <Step>
        <P>
          Real graphs are sparse. The Cora citation graph, a standard
          benchmark, has {number(CORA.nodes)} papers. Its adjacency matrix
          would have {number(CORA.nodes ** 2)} entries, and only{" "}
          {number(CORA.edges)} of them are ones: {density.toFixed(2)}%.
        </P>
        <P>
          So libraries store only the edges. <code>edge_index</code> has shape{" "}
          <code>(2, E)</code>: a row of source nodes and a row of target
          nodes, with every undirected edge listed in both directions. It
          holds the same information as <Tex>A</Tex>.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Permutation() {
  return (
    <ScrollStage tall visual={<PermutationVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} sub="Order" />}>
          The numbering means nothing.
        </SectionHead>
        <P>
          Nothing in the graph says which node is number 0. The numbers are
          names we gave the nodes so we could write them into matrices. A
          model that gives different answers for different names has learned
          something that is not there.
        </P>
      </Step>
      <Step>
        <P>
          Renumber the nodes: node 3 becomes {PERMUTATION[3]}, node 0 becomes{" "}
          {PERMUTATION[0]}, and so on. The graph is the same, but the rows of{" "}
          <Tex>X</Tex> move, and the rows and columns of <Tex>A</Tex> move
          with them. The amber row and column belong to the ringed node.
        </P>
        <P>
          A permutation matrix <Tex>P</Tex> describes the renumbering. It has
          a single 1 in every row and column. Multiplying by <Tex>P</Tex> on
          the left reorders rows, and multiplying by <Tex>{"P^{\\top}"}</Tex>{" "}
          on the right reorders columns. That is why the rows of{" "}
          <Tex>A</Tex> move first, and then its columns.
        </P>
        <Tex display>{"X' = PX, \\qquad A' = PAP^{\\top}"}</Tex>
      </Step>
      <Step>
        <P>
          This rules out the obvious approach of flattening <Tex>A</Tex> into
          one long vector and feeding it to an ordinary network. After the
          renumbering, {changed} of its {N * N} entries are different, so the
          network would see a different input for the same graph.
        </P>
        <P>
          There are <Tex>{"n!"}</Tex> ways to number <Tex>n</Tex> nodes,{" "}
          {number(orderings)} for this small graph. An ordinary network would
          have to learn from examples that all of them mean the same thing,
          and the count explodes as graphs grow.
        </P>
      </Step>
      <Step>
        <P>
          So the requirement is built in. A layer that produces one vector per
          node must be permutation equivariant: renumber the input, and the
          output rows are renumbered in the same way, with nothing else
          changed.
        </P>
        <Tex display>{"f(PX,\\ PAP^{\\top}) = P\\,f(X, A)"}</Tex>
        <P>
          A model that produces one answer for the whole graph, such as
          whether a molecule is toxic, must be invariant: the answer does not
          change at all.
        </P>
        <KeyLine>
          Every layer in this essay is built to satisfy this rule.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}

export default function GraphsChapter() {
  return (
    <>
      <Graph />
      <Matrices />
      <Permutation />
    </>
  );
}
