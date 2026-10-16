import Link from "next/link";
import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import LatentVisual from "./visuals/LatentVisual";

const link =
  "underline underline-offset-4 hover:text-ir-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink";

export default function LatentChapter() {
  return (
    <ScrollStage tall visual={<LatentVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={1} />}>
          Every output has an address.
        </SectionHead>
        <P>
          A generative model is a function. It takes a short list of numbers{" "}
          <Tex>z</Tex> and turns it into something: an image, a sound, a
          sentence. The list is called a latent vector, and the set of every
          list the model accepts is its latent space.
        </P>
        <P>
          Our model is as small as it gets. Its latent vector has two
          numbers, so every <Tex>z</Tex> is a point in a plane, and its
          decoder <Tex>g</Tex> draws a face. The red point is{" "}
          <Tex>z</Tex>, and the face on the right is{" "}
          <Tex>{"g(z)"}</Tex>.
        </P>
        <P>
          Real models work the same way with more numbers: 512 for a face
          GAN, and 16,384 for the noise that Stable Diffusion turns into an
          image. Nobody chose what these numbers mean. The model invented
          them while learning to rebuild its training data, which is why
          they are called latent, or hidden. The{" "}
          <Link href="/blog/autoencoders/" className={link}>
            autoencoder essay
          </Link>{" "}
          shows how such a space is learned.
        </P>
      </Step>
      <Step>
        <P>
          Draw the face at every point of a seven by seven grid and you get
          an atlas of everything this model can make. Frowns are in the
          lower left, grins in the upper right, and the faces in between
          change a little at a time.
        </P>
        <P>
          That smoothness is what makes control possible at all. A small
          step in <Tex>z</Tex> gives a small change in the output, so
          getting the output you want comes down to getting to the right
          place in the space.
        </P>
      </Step>
      <Step>
        <P>
          The axes, however, are no help. Walk to the right along{" "}
          <Tex>{"z_1"}</Tex> and the face starts smiling but also closes its
          eyes. Walk up along <Tex>{"z_2"}</Tex> and the eyes open while
          the smile grows a little. Each axis mixes both traits, and
          researchers call such a space entangled.
        </P>
        <P>
          The model has no reason to do better. Training only asks it to
          reproduce the data, and a rotated copy of the plane, with the
          decoder rotated to match, would reproduce the data just as well.
          Nothing pushes the axes to line up with the words a person would
          use.
        </P>
      </Step>
      <Step>
        <P>
          Try it. Drag the point around the square and watch which way you
          have to move to change only the smile. It is a diagonal, and you
          have to find it by feel.
        </P>
        <KeyLine>
          The model has its own coordinates. To control it, we have to find
          our concepts inside them.
        </KeyLine>
      </Step>
    </ScrollStage>
  );
}
