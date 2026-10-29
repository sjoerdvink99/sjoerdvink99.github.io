/**
 * Interactive essays, hosted on their own site (sjoerdvink99/essays).
 * The blog lists them alongside the reflections and links out.
 */
const ESSAYS_URL = "https://sjoerdvink99.github.io/essays";

export interface Essay {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
}

export const essays: Essay[] = [
  {
    slug: "gpus",
    title: "Why AI Runs on GPUs",
    subtitle:
      "Matrix multiplication, memory, and the hardware behind language models, built one lane at a time",
    date: "2026-10-25",
  },
  {
    slug: "math-for-ai",
    title: "The Math Behind AI",
    subtitle:
      "Vectors, matrices, gradients, and probability, built one picture at a time",
    date: "2026-10-11",
  },
  {
    slug: "latent-spaces",
    title: "Steering the Latent Space",
    subtitle:
      "Directions, paths, and dials for controlling generative AI, built one vector at a time",
    date: "2026-09-27",
  },
  {
    slug: "transformers",
    title: "Inside the Transformer",
    subtitle: "Attention, heads, and blocks, built one operation at a time",
    date: "2026-09-13",
  },
  {
    slug: "autoencoders",
    title: "Inside the Autoencoder",
    subtitle:
      "Autoencoders, variational autoencoders, and sparse autoencoders, built one operation at a time",
    date: "2026-08-30",
  },
  {
    slug: "graph-neural-networks",
    title: "Inside the Graph Neural Network",
    subtitle:
      "Message passing, aggregation, and depth, built one neighbor at a time",
    date: "2026-08-16",
  },
];

export const essayUrl = (slug: string) => `${ESSAYS_URL}/${slug}/`;
