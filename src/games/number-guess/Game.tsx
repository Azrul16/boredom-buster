"use client";
import { useState, type FormEvent } from "react";
import MiniGame, { type RoundProps } from "@/games/shared/MiniGame";

export default function Game() {
  return <MiniGame slug="number-guess" board={Board} />;
}
function Board({ complete, level }: RoundProps) {
  const maximum = [50, 100, 500][level],
    allowance = level === 0 ? 8 : 7;
  const [secret] = useState(() => Math.floor(Math.random() * maximum) + 1);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<number[]>([]);
  const [range, setRange] = useState([1, maximum]);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    const value = Number(input);
    if (
      done ||
      !input.trim() ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > maximum
    )
      return;
    if (history.includes(value)) {
      setMessage("Already tried.");
      return;
    }
    const next = [...history, value];
    setHistory(next);
    setInput("");
    if (value === secret || next.length === allowance) {
      setDone(true);
      complete(
        value === secret ? 110 - next.length * 10 : 0,
        value === secret,
        value === secret ? "You found the number!" : `The number was ${secret}`,
      );
    } else {
      setMessage(value < secret ? "Higher" : "Lower");
      setRange(
        value < secret
          ? [Math.max(range[0], value + 1), range[1]]
          : [range[0], Math.min(range[1], value - 1)],
      );
    }
  }
  return (
    <>
      <div className="number-range">
        <span>{range[0]}</span>
        <small>to</small>
        <span>{range[1]}</span>
      </div>
      <form className="mini-form" onSubmit={submit}>
        <label htmlFor="number-answer">Your guess (1–{maximum})</label>
        <input
          id="number-answer"
          type="number"
          inputMode="numeric"
          required
          min={1}
          max={maximum}
          step={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="button" type="submit" disabled={done}>
          Guess number
        </button>
      </form>
      <p className="status" role="status">
        {message}
      </p>
      <p className="mini-note">
        {allowance - history.length} guesses left · Tried:{" "}
        {history.join(", ") || "none"}
      </p>
    </>
  );
}
