"use client";
import { useState } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";
import { pickWord } from "@/games/shared/puzzles";
import { useKeys } from "@/hooks/useGame";

export default function Game() {
  return <MiniGame slug="hangman" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const allowance = [8, 6, 4][level];
  const [[word, clue]] = useState(() => pickWord(level));
  const [letters, setLetters] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const wrong = letters.filter((letter) => !word.includes(letter)).length;
  const drawing = Math.ceil((wrong / allowance) * 6);
  function guess(letter: string) {
    if (done || letters.includes(letter)) return;
    const next = [...letters, letter];
    setLetters(next);
    const misses = next.filter((value) => !word.includes(value)).length;
    const won = [...word].every((value) => next.includes(value));
    if (won || misses === allowance) {
      setDone(true);
      complete(
        won
          ? Math.round(((allowance + 1 - misses) / (allowance + 1)) * 140)
          : 0,
        won,
        won ? "Word rescued!" : `The word was ${word}`,
      );
    }
  }
  useKeys((key) => {
    if (/^[a-z]$/i.test(key)) guess(key.toUpperCase());
  });
  return (
    <>
      <svg
        className="hangman-art"
        viewBox="0 0 220 160"
        role="img"
        aria-label={`${wrong} of ${allowance} incorrect guesses`}
      >
        <path
          d="M25 148H140M55 148V15H150V35"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {wrong > 0 && (
          <circle
            cx="150"
            cy="50"
            r="15"
            fill="none"
            stroke="var(--game-accent)"
            strokeWidth="4"
          />
        )}
        {[
          "M150 65V105",
          "M150 75L125 92",
          "M150 75L175 92",
          "M150 105L128 135",
          "M150 105L172 135",
        ]
          .slice(0, Math.max(0, drawing - 1))
          .map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="var(--game-accent)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
      </svg>
      <p className="mini-clue">{clue}</p>
      <div className="word-slots" aria-label="Word to guess">
        {[...word].map((letter, i) => (
          <span key={i}>{letters.includes(letter) || done ? letter : "_"}</span>
        ))}
      </div>
      <p className="status" role="status">
        {allowance - wrong} mistakes remaining
      </p>
      <div className="alphabet">
        {[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((letter) => (
          <button
            key={letter}
            disabled={done || letters.includes(letter)}
            className={
              letters.includes(letter)
                ? word.includes(letter)
                  ? "correct"
                  : "incorrect"
                : ""
            }
            onClick={() => guess(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </>
  );
}
