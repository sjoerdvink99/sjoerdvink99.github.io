import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { D, D_HEAD, H } from "./model";
import HeadsVisual from "./visuals/HeadsVisual";
import ShapesVisual from "./visuals/ShapesVisual";

function ManyHeads() {
  return (
    <ScrollStage tall visual={<HeadsVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} />}>
          One pattern is not enough.
        </SectionHead>
        <P>
          One attention operation gives each token one set of weights. But a
          token may need several kinds of information at once. “chased” wants
          its subject and its object. A noun may want its article.
        </P>
      </Step>
      <Step>
        <P>
          Multi-head attention runs several attention operations side by side.
          Each head has its own query, key and value projections, so each can
          learn its own way of routing information. Every head reads the same{" "}
          <Tex>X</Tex>.
        </P>
        <P>
          With our weights, head 1 links “chased” and the nouns. Head 2 links
          the nouns with “the”. Those are readings of a hand-built example.
          Some heads in trained models show patterns this clear. Many do not.
        </P>
      </Step>
      <Step>
        <P>
          Each head produces its own output. The outputs are concatenated and
          multiplied by one more learned matrix, <Tex>{"W_O"}</Tex>, which
          mixes the heads back together.
        </P>
        <Tex display>
          {"\\begin{aligned} &\\operatorname{MultiHead}(X) \\\\ &= \\operatorname{concat}(\\text{head}_1, \\ldots, \\text{head}_H)\\, W_O \\end{aligned}"}
        </Tex>
      </Step>
    </ScrollStage>
  );
}

function Shapes() {
  return (
    <ScrollStage tall visual={<ShapesVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={3} sub="Shapes" />}>
          Split the projection, not the input.
        </SectionHead>
        <P>
          In code, the heads are not separate modules. One projection computes
          the queries for all heads at once, and the result is split. Follow the
          shapes for a batch of <Tex>B</Tex> sequences.
        </P>
        <P>
          <Tex>{"W_Q"}</Tex> is a full <code>(D, D)</code> matrix, so every
          column of <Tex>Q</Tex> is computed from all <Tex>D</Tex> features of a
          token.
        </P>
      </Step>
      <Step>
        <P>
          <code>view</code> regroups the last dimension into <Tex>H</Tex> heads
          of <Tex>{"D_{\\text{head}} = D / H"}</Tex> numbers each. Here{" "}
          <Tex>{`D = ${D}`}</Tex>, <Tex>{`H = ${H}`}</Tex> and{" "}
          <Tex>{`D_{\\text{head}} = ${D_HEAD}`}</Tex>. No number changes.
        </P>
        <P>
          The split happens after the projection. Head 1 gets the first two
          columns of <Tex>Q</Tex>, which is <Tex>X</Tex> times the first two
          columns of <Tex>{"W_Q"}</Tex>. Each head still sees all of{" "}
          <Tex>X</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          <code>transpose(1, 2)</code> moves the head dimension in front of{" "}
          <Tex>T</Tex>. Each pair of batch index and head now holds an ordinary{" "}
          <code>(T, D_head)</code> matrix. Everything after this treats{" "}
          <Tex>B</Tex> and <Tex>H</Tex> alike, as batch dimensions.
        </P>
      </Step>
      <Step>
        <P>
          Scores and weights are computed exactly as before, once per head,
          giving <code>(B, H, T, T)</code>. The scale is{" "}
          <Tex>{"\\sqrt{D_{\\text{head}}}"}</Tex>, the length of each
          head&apos;s queries and keys.
        </P>
      </Step>
      <Step>
        <P>
          <code>weights @ V</code> gives each head its own output,{" "}
          <code>(B, H, T, D_head)</code>.
        </P>
      </Step>
      <Step>
        <P>
          <code>transpose(1, 2)</code> moves the heads back behind{" "}
          <Tex>T</Tex>, and <code>reshape</code> lays them side by side:{" "}
          <code>(B, T, H, D_head)</code> becomes <code>(B, T, D)</code>. That is
          the concatenation.
        </P>
        <P>
          It has to be <code>reshape</code> rather than <code>view</code>.
          After a transpose the tensor is no longer laid out contiguously in
          memory, and <code>reshape</code> copies it when needed.
        </P>
      </Step>
      <Step>
        <P>
          Finally <Tex>{"W_O"}</Tex>, another <code>(D, D)</code> matrix, mixes
          information across heads. The output has the shape of <Tex>X</Tex>.
        </P>
        <P>
          Because each head works in <Tex>{"D / H"}</Tex> dimensions,{" "}
          <Tex>H</Tex> heads cost about as much as one head of full width.
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function HeadsChapter() {
  return (
    <>
      <Bridge>
        <p>
          A single attention operation is one learned way of routing
          information between tokens. Language needs more than one.
        </p>
      </Bridge>
      <ManyHeads />
      <Shapes />
    </>
  );
}
