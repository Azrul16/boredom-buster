"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { HardDrive, Info, Trophy } from "lucide-react";
import Link from "next/link";
import type { GameSlug } from "@/data/games";
import {
  difficulties,
  isDifficulty,
  modeNames,
  modeTips,
  type Difficulty,
} from "@/lib/difficulty";
import { readStore, writeStore } from "@/lib/storage";
import { getProfile } from "@/lib/progress";
import { Customize } from "./Customize";
import { usePersonalization } from "./Personalization";

const DifficultyContext = createContext<Difficulty>("medium");
export function useDifficulty() {
  const difficulty = useContext(DifficultyContext);
  return { difficulty, level: difficulties.indexOf(difficulty) };
}
export function GameSettings({
  slug,
  children,
}: {
  slug: GameSlug;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<Difficulty>("medium");
  const [ready, setReady] = useState(false);
  const [best, setBest] = useState<number>();
  const [saving, setSaving] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const { visit } = usePersonalization();
  useEffect(() => {
    visit(slug);
  }, [slug, visit]);
  useEffect(() => {
    const stored = readStore<unknown>(`difficulty_${slug}`, "medium");
    setMode(isDifficulty(stored) ? stored : "medium");
    setReady(true);
  }, [slug]);
  useEffect(() => {
    const sync = () => setBest(getProfile().modeBest[slug]?.[mode]);
    const status = (event: Event) =>
      setSaving((event as CustomEvent<boolean>).detail);
    sync();
    try {
      const key = "timepass_storage_probe";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      setSaving(true);
    } catch {
      setSaving(false);
    }
    window.addEventListener("timepass-progress", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("timepass-storage", status);
    return () => {
      window.removeEventListener("timepass-progress", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("timepass-storage", status);
    };
  }, [slug, mode]);
  return (
    <DifficultyContext.Provider value={mode}>
      <section className="game-settings" aria-label="Game settings">
        <div className="mode-buttons" role="group" aria-label="Game difficulty">
          {difficulties.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => {
                if (value !== mode) {
                  setMode(value);
                  writeStore(`difficulty_${slug}`, value);
                }
              }}
            >
              {modeNames[value]}
            </button>
          ))}
        </div>
        <div className="mode-utilities">
          <Customize game={slug} />
          {best !== undefined && (
            <span
              className="mode-personal-best"
              title={`${modeNames[mode]} personal best`}
              aria-label={`${modeNames[mode]} best: ${best ?? "none"}`}
            >
              <Trophy size={12} />
              <b>
                {best ?? "—"}
                {best !== undefined && slug === "reaction-time" ? " ms" : ""}
              </b>
            </span>
          )}
          <button
            className="mode-info-button"
            aria-label="Difficulty info"
            aria-expanded={showInfo}
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info size={15} />
          </button>
          <Link
            href="/progress/"
            className={`local-save-note ${saving ? "" : "save-unavailable"}`}
            title={saving ? "Saved on this device" : "Saving unavailable"}
            aria-label={saving ? "Local records" : "Saving unavailable"}
          >
            <HardDrive size={13} />
            {saving ? (
              <span className="sr-only">Saved on this device</span>
            ) : (
              "Saving unavailable"
            )}
          </Link>
        </div>
        {showInfo && (
          <p className="mode-tip">
            {modeTips[slug][difficulties.indexOf(mode)]}
            <small>Changing mode starts a fresh round.</small>
          </p>
        )}
      </section>
      {ready ? (
        <div key={`${slug}:${mode}`}>{children}</div>
      ) : (
        <p className="status">Loading your settings…</p>
      )}
    </DifficultyContext.Provider>
  );
}
