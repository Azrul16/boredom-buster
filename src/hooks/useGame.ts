"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { RefObject } from "react";
export function useCanvasResolution(
  canvas: RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number,
) {
  useLayoutEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    element.setAttribute("width", String(Math.round(width * ratio)));
    element.setAttribute("height", String(Math.round(height * ratio)));
    element.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }, [canvas, width, height]);
}
import type { GameSlug } from "@/data/games";
import { recordGame, getProfile, saveBest } from "@/lib/progress";
export function useGame(slug: GameSlug) {
  const [best, setBest] = useState<number>();
  useEffect(() => {
    setBest(getProfile().best[slug]);
  }, [slug]);
  const finish = useCallback(
    (score: number, won = false, details?: { tile?: number }) => {
      const p = recordGame(slug, score, won, details);
      setBest(p.best[slug]);
    },
    [slug],
  );
  const updateBest = useCallback(
    (score: number) => setBest(saveBest(slug, score)),
    [slug],
  );
  return { best, finish, updateBest };
}
export function useFrame(callback: (dt: number) => void, active = true) {
  const fn = useRef(callback);
  useEffect(() => {
    fn.current = callback;
  });
  useEffect(() => {
    if (!active) return;
    let id = 0,
      last = 0;
    const loop = (time: number) => {
      const dt = last ? Math.min((time - last) / 1000, 0.04) : 0;
      last = time;
      fn.current(dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}
export function useKeys(handler: (key: string) => void) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("dialog[open]")) return;
      if ((e.target as HTMLElement).matches("input,select,textarea,a")) return;
      if (
        (e.target as HTMLElement).closest("button") &&
        (e.key === " " || e.key === "Enter")
      )
        return;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      )
        e.preventDefault();
      handler(e.key);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [handler]);
}
