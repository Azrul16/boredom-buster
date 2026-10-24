"use client";
import { useState, type FormEvent } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";

function problem(maximum = 12) {
  const a = Math.floor(Math.random() * maximum) + 1,
    b = Math.floor(Math.random() * maximum) + 1;
  const kind = Math.floor(Math.random() * 3);
  return kind === 0
    ? { text: `${a} + ${b}`, answer: a + b }
    : kind === 1
      ? {
          text: `${Math.max(a, b)} − ${Math.min(a, b)}`,
          answer: Math.abs(a - b),
        }
      : { text: `${a} × ${b}`, answer: a * b };
}
export default function Game() {
  return <MiniGame slug="math-challenge" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const maximum = [6, 12, 25][level],
    target = level === 2 ? 9 : 7;
  const [question, setQuestion] = useState(() => problem(maximum));
  const [input, setInput] = useState("");
  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (done || !input.trim() || !Number.isFinite(Number(input))) return;
    const right = Number(input) === question.answer,
      total = correct + Number(right);
    setCorrect(total);
    if (round === 10) {
      setDone(true);
      complete(total * 10, total >= target, `${total} out of 10 correct!`);
    } else {
      setMessage(right ? "Correct!" : `Answer: ${question.answer}`);
      setRound(round + 1);
      setQuestion(problem(maximum));
      setInput("");
    }
  }
  return (
    <>
      <div className="mini-metrics">
        <span>
          Question <b>{round}/10</b>
        </span>
        <span>
          Correct <b>{correct}</b>
        </span>
      </div>
      <div className="math-question" aria-label={`Question: ${question.text}`}>
        {question.text}
        <span> = ?</span>
      </div>
      <form className="mini-form" onSubmit={submit}>
        <label htmlFor="math-answer">Your answer</label>
        <input
          id="math-answer"
          type="number"
          inputMode="numeric"
          required
          step="1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="button" type="submit" disabled={done}>
          Submit answer
        </button>
      </form>
      <p className="status" role="status">
        {message}
      </p>
    </>
  );
}
