import Link from "next/link";
import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import SteeringVisual from "./visuals/SteeringVisual";

const link =
  "underline underline-offset-4 hover:text-ir-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink";

export default function SteeringChapter() {
  return (
    <>
      <Bridge>
        <p>
          A language model has no latent vector you choose up front. But
          every layer inside it holds vectors, and the same geometry applies
          there.
        </p>
      </Bridge>
      <ScrollStage tall visual={<SteeringVisual />}>
        <Step>
          <SectionHead label={<ChapterLabel n={6} />}>
            Inside a language model, behaviours are directions too.
          </SectionHead>
          <P>
            A{" "}
            <Link href="/blog/transformers/" className={link}>
              Transformer
            </Link>{" "}
            keeps one vector per token, the residual stream, and every layer
            adds its output to it. Take the vector at the last token after
            layer 12, <Tex>{"h \\in \\mathbb{R}^{d}"}</Tex>, for two sets of
            prompts: harmful requests the model refuses, and harmless ones it
            answers.
          </P>
          <P>
            Projected onto a plane, the two sets form two clusters. The
            points here are a toy, but the method is the one used on real
            chat models.
          </P>
        </Step>
        <Step>
          <P>
            The recipe from chapter 2 carries over unchanged. The difference
            of the means is a refusal direction:
          </P>
          <Tex display>
            {"r = \\mu_{\\text{harmful}} - \\mu_{\\text{harmless}}, \\qquad \\hat{r} = r / \\lVert r \\rVert"}
          </Tex>
          <P>
            Reading it works as before. The projection{" "}
            <Tex>{"h \\cdot \\hat{r}"}</Tex> says how strongly a prompt
            activates refusal, and past a threshold, the shaded side, the
            model refuses. A readout like this is a probe, and probes are
            being studied as monitors for things a model will not say out
            loud.
          </P>
          <P>
            Arditi and colleagues found that in many open chat models,
            refusal is carried largely by one such direction.
          </P>
        </Step>
        <Step>
          <P>
            Writing works as before too. Add <Tex>{"\\alpha r"}</Tex> to the
            residual stream at every token while the model generates, and a
            harmless prompt is pushed over the threshold. The model refuses
            to give a recipe for pancakes.
          </P>
          <Tex display>{"h \\leftarrow h + \\alpha\\, r"}</Tex>
          <P>
            This is called activation steering. The same trick makes models
            more honest, less flattering, more cheerful, or obsessed with a
            single topic. It needs no retraining, and it can be switched off
            again at any moment. Sparse autoencoders, from the{" "}
            <Link href="/blog/autoencoders/" className={link}>
              autoencoder essay
            </Link>
            , find thousands of such directions at once.
          </P>
        </Step>
        <Step>
          <P>
            Now remove the direction instead. Subtract each vector&apos;s
            component along <Tex>{"\\hat{r}"}</Tex>, exactly the projection
            from chapter 4:
          </P>
          <Tex display>{"h \\leftarrow h - (h \\cdot \\hat{r})\\, \\hat{r}"}</Tex>
          <P>
            Every point slides onto the line through the origin perpendicular
            to <Tex>r</Tex>. The model can no longer represent &ldquo;this
            should be refused&rdquo;, and it refuses nothing at all.
          </P>
          <P>
            For alignment this cuts both ways. Safety training can end up as
            a thin layer, a single direction that anyone with the weights can
            remove. The same geometry also gives us handles that are easier
            to read and more precise to adjust than retraining a whole
            model.
          </P>
          <KeyLine>
            A direction that lets you steer a model also lets someone else
            steer it the other way.
          </KeyLine>
        </Step>
      </ScrollStage>
    </>
  );
}
