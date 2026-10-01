"use client";

import {
  Children,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const StageContext = createContext<number | null>(null);
const StepIndex = createContext(0);

export function useStage(): { step: number } {
  const step = useContext(StageContext);
  if (step === null) throw new Error("useStage must be used inside <ScrollStage>");
  return { step };
}

const TRIGGER = {
  narrow: "-82% 0px -18% 0px",
  wide: "-50% 0px -50% 0px",
};

const HEIGHT = {
  half: { frame: "h-[52svh]", text: "pt-[52svh]" },
  tall: { frame: "h-[64svh]", text: "pt-[64svh]" },
};

export function ScrollStage({
  visual,
  children,
  tall = false,
}: {
  visual: ReactNode;
  children: ReactNode;
  tall?: boolean;
}) {
  const height = HEIGHT[tall ? "tall" : "half"];
  const ref = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const steps = section.querySelectorAll<HTMLElement>("[data-step]");
    const query = window.matchMedia("(min-width: 1024px)");
    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setStep(Number((entry.target as HTMLElement).dataset.step));
            }
          }
        },
        { rootMargin: query.matches ? TRIGGER.wide : TRIGGER.narrow }
      );
      steps.forEach((s) => observer!.observe(s));
    };
    observe();
    query.addEventListener("change", observe);
    return () => {
      query.removeEventListener("change", observe);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const outer = frame.current;
    const inner = content.current;
    if (!outer || !inner) return;
    const fit = () => {
      const style = getComputedStyle(outer);
      const room =
        outer.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom);
      const scale = Math.min(1, room / inner.offsetHeight);
      inner.style.transform = scale < 1 ? `scale(${scale})` : "";
    };
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <StageContext.Provider value={step}>
      <section
        ref={ref}
        className="relative mx-auto grid max-w-6xl px-4 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-x-16 lg:px-10 xl:gap-x-24"
      >
        <div className="relative z-20 [grid-area:1/1] lg:z-auto lg:[grid-area:1/2]">
          <div
            ref={frame}
            className={`sticky top-0 flex ${height.frame} items-center bg-white pb-3 pt-12 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-10 after:bg-gradient-to-b after:from-white lg:h-screen lg:bg-transparent lg:py-8 lg:after:hidden`}
          >
            <div
              ref={content}
              className="w-full origin-center transition-transform duration-500"
            >
              {visual}
            </div>
          </div>
        </div>
        <div className={`relative ${height.text} [grid-area:1/1] lg:z-10 lg:pt-0`}>
          {Children.toArray(children).map((child, i) => (
            <StepIndex.Provider key={i} value={i}>
              {child}
            </StepIndex.Provider>
          ))}
        </div>
      </section>
    </StageContext.Provider>
  );
}

export function Step({ children }: { children: ReactNode }) {
  const index = useContext(StepIndex);
  const { step } = useStage();

  return (
    <div
      data-step={index}
      className="flex min-h-[56svh] items-start pb-6 pt-10 first:pt-6 last:min-h-[70svh] lg:min-h-[90vh] lg:items-center lg:py-10 lg:first:pt-[20vh] lg:last:min-h-[90vh] lg:last:pb-[25vh]"
    >
      <div
        className={`mx-auto w-full max-w-xl transition-opacity duration-700 lg:max-w-none ${
          step === index ? "opacity-100" : "opacity-25"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
