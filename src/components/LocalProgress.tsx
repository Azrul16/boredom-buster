"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Download,
  HardDrive,
  Trophy,
  History,
  ArrowUpRight,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { useProfile } from "./Dashboard";
import { games } from "@/data/games";
import { difficulties, modeNames, type Difficulty } from "@/lib/difficulty";
import { getProfile } from "@/lib/progress";
import { readStore } from "@/lib/storage";
import { cleanPersonalization } from "@/lib/personalization";
import type { SavedResult } from "@/lib/progress";

export default function LocalProgress() {
  const profile = useProfile();
  const [filter, setFilter] = useState<"all" | Difficulty>("all");
  const [exported, setExported] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  async function shareResult(result: SavedResult) {
    const title = games.find((game) => game.slug === result.game)!.title;
    const text = `${title} · ${modeNames[result.difficulty]} · ${result.score}${result.game === "reaction-time" ? " ms" : ""}${result.won ? " · Win" : ""}`;
    const url = `${location.origin}/games/${result.game}/`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Boredom Buster", text, url });
        setShareStatus("");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareStatus("Result copied");
      } else setShareStatus("Sharing unavailable in this browser");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setShareStatus("Could not share this result");
    }
  }
  const results = profile.results
    .filter((result) => filter === "all" || result.difficulty === filter)
    .reverse();
  const recorded = games.filter(
    (game) =>
      profile.best[game.slug] !== undefined ||
      difficulties.some(
        (mode) => profile.modeBest[game.slug]?.[mode] !== undefined,
      ),
  );
  function download() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: getProfile(),
      preferences: {
        theme: readStore("theme", "dark"),
        muted: readStore("muted", true),
        difficulty: Object.fromEntries(
          games.map((game) => [
            game.slug,
            readStore(`difficulty_${game.slug}`, "medium"),
          ]),
        ),
        personalization: cleanPersonalization(
          readStore("personalization", null),
        ),
      },
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `boredom-buster-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
  }
  return (
    <div className="wrap info-page progress-page">
      <div className="info-intro">
        <span className="section-eyebrow">
          <HardDrive size={14} /> SAVED ON THIS DEVICE
        </span>
        <h1>
          Your games.
          <br />
          <em>Your personal bests.</em>
        </h1>
        <p>
          Your results save in this browser, online or offline. Easy, Medium,
          and Hard records stay separate, so every new challenge gets a fresh
          start.
        </p>
      </div>
      <div className="local-record-summary">
        <div>
          <strong>{profile.played}</strong>
          <span>Rounds finished</span>
        </div>
        <div>
          <strong>{recorded.length}</strong>
          <span>Games with records</span>
        </div>
        <div>
          <strong>{profile.xp}</strong>
          <span>Lifetime XP</span>
        </div>
        <button className="button secondary" onClick={download}>
          <Download size={16} /> Download backup
        </button>
      </div>
      <p className="backup-feedback" aria-live="polite">
        {exported
          ? "Backup downloaded. Keep the JSON file somewhere safe."
          : "No account needed. A backup gives you a separate copy on your machine."}
      </p>
      <section className="local-record-section">
        <div className="more-heading">
          <div>
            <span className="section-eyebrow">
              <Trophy size={13} /> YOUR RECORDS
            </span>
            <h2>Best by difficulty</h2>
          </div>
        </div>
        {recorded.length ? (
          <div className="record-grid">
            {recorded.map((game) => (
              <Link className="record-card" href={game.route} key={game.slug}>
                <div>
                  <h3>{game.title}</h3>
                  <ArrowUpRight size={16} />
                </div>
                <div className="record-modes">
                  {difficulties.map((mode) => (
                    <span key={mode}>
                      {modeNames[mode]}
                      <b>
                        {profile.modeBest[game.slug]?.[mode] ?? "—"}
                        {profile.modeBest[game.slug]?.[mode] !== undefined &&
                        game.slug === "reaction-time"
                          ? " ms"
                          : ""}
                      </b>
                    </span>
                  ))}
                </div>
                {profile.best[game.slug] !== undefined && (
                  <small>
                    All-time best: {profile.best[game.slug]}
                    {game.slug === "reaction-time" ? " ms" : ""} · includes
                    earlier records
                  </small>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <Trophy size={28} />
            <h2>Your first best is waiting.</h2>
            <p>Finish a round to start your local record book.</p>
            <Link className="button" href="/games/">
              Pick a game <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
        <p className="mini-note">
          Lower is better for Reaction Time and Memory Match. Earlier scores
          stay in your all-time record; new scores are also saved under their
          difficulty.
        </p>
      </section>
      <section className="local-record-section">
        <div className="more-heading">
          <div>
            <span className="section-eyebrow">
              <History size={13} /> RECENT ROUNDS
            </span>
            <h2>A little play history</h2>
          </div>
          <label className="history-filter">
            Mode
            <select
              aria-label="Filter results by difficulty"
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="all">All modes</option>
              {difficulties.map((mode) => (
                <option value={mode} key={mode}>
                  {modeNames[mode]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {results.length ? (
          <div className="results-table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Mode</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Played</th>
                  <th>
                    <span className="sr-only">Share</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, i) => (
                  <tr key={`${result.at}:${i}`}>
                    <td>
                      <Link href={`/games/${result.game}/`}>
                        {games.find((game) => game.slug === result.game)?.title}
                      </Link>
                    </td>
                    <td>{modeNames[result.difficulty]}</td>
                    <td>
                      {result.score}
                      {result.game === "reaction-time" ? " ms" : ""}
                    </td>
                    <td>
                      <span className={result.won ? "round-won" : ""}>
                        {result.won ? "Win" : "Finished"}
                      </span>
                    </td>
                    <td>
                      {new Date(result.at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <button
                        className="share-result"
                        aria-label={`Share ${games.find((game) => game.slug === result.game)?.title} result`}
                        title="Share result"
                        onClick={() => void shareResult(result)}
                      >
                        <Share2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="history-empty">
            No completed rounds
            {filter === "all" ? " yet" : ` in ${modeNames[filter]} mode yet`}.
            Your next round starts the story.
          </p>
        )}
        <p className="share-status" aria-live="polite">
          {shareStatus}
        </p>
        <p className="mini-note">
          Your 100 most recent results are kept. Best scores and lifetime totals
          stay saved beyond that.
        </p>
      </section>
      <div className="privacy-promise">
        <ShieldCheck size={23} />
        <p>
          These records belong to this browser on this device. Clearing site
          data removes them. Private browsing may discard them when the session
          ends.{" "}
          <Link href="/privacy/" className="text-link">
            How saving works <ArrowUpRight size={13} />
          </Link>
        </p>
      </div>
    </div>
  );
}
