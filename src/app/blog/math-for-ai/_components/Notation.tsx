import Reveal from "@/components/blog/Reveal";
import { Tag } from "@/components/blog/Tag";
import { Tex } from "@/components/blog/Tex";
import { P, SectionHead } from "@/components/blog/Typography";

const NOTATION = [
  { tex: "x \\in \\mathbb{R}^d", meaning: "a vector of d real numbers", code: "x.shape == (d,)" },
  { tex: "W \\in \\mathbb{R}^{m \\times n}", meaning: "a matrix with m rows and n columns", code: "W.shape == (m, n)" },
  { tex: "x_i,\\ W_{ij}", meaning: "a single entry", code: "x[i], W[i, j]" },
  { tex: "x^{\\top} y,\\ \\langle x, y \\rangle", meaning: "dot product", code: "x @ y" },
  { tex: "\\lVert x \\rVert", meaning: "length, or norm", code: "np.linalg.norm(x)" },
  { tex: "W^{\\top}", meaning: "transpose: rows become columns", code: "W.T" },
  { tex: "Wx", meaning: "matrix times vector", code: "W @ x" },
  { tex: "x \\odot y", meaning: "entry-by-entry product", code: "x * y" },
  { tex: "\\frac{\\partial L}{\\partial w}", meaning: "how L changes when only w changes", code: "w.grad" },
  { tex: "\\nabla_{\\theta} L", meaning: "gradient of L for all weights θ", code: "loss.backward()" },
  { tex: "\\theta \\leftarrow \\theta - \\eta \\nabla_{\\theta} L", meaning: "one step of gradient descent", code: "optimizer.step()" },
  { tex: "\\mathbb{E}[x]", meaning: "expected value, the average", code: "x.mean()" },
  { tex: "\\sigma^2,\\ \\sigma", meaning: "variance and standard deviation", code: "np.var(x), np.std(x)" },
  { tex: "\\sigma(z)", meaning: "the sigmoid; σ means two things, context decides", code: "torch.sigmoid(z)" },
  { tex: "\\mathcal{N}(\\mu, \\sigma^2)", meaning: "normal distribution", code: "mu + sigma * torch.randn(n)" },
  { tex: "x \\sim p", meaning: "x is drawn at random from p", code: "x = p.sample()" },
  { tex: "p_{\\theta}(y \\mid x)", meaning: "probability of y given x, under weights θ", code: "softmax(model(x))[y]" },
  { tex: "-\\log p_{\\theta}(y \\mid x)", meaning: "cross-entropy loss for one example", code: "F.cross_entropy(logits, y)" },
];

export default function Notation() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-[22vh]">
      <Reveal>
        <SectionHead label={<Tag>Field guide</Tag>}>Reading the notation</SectionHead>
        <P>
          Papers pack these ideas into dense symbols. Here are the ones that
          appear most often, with what they mean and how they look in code.
        </P>
      </Reveal>
      <Reveal delay={0.1}>
        <dl className="mt-10 border-t border-gray-200">
          {NOTATION.map((n) => (
            <div
              key={n.tex}
              className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-x-5 gap-y-1 border-b border-gray-100 py-3.5 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_minmax(0,13rem)]"
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
