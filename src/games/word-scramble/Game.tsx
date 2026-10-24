"use client";
import { useState, type FormEvent } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";
import { pickWord, scramble } from "@/games/shared/puzzles";

export default function Game() {
  return <MiniGame slug="word-scramble" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const allowance = [7, 5, 3][level];
  const [[word, clue]] = useState(() => pickWord(level));
  const [mixed, setMixed] = useState(() => scramble(word));
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (done || !answer.trim()) return;
    const count = attempts + 1,
      won = answer.trim().toUpperCase() === word;
    setAttempts(count);
    if (won || count === allowance) {
      setDone(true);
      complete(
        won ? Math.round(((allowance + 1 - count) / allowance) * 100) : 0,
        won,
        won ? "Unscrambled!" : `The word was ${word}`,
      );
    } else {
      setMessage("Try again.");
      setAnswer("");
    }
  }
  return (
    <>
      <div
        className="word-slots scramble-tiles"
        aria-label={`Scrambled letters: ${mixed}`}
      >
        {[...mixed].map((letter, i) => (
          <span key={i}>{letter}</span>
        ))}
      </div>
      <p className="mini-clue">Hint: {clue}</p>
      <form className="mini-form" onSubmit={submit}>
        <label htmlFor="scramble-answer">Your word</label>
        <input
          id="scramble-answer"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button className="button" type="submit" disabled={done}>
          Check word
        </button>
      </form>
      <div className="game-options">
        <button
          className="button secondary"
          onClick={() => setMixed(scramble(word))}
        >
          Shuffle letters
        </button>
      </div>
      <p className="status" role="status">
        {message} {allowance - attempts} guesses left.
      </p>
    </>
  );
}
