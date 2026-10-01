import { ScrollStage, Step } from "@/components/blog/ScrollStage";
import { Bridge } from "@/components/blog/Chapters";
import { Tex } from "@/components/blog/Tex";
import { KeyLine, P, SectionHead } from "@/components/blog/Typography";
import { ChapterLabel } from "./chapters";
import { ATT, D, TOKENS, X, tex } from "./model";
import ProjectionVisual from "./visuals/ProjectionVisual";
import AttentionVisual from "./visuals/AttentionVisual";
import TorchVisual from "./visuals/TorchVisual";

const CHASED = TOKENS.indexOf("chased");
const DOG = TOKENS.indexOf("dog");
const row = (v: number[], digits = 1) =>
  `[${v.map((x) => tex(x, digits)).join(",\\ ")}]`;

/** Value rows grouped by weight, one group per line. */
const weightedSum = (() => {
  const groups = new Map<string, string[]>();
  ATT.weights[CHASED].forEach((w, j) => {
    const key = tex(w);
    groups.set(key, [...(groups.get(key) ?? []), `v_{\\text{${TOKENS[j]}}}`]);
  });
  return [...groups.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([w, vs], i) => `&${i ? "+ " : ""}${w}\\,(${vs.join(" + ")})`)
    .join(" \\\\ ");
})();

/** Each product written out, or 0 where either entry is 0. */
const terms = (a: number[], b: number[]) =>
  a
    .map((v, i) => (v && b[i] ? `${tex(v, 1)} \\times ${tex(b[i], 1)}` : "0"))
    .join(" + ");

function Role({ color, name, children }: { color: string; name: string; children: string }) {
  return (
    <p className="mb-2 text-[1.05rem] leading-[1.7] text-gray-600">
      <span className={`font-medium ${color}`}>{name}</span> {children}
    </p>
  );
}

function Projection() {
  return (
    <ScrollStage tall visual={<ProjectionVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} />}>
          One vector, three roles.
        </SectionHead>
        <P>
          Back to the sentence. <Tex>X</Tex> has one row per token and{" "}
          <Tex>D</Tex> = {D} numbers per row, shape <code>(T, D)</code>.
        </P>
        <P>
          In the simple version, each token vector did three jobs at once.
          Attention gives each job its own vector.
        </P>
        <div className="mt-5">
          <Role color="text-ir-human" name="Query.">
            What am I looking for?
          </Role>
          <Role color="text-ir-transform-ink" name="Key.">
            What kind of query should match me?
          </Role>
          <Role color="text-ir-rep" name="Value.">
            What do I hand over when I am matched?
          </Role>
        </div>
      </Step>
      <Step>
        <P>
          Each role is a learned linear projection of <Tex>X</Tex>. The queries
          are <Tex>{"Q = XW_Q"}</Tex>.
        </P>
        <P>
          The row of “chased” in <Tex>X</Tex> is{" "}
          <Tex>{row(X[CHASED])}</Tex>, so its query is simply the second row of{" "}
          <Tex>{"W_Q"}</Tex>: <Tex>{row(ATT.Q[CHASED])}</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          Keys and values come from two more weight matrices. All three have
          shape <code>(D, D)</code>, so <Tex>Q</Tex>, <Tex>K</Tex> and{" "}
          <Tex>V</Tex> have the same shape as <Tex>X</Tex>.
        </P>
        <Tex display>
          {"\\begin{aligned} Q &= XW_Q \\\\ K &= XW_K \\\\ V &= XW_V \\end{aligned}"}
        </Tex>
        <P>
          These weights were picked by hand so the numbers stay readable. In a
          trained model they are learned, and much less tidy.
        </P>
      </Step>
      <Step>
        <P>
          Row <Tex>i</Tex> of <Tex>Q</Tex>, <Tex>K</Tex> and <Tex>V</Tex> all
          belong to token <Tex>i</Tex>. “chased” now has a query{" "}
          <Tex>{row(ATT.Q[CHASED])}</Tex> that matches keys with a large first
          entry, which in this example are the nouns. Its key{" "}
          <Tex>{row(ATT.K[CHASED])}</Tex> is what other queries will find.
        </P>
        <P>
          Because the query and key come from different matrices, what a token
          looks for no longer has to resemble what it is.
        </P>
      </Step>
    </ScrollStage>
  );
}

function ScaledDotProduct() {
  const q = ATT.Q[CHASED];
  const k = ATT.K[DOG];
  return (
    <ScrollStage tall visual={<AttentionVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} sub="Scaled dot-product attention" />}>
          Queries meet keys.
        </SectionHead>
        <P>
          The steps are the same as before. Only the inputs change: scores now
          compare one token&apos;s query with every token&apos;s key.
        </P>
      </Step>
      <Step>
        <P>
          Turning <Tex>K</Tex> on its side gives <Tex>{"K^{\\top}"}</Tex>, shape{" "}
          <code>(D, T)</code>. The product <Tex>{"QK^{\\top}"}</Tex> holds every
          query–key dot product, shape <code>(T, T)</code>. Rows are queries,
          columns are keys. In the figure, each score sits where its row of{" "}
          <Tex>Q</Tex> meets its column of <Tex>{"K^{\\top}"}</Tex>.
        </P>
        <Tex display>
          {`\\begin{aligned} q_{\\text{chased}} &= ${row(q)} \\\\ k_{\\text{dog}} &= ${row(k)} \\\\ q_{\\text{chased}} \\cdot k_{\\text{dog}} &= ${terms(q, k)} = ${tex(ATT.scores[CHASED][DOG], 1)} \\end{aligned}`}
        </Tex>
        <P>
          Unlike <Tex>{"XX^{\\top}"}</Tex>, this matrix is not symmetric. “chased”
          scores “dog” at {tex(ATT.scores[CHASED][DOG], 1)}, but “dog” scores
          “chased” at {tex(ATT.scores[DOG][CHASED], 1)}.
        </P>
      </Step>
      <Step>
        <P>
          Every score is then divided by <Tex>{"\\sqrt{d_k}"}</Tex>, where{" "}
          <Tex>{"d_k"}</Tex> is the length of the query and key vectors. Here{" "}
          <Tex>{`d_k = ${D}`}</Tex>, so we divide by 2.
        </P>
        <P>
          A dot product adds up <Tex>{"d_k"}</Tex> products. If the entries of{" "}
          <Tex>q</Tex> and <Tex>k</Tex> are independent with mean 0 and variance
          1, the sum has variance <Tex>{"d_k"}</Tex>. At <Tex>{"d_k = 512"}</Tex>{" "}
          scores would routinely reach the tens, softmax would put nearly all
          weight on one token, and its gradients would all but vanish. Dividing
          by <Tex>{"\\sqrt{d_k}"}</Tex> brings the variance back to 1.
        </P>
        <Tex display>
          {"\\begin{aligned} \\operatorname{Var}(q \\cdot k) &= d_k \\\\ \\operatorname{Var}\\!\\left(\\frac{q \\cdot k}{\\sqrt{d_k}}\\right) &= 1 \\end{aligned}"}
        </Tex>
      </Step>
      <Step>
        <P>
          Softmax along each row turns scores into weights. “chased” gives{" "}
          {tex(ATT.weights[CHASED][DOG])} to “dog” and to “ball”, and{" "}
          {tex(ATT.weights[CHASED][0])} to each of the others.
        </P>
        <Tex display>
          {"A = \\operatorname{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)"}
        </Tex>
      </Step>
      <Step>
        <P>
          The weights mix the values, not the keys. <Tex>A</Tex> becomes the
          left operand and multiplies <Tex>V</Tex>: <code>(T, T)</code> times{" "}
          <code>(T, D)</code> gives <code>(T, D)</code>, one output per token.
          The figure uses the same layout as before: an output cell sits where
          its row of weights meets its column of <Tex>V</Tex>.
        </P>
      </Step>
      <Step>
        <P>
          The output row of “chased” is its weighted sum of value rows.
        </P>
        <Tex display>
          {`\\begin{aligned} ${weightedSum} \\\\ &= ${row(ATT.output[CHASED], 2)} \\end{aligned}`}
        </Tex>
        <P>
          Its last entry, {tex(ATT.output[CHASED][3])}, comes entirely from
          “dog”: {tex(ATT.weights[CHASED][DOG])} ×{" "}
          {tex(ATT.V[DOG][3], 1)}. What a token hands over is its value, which
          can carry information its key never showed.
        </P>
      </Step>
      <Step>
        <KeyLine>Every part of the formula now has a place in the figure.</KeyLine>
        <Tex display>
          {"\\begin{aligned} &\\operatorname{Attention}(Q, K, V) \\\\ &= \\operatorname{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right) V \\end{aligned}"}
        </Tex>
        <P>
          <Tex>{"QK^{\\top}"}</Tex> compares queries with keys.{" "}
          <Tex>{"\\sqrt{d_k}"}</Tex> keeps the scores in a range where softmax
          still spreads its weight. Softmax runs along each row, so every
          token&apos;s weights sum to 1. Multiplying by <Tex>V</Tex> mixes the
          values.
        </P>
      </Step>
    </ScrollStage>
  );
}

function Torch() {
  return (
    <ScrollStage tall visual={<TorchVisual />}>
      <Step>
        <SectionHead label={<ChapterLabel n={2} sub="Code" />}>
          Six lines, then a module.
        </SectionHead>
        <P>
          In NumPy, single-head attention is six lines, with the same names as
          the figures. <code>softmax</code> is a small helper that exponentiates
          and divides by the sum along the given axis.
        </P>
      </Step>
      <Step>
        <P>
          PyTorch is nearly identical. <code>K.transpose(-2, -1)</code> swaps
          the last two dimensions, and the softmax axis is called{" "}
          <code>dim</code>. <code>dim=-1</code> still means along each row.
        </P>
      </Step>
      <Step>
        <P>
          Models process a batch of <Tex>B</Tex> sequences at once, so{" "}
          <Tex>X</Tex> has shape <code>(B, T, D)</code>. The code does not
          change. <code>@</code> multiplies over the last two dimensions and
          treats the leading one as a batch, and{" "}
          <code>transpose(-2, -1)</code> leaves <Tex>B</Tex> alone. Each
          sequence gets its own <code>(T, T)</code> weights.
        </P>
      </Step>
      <Step>
        <P>
          As a module, the three weight matrices become{" "}
          <code>nn.Linear</code> layers without bias, and{" "}
          <code>self.W_Q(X)</code> computes <code>X @ W_Q</code>.
          (<code>nn.Linear</code> stores its matrix transposed and multiplies by{" "}
          <code>weight.T</code>. The result is the same.)
        </P>
      </Step>
    </ScrollStage>
  );
}

export default function QueryKeyValueChapter() {
  return (
    <>
      <Bridge>
        <p>
          This already works, but it is rigid. Scores depend only on how similar
          two vectors already are, and nothing in it can be learned.
        </p>
        <p>
          In the sentence, “chased” does not want words that resemble a verb. It
          wants its subject and its object.
        </p>
      </Bridge>
      <Projection />
      <ScaledDotProduct />
      <Torch />
    </>
  );
}
