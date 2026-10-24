"use client";
import { useEffect, useLayoutEffect, useId, useRef } from "react";
import type { CSSProperties } from "react";
import { Trophy, Medal } from "lucide-react";
import { usePersonalization } from "./Personalization";

export default function GameResult({
  title,
  stats,
  celebrate = false,
  onContinue,
  eyebrow = "",
  subtitle = "",
  scoreLabel = "Result",
  highlight,
}: {
  title: string;
  stats: readonly (readonly [string, string | number])[];
  celebrate?: boolean;
  onContinue: () => void;
  eyebrow?: string;
  subtitle?: string;
  scoreLabel?: string;
  highlight?: number;
}) {
  const { preferences } = usePersonalization();
  const dialog = useRef<HTMLDialogElement>(null),
    titleId = useId(),
    action = useRef(onContinue);
  useLayoutEffect(() => {
    action.current = onContinue;
  });
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    const timer = preferences.autoReplay
      ? setTimeout(() => action.current(), 1000)
      : undefined;
    return () => {
      clearTimeout(timer);
      element.close();
    };
  }, [preferences.autoReplay]);
  return (
    <dialog
      ref={dialog}
      className={`pen-result-dialog ${celebrate ? "result-victory" : "result-defeat"} match-final`}
      aria-labelledby={titleId}
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
      }}
    >
      <div className="pen-result-card">
        {celebrate && (
          <div className="pen-confetti" aria-hidden="true">
            {Array.from({ length: 32 }, (_, i) => {
              const angle = i * 2.399;
              return (
                <i
                  key={i}
                  style={
                    {
                      "--burst-x": `${Math.sin(angle) * (80 + (i % 7) * 20)}px`,
                      "--burst-y": `${-100 - (i % 5) * 25}px`,
                      "--fall": `${170 + (i % 6) * 35}px`,
                      "--spin": `${(i % 2 ? 1 : -1) * (400 + i * 21)}deg`,
                      "--delay": `${(i % 8) * 0.035}s`,
                      "--confetti-color": [
                        "#bca0ff",
                        "#ffd77f",
                        "#7ce6bd",
                        "#ffaaa0",
                      ][i % 4],
                    } as CSSProperties
                  }
                />
              );
            })}
          </div>
        )}
        {eyebrow && <span className="result-eyebrow">{eyebrow}</span>}
        <div className="result-medal" aria-hidden="true">
          {celebrate ? <Trophy size={43} /> : <Medal size={43} />}
        </div>
        <h2 id={titleId}>{title}</h2>
        {subtitle && <p className="result-subtitle">{subtitle}</p>}
        <div
          className="result-scoreboard"
          aria-label={
            scoreLabel +
            ": " +
            stats.map(([label, value]) => label + " " + value).join(", ")
          }
        >
          {stats.map(([label, value], i) => (
            <div key={label} className={highlight === i ? "round-winner" : ""}>
              <span>{label}</span>
              <strong
                className={
                  String(value).length > 4 ? "compact-result" : undefined
                }
              >
                {value}
              </strong>
            </div>
          ))}
        </div>
        {preferences.autoReplay ? (
          <div className="result-timebar" aria-label="Next game in one second">
            <i />
          </div>
        ) : (
          <button className="button manual-rematch" onClick={onContinue}>
            Play again
          </button>
        )}
      </div>
    </dialog>
  );
}
