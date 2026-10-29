export interface Essay {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export const ESSAYS: Essay[] = [
  {
    slug: "gpus",
    title: "Why AI Runs on GPUs",
    subtitle:
      "Matrix multiplication, memory, and the hardware behind language models, built one lane at a time",
    date: "2026-10-25",
    description:
      "An interactive explanation of why GPUs power modern AI: the arithmetic of a language model, parallel lanes and tensor cores, the memory hierarchy and the roofline, tiling, low-precision formats, and why generating text is memory-bound, readable at three depths from intuition to expert.",
  },
  {
    slug: "math-for-ai",
    title: "The Math Behind AI",
    subtitle:
      "Vectors, matrices, gradients, and probability, built one picture at a time",
    date: "2026-10-11",
    description:
      "An interactive introduction to the math behind modern AI: vectors, dot products, matrices, derivatives, the chain rule, and probability, each shown as numbers, geometry, and code.",
  },
  {
    slug: "latent-spaces",
    title: "Steering the Latent Space",
    subtitle:
      "Directions, paths, and dials for controlling generative AI, built one vector at a time",
    date: "2026-09-27",
    description:
      "An interactive explanation of how to control generative models through their latent spaces: concept directions, interpolation on the Gaussian shell, disentangled edits, diffusion guidance, activation steering in language models, and learning directions from human preferences, each shown as geometry and as code.",
  },
  {
    slug: "transformers",
    title: "Inside the Transformer",
    subtitle:
      "Attention, heads, and blocks, built one operation at a time",
    date: "2026-09-13",
    description:
      "An interactive explanation of attention and the Transformer, from a single dot product to a small model in PyTorch.",
  },
  {
    slug: "autoencoders",
    title: "Inside the Autoencoder",
    subtitle:
      "Autoencoders, variational autoencoders, and sparse autoencoders, built one operation at a time",
    date: "2026-08-30",
    description:
      "An interactive explanation of autoencoders, variational autoencoders, and sparse autoencoders, from a single weighted sum to learned features.",
  },
  {
    slug: "graph-neural-networks",
    title: "Inside the Graph Neural Network",
    subtitle:
      "Message passing, aggregation, and depth, built one neighbor at a time",
    date: "2026-08-16",
    description:
      "An interactive explanation of graph neural networks, from a single averaged neighborhood to GCNs, graph attention, over-smoothing, and the limits of message passing, each shown as a graph, as geometry, and as code.",
  },
];
