export interface Essay {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export const ESSAYS: Essay[] = [
  {
    slug: "transformers",
    title: "Inside the Transformer",
    subtitle:
      "Attention, heads, and blocks, built one operation at a time",
    date: "2026-10-01",
    description:
      "An interactive explanation of attention and the Transformer, from a single dot product to a small model in PyTorch.",
  },
  {
    slug: "autoencoders",
    title: "Inside the Autoencoder",
    subtitle:
      "Autoencoders, variational autoencoders, and sparse autoencoders, built one operation at a time",
    date: "2026-09-29",
    description:
      "An interactive explanation of autoencoders, variational autoencoders, and sparse autoencoders, from a single weighted sum to learned features.",
  },
];
