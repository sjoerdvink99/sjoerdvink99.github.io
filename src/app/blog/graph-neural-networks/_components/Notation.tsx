import Reveal from "@/components/blog/Reveal";
import { Tag } from "@/components/blog/Tag";
import { Tex } from "@/components/blog/Tex";
import { P, SectionHead } from "@/components/blog/Typography";

const NOTATION = [
  { tex: "G = (V, E)", meaning: "a graph: nodes V and edges E", code: "Data(x=X, edge_index=edge_index)" },
  { tex: "A", meaning: "adjacency matrix, 1 where an edge exists", code: "to_dense_adj(edge_index)[0]" },
  { tex: "\\mathcal{N}(v)", meaning: "the neighbors of node v", code: "edge_index[1][edge_index[0] == v]" },
  { tex: "d_v", meaning: "degree, the number of neighbors", code: "degree(edge_index[0])" },
  { tex: "X \\in \\mathbb{R}^{n \\times d}", meaning: "node features, one row per node", code: "data.x" },
  { tex: "h_v^{(l)}", meaning: "the vector of node v after l layers", code: "H[v]" },
  { tex: "\\tilde{A} = A + I", meaning: "adjacency with self-loops", code: "add_self_loops(edge_index)" },
  { tex: "\\tilde{D}^{-1/2} \\tilde{A} \\tilde{D}^{-1/2}", meaning: "symmetric normalization used by GCN", code: "gcn_norm(edge_index)" },
  { tex: "\\bigoplus", meaning: "any order-independent aggregation", code: "scatter(m, dst, reduce=\"sum\")" },
  { tex: "\\psi,\\ \\phi", meaning: "message and update functions", code: "MessagePassing.message, .update" },
  { tex: "\\alpha_{vu}", meaning: "attention weight node v gives neighbor u", code: "return_attention_weights=True" },
  { tex: "[\\, a \\Vert b \\,]", meaning: "concatenation", code: "torch.cat([a, b], dim=-1)" },
  { tex: "z_G = \\operatorname{READOUT}(\\{ h_v \\})", meaning: "one vector for a whole graph", code: "global_mean_pool(H, batch)" },
  { tex: "\\sigma(z_u^{\\top} z_v)", meaning: "probability of a link between u and v", code: "torch.sigmoid((z[u] * z[v]).sum(-1))" },
  { tex: "f(PX, PAP^{\\top}) = P f(X, A)", meaning: "permutation equivariance", code: "renumber in, renumber out" },
];

const READING = [
  {
    authors: "Kipf and Welling",
    year: 2017,
    title: "Semi-Supervised Classification with Graph Convolutional Networks",
    href: "https://arxiv.org/abs/1609.02907",
    note: "The GCN layer of chapter 3, and the Cora experiment.",
  },
  {
    authors: "Gilmer et al.",
    year: 2017,
    title: "Neural Message Passing for Quantum Chemistry",
    href: "https://arxiv.org/abs/1704.01212",
    note: "The message, aggregate, update template.",
  },
  {
    authors: "Hamilton, Ying and Leskovec",
    year: 2017,
    title: "Inductive Representation Learning on Large Graphs",
    href: "https://arxiv.org/abs/1706.02216",
    note: "GraphSAGE: sampling neighbors to scale to huge graphs.",
  },
  {
    authors: "Veličković et al.",
    year: 2018,
    title: "Graph Attention Networks",
    href: "https://arxiv.org/abs/1710.10903",
    note: "The attention layer of chapter 5.",
  },
  {
    authors: "Li, Han and Wu",
    year: 2018,
    title: "Deeper Insights into Graph Convolutional Networks for Semi-Supervised Learning",
    href: "https://arxiv.org/abs/1801.07606",
    note: "GCN as smoothing, and why depth leads to over-smoothing.",
  },
  {
    authors: "Xu et al.",
    year: 2019,
    title: "How Powerful are Graph Neural Networks?",
    href: "https://arxiv.org/abs/1810.00826",
    note: "Sum versus mean versus max, GIN, and the link to the WL test.",
  },
  {
    authors: "Morris et al.",
    year: 2019,
    title: "Weisfeiler and Leman Go Neural: Higher-order Graph Neural Networks",
    href: "https://arxiv.org/abs/1810.02244",
    note: "The same bound, and networks that go beyond it.",
  },
  {
    authors: "Brody, Alon and Yahav",
    year: 2022,
    title: "How Attentive are Graph Attention Networks?",
    href: "https://arxiv.org/abs/2105.14491",
    note: "Why GAT ranks neighbors the same for every node, and GATv2.",
  },
  {
    authors: "Bronstein, Bruna, Cohen and Veličković",
    year: 2021,
    title: "Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges",
    href: "https://arxiv.org/abs/2104.13478",
    note: "Symmetry as the organizing idea behind CNNs, GNNs and Transformers.",
  },
  {
    authors: "Hamilton",
    year: 2020,
    title: "Graph Representation Learning",
    href: "https://www.cs.mcgill.ca/~wlh/grl_book/",
    note: "A short, free book covering all of the above in more depth.",
  },
];

const link =
  "rounded text-ir-ink underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink";

export function Notation() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-[22vh]">
      <Reveal>
        <SectionHead label={<Tag>Field guide</Tag>}>Reading GNN papers</SectionHead>
        <P>
          The symbols that appear most often in graph learning papers, with
          what they mean and where they live in PyTorch Geometric.
        </P>
      </Reveal>
      <Reveal delay={0.1}>
        <dl className="mt-10 border-t border-gray-200">
          {NOTATION.map((n) => (
            <div
              key={n.tex}
              className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-5 gap-y-1 border-b border-gray-100 py-3.5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,14rem)]"
            >
              <dt className="row-span-2 self-center sm:row-span-1">
                <Tex>{n.tex}</Tex>
              </dt>
              <dd className="text-pretty text-[0.95rem] leading-snug text-gray-600 sm:self-center">
                {n.meaning}
              </dd>
              <dd className="break-words font-mono text-[0.78rem] text-ir-ink sm:self-center">
                {n.code}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}

export function FurtherReading() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-[22vh]">
      <Reveal>
        <SectionHead label={<Tag>Further reading</Tag>}>Where to go next</SectionHead>
        <P>
          Every paper below builds on the ideas and notation from this
          essay, from the original layers to the wider view of why they work.
        </P>
      </Reveal>
      <Reveal delay={0.1}>
        <ol className="mt-10 space-y-6">
          {READING.map((r) => (
            <li key={r.href} className="border-l-2 border-gray-200 pl-4">
              <p className="text-sm text-ir-ink-muted">
                {r.authors}, {r.year}
              </p>
              <a href={r.href} className={`${link} text-[1.02rem]`}>
                {r.title}
              </a>
              <p className="mt-1 text-[0.95rem] leading-snug text-gray-600">{r.note}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
