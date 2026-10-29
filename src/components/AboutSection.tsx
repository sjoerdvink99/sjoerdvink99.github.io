const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a className="link" href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

export default function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 space-y-4 border-b-2 border-gray-200 py-10 leading-relaxed"
    >
      <p>
        Hi! I&apos;m a PhD candidate in Computer Science at{" "}
        <ExternalLink href="https://www.uu.nl/en/">Utrecht University</ExternalLink>
        , co-advised by{" "}
        <ExternalLink href="https://mbehrisch.github.io/">
          Michael Behrisch
        </ExternalLink>{" "}
        and{" "}
        <ExternalLink href="https://www.cs.tufts.edu/~remco/">
          Remco Chang
        </ExternalLink>
        . I&apos;m affiliated with the{" "}
        <ExternalLink href="https://vig.science.uu.nl/">
          Visualization and Graphics Group
        </ExternalLink>{" "}
        at Utrecht University and the{" "}
        <ExternalLink href="https://valt.cs.tufts.edu/">
          Visual Analytics Lab
        </ExternalLink>{" "}
        at Tufts University.
      </p>
      <p>
        I study how representations can support effective interaction between
        humans and AI systems. As AI systems become more capable, interaction
        increasingly depends on how information is expressed, transformed, and
        communicated between people and models. My work focuses on designing
        representations that make this exchange more structured, interpretable,
        and actionable, enabling people to work with AI systems with greater
        control and precision.
      </p>
      <p>
        My research combines interaction design, formal modeling, and systems
        development. I design and build interactive systems that use structured
        representations to support reasoning, communication, and coordination
        between humans and AI models. Across domains such as AI and data
        analysis, I investigate how these representations can serve as a
        foundation for systems in which people and models can communicate,
        inspect, and refine complex information together.
      </p>
      <p>
        Outside of research, I enjoy seeking out adventures and exploring the
        outdoors. I once bought an Opel Zafira that was as old as I was at the
        time, removed all the seats, built a bed inside, and surfed along the
        French and Spanish coastlines. These days, I have my sights set on
        visiting every national park in the United States.
      </p>
    </section>
  );
}
