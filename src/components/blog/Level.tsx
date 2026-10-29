"use client";

import { motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export const LEVELS = [
  { id: "intuition", name: "Intuition", blurb: "Pictures and analogies, no math" },
  { id: "mechanics", name: "Mechanics", blurb: "How the hardware really works" },
  { id: "expert", name: "Expert", blurb: "Derivations, numbers and kernels" },
] as const;

export type Level = (typeof LEVELS)[number]["id"];

const KEY = "essay-level";
const rank = (l: Level) => LEVELS.findIndex((x) => x.id === l);
const isLevel = (s: string | null): s is Level => LEVELS.some((l) => l.id === s);

interface LevelState {
  level: Level;
  reaches: (l: Level) => boolean;
  choose: (l: Level) => void;
  changed: boolean;
}

const LevelContext = createContext<LevelState | null>(null);

export function useLevel() {
  const state = useContext(LevelContext);
  if (!state) throw new Error("useLevel must be used inside <LevelProvider>");
  return state;
}

function stored(): Level | null {
  try {
    const query = new URLSearchParams(window.location.search).get("level");
    if (isLevel(query)) return query;
    const saved = localStorage.getItem(KEY);
    return isLevel(saved) ? saved : null;
  } catch {
    return null;
  }
}

let current: Level | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const snapshot = (): Level => current ?? stored() ?? "intuition";
const serverSnapshot = (): Level => "intuition";

function remember(level: Level) {
  current = level;
  listeners.forEach((l) => l());
  try {
    localStorage.setItem(KEY, level);
    const url = new URL(window.location.href);
    url.searchParams.set("level", level);
    window.history.replaceState(null, "", url);
  } catch {}
}

export function LevelProvider({ children }: { children: ReactNode }) {
  const level = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [changed, setChanged] = useState(false);
  const anchor = useRef<{ el: Element; top: number } | null>(null);

  useLayoutEffect(() => {
    const a = anchor.current;
    if (!a) return;
    anchor.current = null;
    window.scrollBy(0, a.el.getBoundingClientRect().top - a.top);
  }, [level]);

  const choose = useCallback((next: Level) => {
    const mid = window.innerHeight / 2;
    const el = Array.from(document.querySelectorAll("[data-step]")).find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= mid && r.bottom > mid;
    });
    anchor.current = el ? { el, top: el.getBoundingClientRect().top } : null;
    setChanged(true);
    remember(next);
  }, []);

  const reaches = useCallback((l: Level) => rank(level) >= rank(l), [level]);

  return (
    <LevelContext.Provider value={{ level, reaches, choose, changed }}>
      {children}
    </LevelContext.Provider>
  );
}

export function Depth({
  from = "intuition",
  only,
  children,
}: {
  from?: Level;
  only?: Level;
  children: ReactNode;
}) {
  const { level, reaches, changed } = useLevel();
  if (only ? level !== only : !reaches(from)) return null;
  return (
    <motion.div
      className="my-4 first:mt-0 last:mb-0"
      initial={changed ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function LevelSwitch({ compact = false }: { compact?: boolean }) {
  const { level, choose } = useLevel();
  return (
    <div
      role="radiogroup"
      aria-label="Reading level"
      className={
        compact
          ? "flex rounded-full border border-gray-200 bg-white/90 p-0.5 shadow-sm backdrop-blur-sm"
          : "grid gap-2 sm:grid-cols-3"
      }
    >
      {LEVELS.map((l, i) => {
        const on = l.id === level;
        return (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => choose(l.id)}
            className={`transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ir-ink ${
              compact
                ? `rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] ${
                    on ? "bg-ir-ink text-white" : "text-ir-ink-muted hover:text-ir-ink"
                  }`
                : `rounded-lg border px-4 py-3 text-left ${
                    on
                      ? "border-ir-ink bg-ir-ink text-white"
                      : "border-gray-200 text-ir-ink hover:border-gray-400"
                  }`
            }`}
          >
            {compact ? (
              l.name
            ) : (
              <>
                <span className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em]">
                  <span className="flex gap-0.5" aria-hidden>
                    {LEVELS.map((_, k) => (
                      <span
                        key={k}
                        className={`h-2.5 w-1 rounded-full ${
                          k <= i ? (on ? "bg-white" : "bg-ir-ink") : on ? "bg-white/30" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </span>
                  {l.name}
                </span>
                <span className={`mt-1.5 block text-sm ${on ? "text-white/75" : "text-ir-ink-muted"}`}>
                  {l.blurb}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LevelDock() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const update = () => setShown(window.scrollY > window.innerHeight * 1.2);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      inert={!shown}
      className={`fixed bottom-4 left-1/2 z-40 -translate-x-1/2 transition-opacity duration-500 lg:left-auto lg:right-6 lg:translate-x-0 ${
        shown ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <LevelSwitch compact />
    </div>
  );
}
