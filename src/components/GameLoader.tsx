"use client";
import { Component as ReactComponent, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import type { GameSlug } from "@/data/games";
import { GameSettings } from "./GameSettings";
const registry: Record<GameSlug, () => Promise<{ default: ComponentType }>> = {
  "tic-tac-toe": () => import("@/games/tic-tac-toe/Game"),
  "reaction-time": () => import("@/games/reaction/Game"),
  snake: () => import("@/games/snake/Game"),
  "pen-fight": () => import("@/games/pen-fight/Game"),
  "rock-paper-scissors": () => import("@/games/rps/Game"),
  "memory-match": () => import("@/games/memory/Game"),
  "2048": () => import("@/games/game2048/Game"),
  pong: () => import("@/games/pong/Game"),
  flappy: () => import("@/games/flappy/Game"),
  "red-light-green-light": () => import("@/games/red-light/Game"),
  "connect-four": () => import("@/games/connect-four/Game"),
  minesweeper: () => import("@/games/minesweeper/Game"),
  "sliding-puzzle": () => import("@/games/sliding-puzzle/Game"),
  "lights-out": () => import("@/games/lights-out/Game"),
  "mini-sudoku": () => import("@/games/mini-sudoku/Game"),
  hangman: () => import("@/games/hangman/Game"),
  "word-scramble": () => import("@/games/word-scramble/Game"),
  "number-guess": () => import("@/games/number-guess/Game"),
  "math-challenge": () => import("@/games/math-challenge/Game"),
  "whack-a-mole": () => import("@/games/whack-a-mole/Game"),
};
export default function GameLoader({ slug }: { slug: GameSlug }) {
  const [version, setVersion] = useState(0);
  return (
    <GameSettings key={slug} slug={slug}>
      <GameErrorBoundary
        key={`${slug}:${version}`}
        retry={() => setVersion((v) => v + 1)}
      >
        <LoadGame slug={slug} retry={() => setVersion((v) => v + 1)} />
      </GameErrorBoundary>
    </GameSettings>
  );
}

function LoadGame({ slug, retry }: { slug: GameSlug; retry: () => void }) {
  const [content, setContent] = useState<ReactNode>(null);
  const [status, setStatus] = useState<"loading" | "slow" | "failed" | "ready">(
    "loading",
  );
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) setStatus("slow");
    }, 12000);
    registry[slug]()
      .then(({ default: Game }) => {
        if (!active) return;
        clearTimeout(timer);
        setContent(<Game />);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        clearTimeout(timer);
        setStatus("failed");
      });
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [slug]);
  if (status === "ready") return content;
  return (
    <div className="status" aria-live="polite" aria-busy={status === "loading"}>
      <p role="status">
        {status === "failed"
          ? "The game could not load. Please try again."
          : status === "slow"
            ? "This is taking longer than expected. You can keep waiting or retry."
            : "Loading game…"}
      </p>
      {status !== "loading" && (
        <div className="game-options" style={{ marginTop: 16 }}>
          <button className="button" onClick={retry}>
            Retry loading
          </button>
          <button
            className="button secondary"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      )}
    </div>
  );
}
class GameErrorBoundary extends ReactComponent<
  { children: React.ReactNode; retry: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="status">
        <p>The game could not start. Your saved progress is safe.</p>
        <button className="button" onClick={this.props.retry}>
          Try again
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
