import Reveal from "@/components/blog/Reveal";
import { Tag } from "@/components/blog/Tag";
import { Tex } from "@/components/blog/Tex";
import { P, SectionHead } from "@/components/blog/Typography";

const NOTATION = [
  { tex: "z \\in \\mathbb{R}^{d}", meaning: "a latent vector", code: "z = torch.randn(d)" },
  { tex: "g(z)", meaning: "the generator or decoder", code: "decoder(z)" },
  { tex: "z \\sim \\mathcal{N}(0, I)", meaning: "the standard Gaussian prior", code: "torch.randn(n, d)" },
  { tex: "\\lVert z \\rVert \\approx \\sqrt{d}", meaning: "Gaussian samples live on a thin shell", code: "z.norm() / d ** 0.5" },
  { tex: "v = \\mu_{+} - \\mu_{-}", meaning: "a concept direction from a difference of means", code: "Z[pos].mean(0) - Z[neg].mean(0)" },
  { tex: "z + \\alpha v", meaning: "an edit along a direction", code: "z + alpha * v" },
  { tex: "z \\cdot \\hat{v}", meaning: "projection, the concept score", code: "z @ (v / v.norm())" },
  { tex: "v - (v \\cdot n)\\, n", meaning: "remove the component along a unit vector n", code: "v - (v @ n) * n" },
  { tex: "(I - N N^{\\top})\\, v", meaning: "remove a whole subspace", code: "v - N @ (N.T @ v)" },
  { tex: "\\operatorname{slerp}(a, b, t)", meaning: "interpolation along the arc", code: "slerp(a, b, t)" },
  { tex: "\\nabla_x \\log p(x)", meaning: "the score, which way the data lies", code: "-eps / sigma" },
  { tex: "\\epsilon_\\theta(x_t, t, c)", meaning: "a diffusion model's noise prediction", code: "model(x_t, t, prompt)" },
  { tex: "\\epsilon_u + w(\\epsilon_c - \\epsilon_u)", meaning: "classifier-free guidance", code: "guidance_scale=w" },
  { tex: "h^{(l)}", meaning: "the residual stream after layer l", code: "cache[\"resid_post\", l]" },
  { tex: "h - (h \\cdot \\hat{r})\\, \\hat{r}", meaning: "directional ablation", code: "h - (h @ r_hat)[..., None] * r_hat" },
  { tex: "\\sigma\\big(r(A) - r(B)\\big)", meaning: "Bradley–Terry preference probability", code: "torch.sigmoid(r_a - r_b)" },
  { tex: "\\mathrm{KL}(\\pi \\Vert \\pi_{\\text{ref}})", meaning: "how far a tuned model has drifted", code: "(logp - logp_ref).mean()" },
];

const READING = [
  {
    authors: "Mikolov, Yih and Zweig",
    year: 2013,
    title: "Linguistic Regularities in Continuous Space Word Representations",
    href: "https://aclanthology.org/N13-1090/",
    note: "King minus man plus woman: concepts as directions, in words.",
  },
  {
    authors: "Radford, Metz and Chintala",
    year: 2016,
    title: "Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks",
    href: "https://arxiv.org/abs/1511.06434",
    note: "DCGAN, and the same vector arithmetic on faces.",
  },
  {
    authors: "White",
    year: 2016,
    title: "Sampling Generative Networks",
    href: "https://arxiv.org/abs/1609.04468",
    note: "Why lerp leaves the shell, and slerp as the fix.",
  },
  {
    authors: "Higgins et al.",
    year: 2017,
    title: "β-VAE: Learning Basic Visual Concepts with a Constrained Variational Framework",
    href: "https://openreview.net/forum?id=Sy2fzU9gl",
    note: "Training a latent space whose axes come apart.",
  },
  {
    authors: "Shen, Gu, Tang and Zhou",
    year: 2020,
    title: "Interpreting the Latent Space of GANs for Semantic Face Editing",
    href: "https://arxiv.org/abs/1907.10786",
    note: "InterFaceGAN: directions from linear boundaries, and the projection of chapter 4.",
  },
  {
    authors: "Härkönen, Hertzmann, Lehtinen and Paris",
    year: 2020,
    title: "GANSpace: Discovering Interpretable GAN Controls",
    href: "https://arxiv.org/abs/2004.02546",
    note: "Finding useful directions without labels, using PCA.",
  },
  {
    authors: "Dhariwal and Nichol",
    year: 2021,
    title: "Diffusion Models Beat GANs on Image Synthesis",
    href: "https://arxiv.org/abs/2105.05233",
    note: "Classifier guidance.",
  },
  {
    authors: "Ho and Salimans",
    year: 2022,
    title: "Classifier-Free Diffusion Guidance",
    href: "https://arxiv.org/abs/2207.12598",
    note: "The guidance formula of chapter 5.",
  },
  {
    authors: "Turner et al.",
    year: 2023,
    title: "Steering Language Models With Activation Engineering",
    href: "https://arxiv.org/abs/2308.10248",
    note: "Activation addition: steering by adding a difference of activations.",
  },
  {
    authors: "Zou et al.",
    year: 2023,
    title: "Representation Engineering: A Top-Down Approach to AI Transparency",
    href: "https://arxiv.org/abs/2310.01405",
    note: "Reading and controlling honesty, emotion and more through directions.",
  },
  {
    authors: "Park, Choe and Veitch",
    year: 2024,
    title: "The Linear Representation Hypothesis and the Geometry of Large Language Models",
    href: "https://arxiv.org/abs/2311.03658",
    note: "What it means, precisely, for a concept to be a direction.",
  },
  {
    authors: "Arditi et al.",
    year: 2024,
    title: "Refusal in Language Models Is Mediated by a Single Direction",
    href: "https://arxiv.org/abs/2406.11717",
    note: "The refusal direction and its ablation, from chapter 6.",
  },
  {
    authors: "Templeton et al.",
    year: 2024,
    title: "Scaling Monosemanticity",
    href: "https://transformer-circuits.pub/2024/scaling-monosemanticity/",
    note: "Millions of directions from a sparse autoencoder, and steering with them.",
  },
  {
    authors: "Christiano et al.",
    year: 2017,
    title: "Deep Reinforcement Learning from Human Preferences",
    href: "https://arxiv.org/abs/1706.03741",
    note: "Learning a reward from pairwise comparisons.",
  },
  {
    authors: "Ouyang et al.",
    year: 2022,
    title: "Training Language Models to Follow Instructions with Human Feedback",
    href: "https://arxiv.org/abs/2203.02155",
    note: "RLHF for language models, with the KL penalty of chapter 7.",
  },
  {
    authors: "Gao, Schulman and Hilton",
    year: 2023,
    title: "Scaling Laws for Reward Model Overoptimization",
    href: "https://arxiv.org/abs/2210.10760",
    note: "How far you can push along a learned reward before it breaks.",
  },
];

const link =
  "rounded text-ir-ink underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink";

export function Notation() {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-[22vh]">
      <Reveal>
        <SectionHead label={<Tag>Field guide</Tag>}>Reading papers on latent control</SectionHead>
        <P>
          The symbols that appear most often in papers on editing, guiding
          and steering generative models, with what they mean and how they
          look in PyTorch.
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
          Roughly in the order of the chapters, from word vectors and face
          editing to guidance, steering and learning from preferences.
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
