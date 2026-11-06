export interface Software {
  name: string;
  description: string;
  logo: string;
  website: string;
  github?: string;
}

export const software: Software[] = [
  {
    name: "Modelscape",
    description: "Controlled behavioral mapping of large language models.",
    logo: "/images/logos/modelscape.svg",
    website: "https://modelscape.github.io/modelscape/",
    github: "https://github.com/Modelscape/modelscape",
  },
  {
    name: "GraphPolaris",
    description:
      "Visual analytics platform for exploring and querying graph data.",
    logo: "/images/logos/graphpolaris.svg",
    website: "https://www.graphpolaris.com/",
  },
];
