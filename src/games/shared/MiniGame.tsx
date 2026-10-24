"use client";

import { useRef, useState, type ComponentType } from "react";
import type { GameSlug } from "@/data/games";
import { Toolbar } from "@/components/GameUI";
import GameResult from "@/components/GameResult";
import { useGame } from "@/hooks/useGame";
import { sound } from "@/lib/audio";
import { useDifficulty } from "@/components/GameSettings";
import type { Difficulty } from "@/lib/difficulty";

export type RoundProps = {
  difficulty: Difficulty;
  level: number;
  complete: (score: number, won: boolean, title: string) => void;
};

export default function MiniGame({
  slug,
  board: Board,
}: {
  slug: GameSlug;
  board: ComponentType<RoundProps>;
}) {
  const [round, setRound] = useState(0);
  return (
    <Round
      key={round}
      slug={slug}
      board={Board}
      restart={() => setRound((value) => value + 1)}
    />
  );
}

function Round({
  slug,
  board: Board,
  restart,
}: {
  slug: GameSlug;
  board: ComponentType<RoundProps>;
  restart: () => void;
}) {
  const { best, finish } = useGame(slug);
  const { difficulty, level } = useDifficulty();
  const finished = useRef(false);
  const [result, setResult] = useState<{
    score: number;
    won: boolean;
    title: string;
  }>();
  function complete(score: number, won: boolean, title: string) {
    if (finished.current) return;
    finished.current = true;
    finish(score, won);
    sound(won ? "score" : "lose");
    setResult({ score, won, title });
  }
  return (
    <>
      <Toolbar stats={[["Best", best ?? "—"]]} onRestart={restart} />
      <fieldset className="mini-game" disabled={!!result}>
        <Board complete={complete} difficulty={difficulty} level={level} />
      </fieldset>
      {result && (
        <GameResult
          title={result.title}
          stats={[["Score", result.score]]}
          celebrate={result.won}
          onContinue={restart}
        />
      )}
    </>
  );
}
