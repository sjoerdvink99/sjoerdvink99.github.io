import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { EPS, LOGVAR, MU, SIGMA, VAR, fmt, reparam } from "./model";
import VaeEncoderVisual from "./visuals/VaeEncoderVisual";
import ReparamVisual from "./visuals/ReparamVisual";
import VaeLossVisual from "./visuals/VaeLossVisual";
import GenerationVisual from "./visuals/GenerationVisual";

const n = (v: number, digits = 2) => fmt(v, digits).replace("−", "-");
const vec = (v: readonly number[], digits = 2) =>
  `[${v.map((x) => n(x, digits)).join(",\\ ")}]`;

const SCALED = [SIGMA[0] * EPS[0], SIGMA[1] * EPS[1]];
const Z = reparam(MU, SIGMA, EPS);

function Encoder() {
  return (
    <ScrollStage tall visual={<VaeEncoderVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} />}>
          From a point to a region.
        </SectionHead>
        <P>
          Take a latent space with two dimensions and three inputs. We use two
          dimensions so that we can draw them. Real models often use many more.
        </P>
        <P>
          An ordinary autoencoder places each input at one point,{" "}
          <Tex>{"z^{(1)}, z^{(2)}, z^{(3)}"}</Tex>. Its decoder is trained on
          those points only. Nothing in training constrains what it produces for
          a <Tex>z</Tex> in between.
        </P>
      </Step>
      <Step>
        <P>
          A variational autoencoder encodes each input as a region instead.
          Every point in the region should decode to something close to the
          input. That pushes nearby codes to mean similar things.
        </P>
      </Step>
      <Step>
        <P>
          The encoder now ends in two outputs. For each latent dimension it
          predicts a mean and a log variance. With a two-dimensional latent,
          that is four numbers.
        </P>
        <Tex display>
          {
            "\\begin{aligned} \\mu &= [\\mu_1,\\ \\mu_2] \\\\ \\log \\sigma^2 &= [\\log \\sigma_1^2,\\ \\log \\sigma_2^2] \\end{aligned}"
          }
        </Tex>
      </Step>
      <Step>
        <P>
          These are not extra latent dimensions. They are the parameters of a
          Gaussian distribution over <Tex>z</Tex>, and <Tex>z</Tex> still has
          two dimensions. The mean <Tex>\mu</Tex> sets the center. The standard
          deviation <Tex>\sigma</Tex> sets the width along each axis.
        </P>
        <Tex display>
          {
            "q(z \\mid x) = \\N\\big(\\mu,\\ \\operatorname{diag}(\\sigma^2)\\big)"
          }
        </Tex>
        <P>
          A standard VAE assumes a diagonal covariance. The dimensions do not
          co-vary, which is why the region is an ellipse aligned with the axes.
        </P>
      </Step>
      <Step>
        <P>
          The encoder predicts <Tex>{"\\log \\sigma^2"}</Tex> rather than the
          variance itself. A variance must be positive, but a linear layer can
          output any number. The exponential of any number is positive, and the
          log scale keeps very small and very large variances numerically
          stable.
        </P>
        <Tex display>
          {`\\begin{aligned} \\log \\sigma^2 &= ${vec(LOGVAR)} \\\\ \\sigma^2 &= \\exp(\\log \\sigma^2) \\\\ &= ${vec(VAR)} \\\\ \\sigma &= \\exp\\big(\\tfrac{1}{2}\\log \\sigma^2\\big) \\\\ &= ${vec(SIGMA)} \\end{aligned}`}
        </Tex>
        <P>
          The two are easy to confuse. <Tex>{"\\sigma^2"}</Tex> is the variance
          and <Tex>\sigma</Tex> is the standard deviation.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Reparam() {
  return (
    <ScrollStage tall visual={<ReparamVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} sub="Sampling" />}>
          The reparameterization trick.
        </SectionHead>
        <P>
          To decode, we need one concrete <Tex>z</Tex> from the region. The
          obvious way is to sample it directly.
        </P>
        <Tex display>{"z \\sim \\N(\\mu, \\sigma^2)"}</Tex>
        <P>
          But a random draw has no derivative. Backpropagation cannot tell how{" "}
          <Tex>\mu</Tex> or <Tex>\sigma</Tex> should change to improve the
          sample.
        </P>
      </Step>
      <Step>
        <P>
          The trick moves the randomness out of the way. First, turn the
          predicted log variance into a standard deviation.
        </P>
        <Tex
          display
        >{`\\sigma = \\exp\\big(\\tfrac{1}{2}\\log\\sigma^2\\big) = ${vec(SIGMA)}`}</Tex>
      </Step>
      <Step>
        <P>
          Then draw noise from a fixed standard normal distribution. This draw
          does not depend on any weight.
        </P>
        <Tex
          display
        >{`\\varepsilon \\sim \\N(0, I), \\qquad \\varepsilon = ${vec(EPS, 1)}`}</Tex>
      </Step>
      <Step>
        <P>
          Scale the noise by <Tex>\sigma</Tex>, one dimension at a time. The
          unit circle stretches into the shape of the ellipse.
        </P>
        <Tex display>{`\\sigma \\odot \\varepsilon = ${vec(SCALED)}`}</Tex>
      </Step>
      <Step>
        <P>Then shift it by the mean.</P>
        <Tex
          display
        >{`z = \\mu + \\sigma \\odot \\varepsilon = ${vec(Z)}`}</Tex>
        <P>
          The result has exactly the distribution we wanted,{" "}
          <Tex>{"\\N(\\mu, \\sigma^2)"}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          Now <Tex>z</Tex> is an ordinary function of <Tex>\mu</Tex> and{" "}
          <Tex>\sigma</Tex>, with <Tex>\varepsilon</Tex> as a fixed input. Its
          derivatives are simple, so the gradient reaches the encoder.
        </P>
        <Tex display>
          {
            "\\frac{\\partial z}{\\partial \\mu} = 1, \\qquad \\frac{\\partial z}{\\partial \\sigma} = \\varepsilon"
          }
        </Tex>
        <P>
          The randomness is still there. It has moved to an input that needs no
          gradient.
        </P>
      </Step>
      <Step>
        <P>
          Draw more samples. Each lands somewhere in the ellipse, more often
          near <Tex>\mu</Tex>. Over many draws they fill in{" "}
          <Tex>{"\\N(\\mu, \\sigma^2)"}</Tex>.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Objective() {
  const formula = {
    lhs: <Tex>{"\\mathcal{L} ="}</Tex>,
    rec: <Tex>{"\\Lrec"}</Tex>,
    beta: <Tex>{"+\\ \\beta"}</Tex>,
    kl: <Tex>{"\\LKL"}</Tex>,
  };
  return (
    <ScrollStage tall visual={<VaeLossVisual formula={formula} />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} sub="Loss" />}>
          Two objectives pull against each other.
        </SectionHead>
        <P>
          The reconstruction term asks the model to keep enough about{" "}
          <Tex>x</Tex> to rebuild it. For real-valued data it is often the
          squared error.
        </P>
        <Tex display>{"\\Lrec = \\lVert \\hat{x} - x \\rVert^2"}</Tex>
        <P>
          On its own it favors small regions far apart. Precise, separate codes
          are the easiest to decode.
        </P>
      </Step>
      <Step>
        <P>
          The KL divergence measures how far each encoded distribution is from a
          shared prior, the standard normal <Tex>{"\\N(0, I)"}</Tex>. It keeps
          every input&apos;s code compatible with one common space.
        </P>
        <Tex display>
          {
            "\\LKL = \\tfrac{1}{2}\\sum_j \\big(\\mu_j^2 + \\sigma_j^2 - \\log\\sigma_j^2 - 1\\big)"
          }
        </Tex>
        <P>
          The <Tex>{"\\mu_j^2"}</Tex> term pulls each center toward the origin.
          The other terms are smallest when <Tex>{"\\sigma_j = 1"}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          With the KL term alone, the best solution is to encode every input as{" "}
          <Tex>{"\\N(0, I)"}</Tex> itself. The KL is zero, but <Tex>z</Tex> now
          carries no information about <Tex>x</Tex>. The decoder cannot tell one
          input from another.
        </P>
      </Step>
      <Step>
        <P>
          With both terms, the distributions move toward the origin and widen,
          but stay apart enough to identify their input. The gaps between them
          close, so points there decode to something plausible.
        </P>
        <Tex display>{"\\mathcal{L} = \\Lrec + \\beta\\,\\LKL"}</Tex>
        <P>
          The standard VAE uses <Tex>{"\\beta = 1"}</Tex>. Larger values trade
          reconstruction quality for a more regular latent space.
        </P>
      </Step>
      <Step>
        <P>
          Change <Tex>\beta</Tex> to see the tradeoff. As it grows, the
          distributions crowd toward the prior. With a very large{" "}
          <Tex>\beta</Tex>, real models can stop using some latent dimensions
          altogether.
        </P>
        <P>
          The arrangement in this figure is drawn by hand to show the trend. It
          is not the result of training.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Generation() {
  return (
    <ScrollStage tall visual={<GenerationVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} sub="Generation" />}>
          After training, the encoder can go.
        </SectionHead>
        <P>
          During training, every <Tex>z</Tex> comes from an encoded input and is
          decoded back into that input. That is reconstruction.
        </P>
      </Step>
      <Step>
        <P>
          The KL term has arranged the encoded regions around{" "}
          <Tex>{"\\N(0, I)"}</Tex>. So we can draw <Tex>z</Tex> from that prior
          directly and decode it, without any input at all. That is generation.
        </P>
      </Step>
      <Step>
        <P>
          Decoding a grid of latent points shows why this works. Nearby points
          decode to similar shapes, and the shapes change smoothly across the
          space. Far outside the prior, where training rarely placed any codes,
          there is less reason to trust the decoder.
        </P>
        <P>
          The decoder in these figures is a small hand-written function standing
          in for a trained network, so that the geometry stays visible.
        </P>
      </Step>
      <Step>
        <P>Reconstruction starts from an input.</P>
        <Tex display>{"x \\to \\mu, \\sigma \\to z \\to \\hat{x}"}</Tex>
        <P>Generation starts from the prior.</P>
        <Tex display>{"z \\sim \\N(0, I) \\to x_{\\text{new}}"}</Tex>
        <P>
          Reconstruction describes an input we already have. Generation produces
          one we have never seen.
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function VariationalChapter() {
  return (
    <>
      <Bridge>
        <p>
          An ordinary autoencoder maps each input to one exact point. The space
          between those points is never trained.
        </p>
        <p>What if each input described a region of latent space instead?</p>
      </Bridge>
      <Encoder />
      <Reparam />
      <Objective />
      <Generation />
    </>
  );
}
