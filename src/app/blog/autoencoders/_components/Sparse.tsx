import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { SPARSE_Z, fmt } from "./model";
import SparseVisual from "./visuals/SparseVisual";
import FeaturesVisual from "./visuals/FeaturesVisual";

const code = `[${SPARSE_Z.map((v) => (v ? fmt(v) : "0")).join(",\\ ")}]`;

function Dictionary() {
  return (
    <ScrollStage tall visual={<SparseVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} />}>
          More units, fewer of them active.
        </SectionHead>
        <P>
          Our first latent was a single number. A sparse autoencoder instead
          uses a latent that is wider than its input. Here, eight units encode a
          two-dimensional input.
        </P>
      </Step>
      <Step>
        <P>
          For any one input, most units are exactly zero. This input uses two of
          the eight.
        </P>
        <Tex display>{`z = ${code}`}</Tex>
        <P>
          The encoder ends in a ReLU, which turns negative values into zero. An
          inactive unit contributes nothing at all.
        </P>
      </Step>
      <Step>
        <P>
          The decoder shows what a unit stands for. Unit <Tex>j</Tex> owns a row
          of <Tex>{"\\Wdec"}</Tex>, a direction <Tex>{"d_j"}</Tex> in input
          space. The reconstruction adds up these directions, each scaled by its
          unit&apos;s activation.
        </P>
        <Tex display>{"\\hat{x} = \\sum_j z_j\\, d_j + \\bdec"}</Tex>
        <P>
          The rows form a dictionary of directions. In this figure{" "}
          <Tex>{"\\bdec = 0"}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          With eight directions in a two-dimensional space, there are endless
          ways to reach the same point. This code uses all eight units and still
          reconstructs <Tex>x</Tex> exactly.
        </P>
        <P>
          The eight directions are evenly spread, so they cancel out when added
          in equal amounts. Extra activity can hide in the code without changing
          the output. The reconstruction loss cannot tell the dense code from
          the sparse one.
        </P>
      </Step>
      <Step>
        <P>
          A sparsity penalty breaks the tie. A common choice adds the L1 norm of{" "}
          <Tex>z</Tex> to the loss. Among codes that reconstruct equally well,
          it prefers the one with the least total activity.
        </P>
        <Tex display>
          {
            "\\begin{aligned} \\mathcal{L} &= \\Lrec + \\lambda\\,\\Lsparse \\\\ \\Lsparse &= \\lVert z \\rVert_1 = \\sum_j |z_j| \\end{aligned}"
          }
        </Tex>
        <P>
          Other implementations keep only the <Tex>k</Tex> largest activations
          and zero the rest, or constrain how often each unit may be active. The
          goal is the same.
        </P>
      </Step>
      <Step>
        <P>
          Drag <Tex>x</Tex>, or focus it and use the arrow keys. The sparse code
          always uses the two directions on either side of it.
        </P>
        <P>
          The figure computes the exact code with the smallest L1 norm. A
          trained encoder has to approximate that code in one forward pass, and
          does so imperfectly.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Features() {
  return (
    <ScrollStage tall visual={<FeaturesVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} sub="Features" />}>
          What does a unit respond to?
        </SectionHead>
        <P>
          Since each unit is active for only a few inputs, we can ask a new
          question of it. Which inputs make it fire?
        </P>
        <P>
          Below each shape is its code over sixteen units. Most are zero. The
          shapes and codes here are constructed for illustration.
        </P>
      </Step>
      <Step>
        <P>
          Collect the inputs where one unit is most active. For{" "}
          <Tex>{"z_3"}</Tex>, they all look long and thin.
        </P>
        <P>
          Nobody told the model about elongation. The unit was useful for
          reconstruction, and it happens to track a property we can name.
        </P>
      </Step>
      <Step>
        <P>
          <Tex>{"z_7"}</Tex> responds most strongly to shapes with three lobes.
        </P>
      </Step>
      <Step>
        <P>
          <Tex>{"z_{12}"}</Tex> is harder. Its strongest inputs share no
          property we can see.
        </P>
        <P>
          This is common in practice. Some learned features are clear, some are
          partly clear, and some resist any short description.
        </P>
      </Step>
      <Step>
        <KeyLine>
          A sparse feature is a learned direction, not a concept someone
          assigned.
        </KeyLine>
        <div className="mt-6">
          <P>
            A name like “long and thin” summarizes examples. It has to be
            tested, for instance by checking whether the unit also fires on
            inputs the name does not predict.
          </P>
          <P>
            Real sparse autoencoders often work on the internal activations of
            another neural network, with hundreds or thousands of dimensions and
            many thousands of units. That is where these questions about
            interpretation matter most.
          </P>
        </div>
      </Step>
    </ScrollStage>
  );
}

export default function SparseChapter() {
  return (
    <>
      <Bridge>
        <p>
          The first autoencoder compressed two numbers into one. A sparse
          autoencoder seems to do the opposite. It expands its input into more
          numbers than it started with.
        </p>
        <p>The constraint moves from the size of the code to its activity.</p>
      </Bridge>
      <Dictionary />
      <Features />
    </>
  );
}
