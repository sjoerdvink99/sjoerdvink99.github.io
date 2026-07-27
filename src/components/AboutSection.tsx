export default function AboutSection() {
  return (
    <section id="about" className="py-10 border-b-2">
      <p>
        Hi! I&apos;m a PhD candidate in Computer Science at{" "}
        <a
          className="underline"
          href="https://www.uu.nl/en/"
          target="_blank"
          rel="noreferrer"
        >
          Utrecht University
        </a>
        , co-advised by{" "}
        <a
          className="underline"
          href="https://mbehrisch.github.io/"
          target="_blank"
          rel="noreferrer"
        >
          Michael Behrisch
        </a>{" "}
        and{" "}
        <a
          className="underline"
          href="https://www.cs.tufts.edu/~remco/"
          target="_blank"
          rel="noreferrer"
        >
          Remco Chang
        </a>
        . I&apos;m affiliated with the{" "}
        <a
          className="underline"
          href="https://vig.science.uu.nl/"
          target="_blank"
          rel="noreferrer"
        >
          Visualization and Graphics Group
        </a>{" "}
        at Utrecht, and the{" "}
        <a
          className="underline"
          href="https://valt.cs.tufts.edu/"
          target="_blank"
          rel="noreferrer"
        >
          Visual Analytics Lab
        </a>{" "}
        at Tufts University .
      </p>

      <p className="mt-4">
        I study how representations can support effective interaction between
        humans and AI systems. As AI systems become more capable, interaction
        increasingly depends on how information is expressed, transformed, and
        communicated between people and models. My work focuses on designing
        representations that make this exchange more structured, interpretable,
        and actionable, enabling people to work with AI systems with greater
        control and precision.
      </p>
      <p className="mt-4">
        My research combines interaction design, formal modeling, and systems
        development. I design and build interactive systems that use structured
        representations to support reasoning, communication, and coordination
        between humans and AI models. Across domains such as AI and data
        analysis, I investigate how these representations can serve as a
        foundation for systems in which people and models can communicate,
        inspect, and refine complex information together.
      </p>
    </section>
  );
}
