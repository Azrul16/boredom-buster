"use client";
import { useEffect, useState } from "react";
import { RotateCcw, Pause, Play, Maximize2, Minimize2 } from "lucide-react";
import { Mute } from "./SoundToggle";
export function Toolbar({
  stats,
  onRestart,
  paused,
  onPause,
}: {
  stats: [string, string | number][];
  onRestart: () => void;
  paused?: boolean;
  onPause?: () => void;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const sync = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  return (
    <div
      className="game-toolbar"
      role="group"
      aria-label="Scores and game controls"
    >
      <div className="stats">
        {stats.map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <b
              className={
                typeof value === "string" && value.length > 5
                  ? "text-stat"
                  : undefined
              }
            >
              {value}
            </b>
          </div>
        ))}
      </div>
      <div className="toolbar-actions">
        <button
          className="icon-button fullscreen-button"
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen game"}
          title={fullscreen ? "Exit fullscreen" : "Fullscreen game"}
          aria-pressed={fullscreen}
          onClick={(event) => {
            const stage = event.currentTarget.closest(".game-stage");
            if (document.fullscreenElement)
              void document.exitFullscreen().catch(() => {});
            else if (stage?.requestFullscreen)
              void stage.requestFullscreen().catch(() => {});
          }}
        >
          {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
        {onPause && (
          <button
            className="icon-button"
            aria-label={paused ? "Resume" : "Pause"}
            title={paused ? "Resume game" : "Pause game"}
            aria-pressed={!!paused}
            onClick={onPause}
          >
            {paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
        )}
        <Mute />
        <button
          className="button secondary small restart-button"
          title="Restart this round"
          onClick={onRestart}
        >
          <RotateCcw size={14} />
          Restart
        </button>
      </div>
    </div>
  );
}
export function Directions({
  onMove,
}: {
  onMove: (direction: number) => void;
}) {
  return (
    <div className="direction-pad" aria-label="Direction controls">
      {["↑", "←", "↓", "→"].map((x, i) => (
        <button
          key={x}
          aria-label={["Move up", "Move left", "Move down", "Move right"][i]}
          onClick={() => onMove([0, 3, 2, 1][i])}
        >
          {x}
        </button>
      ))}
    </div>
  );
}
export function Overlay({
  title,
  description,
  button,
  onStart,
}: {
  title: string;
  description: string;
  button: string;
  onStart: () => void;
}) {
  return (
    <div className="canvas-overlay">
      <span className="overlay-emblem" aria-hidden="true">
        <Play size={27} fill="currentColor" />
      </span>
      <h2>{title}</h2>
      <span className="sr-only">{description}</span>
      <button
        className="button"
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        {button}
      </button>
    </div>
  );
}
