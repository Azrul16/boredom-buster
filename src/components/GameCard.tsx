"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Trophy,
  Heart,
  CheckCircle2,
  Target,
} from "lucide-react";
import { Game, route } from "@/data/games";
import { botGames } from "./Bot";
import { GameThumbnail, illustratedGames } from "./GameThumbnail";
import { usePersonalization } from "./Personalization";
export function GameArt({
  game,
  large = false,
}: {
  game: Game;
  large?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`game-art ${game.color} art-${game.slug} ${large ? "large" : ""}`}
    >
      <div className="art-grid" />
      {illustratedGames.has(game.slug) ? (
        <GameThumbnail slug={game.slug} />
      ) : game.slug === "pen-fight" ? (
        <>
          <span className="desk-line" />
          <i className="pen pen-one" />
          <i className="pen pen-two" />
          <span className="flick-arc">↗</span>
        </>
      ) : game.slug === "tic-tac-toe" ? (
        <div className="mini-ttt">
          {["×", "", "○", "", "×", "", "○", "", "×"].map((x, i) => (
            <span key={i}>{x}</span>
          ))}
        </div>
      ) : game.slug === "reaction-time" ? (
        <div className="reaction-art">
          <span>ϟ</span>
        </div>
      ) : game.slug === "2048" ? (
        <div className="mini-tiles">
          <b>2</b>
          <b>8</b>
          <b>16</b>
          <b>2048</b>
        </div>
      ) : game.slug === "snake" ? (
        <div className="snake-art">
          ▰▰
          <br />
          　▰
          <br />
          　▰▰
          <i />
        </div>
      ) : (
        <span className="art-symbol">{game.icon}</span>
      )}
    </div>
  );
}
export function GameCard({
  game,
  featured = false,
  best,
  challenge,
}: {
  game: Game;
  featured?: boolean;
  best?: number;
  challenge?: { title: string; done: boolean };
}) {
  const { preferences, toggleFavorite } = usePersonalization();
  const saved = preferences.favorites.includes(game.slug);
  return (
    <div className="game-card-wrap">
      <Link
        href={route(game)}
        className={`game-card ${featured ? "featured" : ""}`}
      >
        <div className="art-container">
          <GameArt game={game} />
          {challenge && (
            <span
              className={`daily-card-badge ${challenge.done ? "daily-done" : ""}`}
              title={challenge.title}
              aria-label={`${challenge.title}${challenge.done ? ": complete" : ""}`}
            >
              {challenge.done ? (
                <CheckCircle2 size={14} />
              ) : (
                <Target size={14} />
              )}
            </span>
          )}
          {botGames.has(game.slug) && (
            <span className="card-opponent">VS ZIGGY</span>
          )}
        </div>
        <div className="card-copy">
          <div className="card-title">
            <h3>{game.title}</h3>
            <span className="card-arrow">
              <ArrowUpRight size={19} />
            </span>
          </div>
          {challenge && <p className="daily-card-target">{challenge.title}</p>}
          {best !== undefined && (
            <span className="card-best">
              <Trophy size={12} />
              Best {best}
              {game.slug === "reaction-time" ? " ms" : ""}
            </span>
          )}
        </div>
      </Link>
      <button
        className={`favorite-button ${saved ? "is-favorite" : ""}`}
        aria-label={`${saved ? "Unfavorite" : "Favorite"} ${game.title}`}
        aria-pressed={saved}
        title={saved ? "Remove favorite" : "Save favorite"}
        onClick={() => toggleFavorite(game.slug)}
      >
        <Heart size={15} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
