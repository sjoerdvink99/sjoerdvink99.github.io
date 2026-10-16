import Link from "next/link";
import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import Reveal from "@/components/blog/Reveal";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { ATTENTION, CLASS, fmt, list, texList } from "./model";
import AttentionVisual from "./visuals/AttentionVisual";

const { v, nodes, a, alpha, mean, out } = ATTENTION;
const others = nodes.filter((u) => u !== v);
const stranger = others.find((u) => CLASS[u] !== CLASS[v])!;
const weightOf = (u: number) => fmt(alpha[nodes.indexOf(u)]);
const favorite = nodes[alpha.indexOf(Math.max(...alpha))];

function Attend() {
  return (
    <ScrollStage tall visual={<AttentionVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={5} />}>
          Not every neighbor deserves the same vote.
        </SectionHead>
        <P>
          Node {v} sits on the bridge between the two groups. Its neighbors
          are {others.join(", ")}, and node {stranger} belongs to the other
          class.
        </P>
        <P>
          The mean, and the GCN, give every neighbor a weight that depends
          only on the graph. With itself included, node {v} takes a quarter
          from each, and its new vector {list(mean)} is pulled toward node{" "}
          {stranger}.
        </P>
      </Step>
      <Step>
        <P>
          A graph attention network, or GAT, lets the model choose the
          weights. For every neighbor <Tex>u</Tex> it computes a score from
          the two vectors involved.
        </P>
        <Tex display>
          {"e_{vu} = \\operatorname{LeakyReLU}\\big(a^{\\top} [\\, W h_v \\,\\Vert\\, W h_u \\,]\\big)"}
        </Tex>
        <P>
          <Tex>{"\\Vert"}</Tex> means concatenation: the two vectors are
          placed end to end. <Tex>a</Tex> is a learned vector that turns the
          pair into one number. Here <Tex>W</Tex> is the identity and{" "}
          <Tex>{`a = ${texList(a, 1)}`}</Tex>, picked by hand. Training would
          learn both.
        </P>
      </Step>
      <Step>
        <P>
          Softmax over the neighbors turns the scores into weights that are
          positive and sum to 1. Node {favorite} gets {weightOf(favorite)},
          node {stranger} only {weightOf(stranger)}. The edge widths show the
          weights.
        </P>
        <Tex display>
          {"\\alpha_{vu} = \\frac{\\exp(e_{vu})}{\\sum_{w \\in \\mathcal{N}(v) \\cup \\{v\\}} \\exp(e_{vw})}"}
        </Tex>
        <P>
          One detail matters when you read later papers. Split{" "}
          <Tex>a</Tex> into <Tex>{"a_1"}</Tex>, which multiplies{" "}
          <Tex>{"W h_v"}</Tex>, and <Tex>{"a_2"}</Tex>, which multiplies{" "}
          <Tex>{"W h_u"}</Tex>. LeakyReLU and softmax never change the order
          of their inputs, so neighbors are ranked by{" "}
          <Tex>{"a_2^{\\top} W h_u"}</Tex> alone: a neighbor that ranks high for
          one node ranks high for every node. GATv2 applies <Tex>a</Tex> after
          the nonlinearity, so the ranking can depend on who is asking.
        </P>
      </Step>
      <Step>
        <P>
          The new vector is the weighted sum of the neighbors. It moves from
          the mean to {list(out)}, deep among its own class.
        </P>
        <Tex display>{"h_v' = \\sum_{u \\in \\mathcal{N}(v) \\cup \\{v\\}} \\alpha_{vu}\\, W h_u"}</Tex>
        <P>
          Because the weights are positive and sum to 1, this is a convex
          combination, and the result always lies inside the shaded region,
          the convex hull of the neighbors. The mean always lands on the plain
          average of the points. Attention can choose any point in the hull,
          but never one outside it.
        </P>
        <KeyLine>
          Attention picks a point inside the hull of the neighbors. The mean
          always picks their average.
        </KeyLine>
      </Step>
      <Step>
        <P>
          If this looks familiar, it should. A{" "}
          <Link href="/blog/transformers/" className="underline underline-offset-4 hover:text-ir-ink">
            Transformer
          </Link>{" "}
          does the same with queries and keys instead of concatenation, and
          lets every token attend to every other token. That is attention on
          a complete graph, the dashed edges.
        </P>
        <P>
          Set the scores of non-neighbors to <Tex>{"-\\infty"}</Tex> before
          the softmax, and Transformer attention only flows along the edges of
          the graph, as in GAT. The borrowing goes both ways: GAT usually runs
          several attention heads side by side and concatenates their outputs,
          just like a Transformer.
        </P>
      </Step>
    </ScrollStage>
  );
}

const TEMPLATE = [
  {
    name: "GCN",
    message: "h_u W / \\sqrt{\\tilde{d}_v \\tilde{d}_u}",
    aggregate: "\\text{sum, with self-loop}",
    update: "\\sigma(m_v)",
  },
  {
    name: "GraphSAGE",
    message: "h_u",
    aggregate: "\\text{mean}",
    update: "\\sigma\\big([h_v \\Vert m_v]\\, W\\big)",
  },
  {
    name: "GAT",
    message: "\\alpha_{vu}\\, h_u W",
    aggregate: "\\text{sum, with self-loop}",
    update: "\\sigma(m_v)",
  },
  {
    name: "GIN",
    message: "h_u",
    aggregate: "\\text{sum}",
    update: "\\operatorname{MLP}((1 + \\epsilon) h_v + m_v)",
  },
];

const PARTS = ["message", "aggregate", "update"] as const;

function Template() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-[22vh]">
      <Reveal>
        <SectionHead label={<ChapterLabel n={5} sub="One template" />}>
          Message, aggregate, update.
        </SectionHead>
        <P>
          Most graph neural networks in the literature fit one template. Each
          neighbor sends a message <Tex>{"\\psi"}</Tex>, the messages are
          combined by an order-independent aggregation{" "}
          <Tex>{"\\bigoplus"}</Tex>, and an update <Tex>{"\\phi"}</Tex>{" "}
          produces the new vector. Edge features <Tex>{"e_{vu}"}</Tex>, such
          as bond types in a molecule, enter through the message.
        </P>
        <Tex display>
          {"m_v = \\bigoplus_{u \\in \\mathcal{N}(v)} \\psi\\big(h_v, h_u, e_{vu}\\big), \\qquad h_v' = \\phi\\big(h_v, m_v\\big)"}
        </Tex>
        <P>
          When you meet a new architecture, look for these three choices. The
          models from this essay, and two others you will see often:
        </P>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="mt-8 border-t border-gray-200">
          <div className="hidden grid-cols-[6.5rem_repeat(3,minmax(0,1fr))] gap-x-4 border-b border-gray-200 py-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ir-ink-muted sm:grid">
            <span>Model</span>
            <span>Message</span>
            <span>Aggregate</span>
            <span>Update</span>
          </div>
          {TEMPLATE.map((row) => (
            <div
              key={row.name}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-b border-gray-100 py-3.5 sm:grid-cols-[6.5rem_repeat(3,minmax(0,1fr))] sm:items-center"
            >
              <span className="row-span-3 text-[0.95rem] font-medium text-ir-ink sm:row-span-1">
                {row.name}
              </span>
              {PARTS.map((part) => (
                <span key={part} className="flex items-baseline gap-3">
                  <span className="w-20 shrink-0 text-xs text-ir-ink-muted sm:hidden">{part}</span>
                  <Tex>{row[part]}</Tex>
                </span>
              ))}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default function AttentionChapter() {
  return (
    <>
      <Bridge>
        <p>
          So far, every neighbor counted equally, or by a fixed rule based on
          degrees. What if a node could decide whom to listen to?
        </p>
      </Bridge>
      <Attend />
      <Template />
    </>
  );
}
