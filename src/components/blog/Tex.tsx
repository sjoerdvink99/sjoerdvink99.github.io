import katex from "katex";
import { Fit } from "./Fit";

const MACROS = {
  "\\xhat": "\\hat{x}",
  "\\Wenc": "W_{\\text{enc}}",
  "\\Wdec": "W_{\\text{dec}}",
  "\\benc": "b_{\\text{enc}}",
  "\\bdec": "b_{\\text{dec}}",
  "\\Lrec": "\\mathcal{L}_{\\text{rec}}",
  "\\LKL": "\\mathcal{L}_{\\text{KL}}",
  "\\Lsparse": "\\mathcal{L}_{\\text{sparse}}",
  "\\N": "\\mathcal{N}",
};

function render(src: string, display: boolean) {
  return katex.renderToString(src, {
    displayMode: display,
    throwOnError: true,
    output: "htmlAndMathml",
    macros: { ...MACROS },
  });
}

export function Tex({
  children,
  display = false,
  className = "",
}: {
  children: string;
  display?: boolean;
  className?: string;
}) {
  if (display) {
    return (
      <Fit
        className={`-mx-1 overflow-hidden px-1 py-1 text-[1.05rem] text-ir-ink ${className}`}
        html={render(children, true)}
      />
    );
  }
  return (
    <span
      className={`text-[0.92em] text-ir-ink ${className}`}
      dangerouslySetInnerHTML={{ __html: render(children, false) }}
    />
  );
}
