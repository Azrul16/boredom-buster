import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Game, route } from "@/data/games";
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
      {game.slug === "pen-fight" ? (
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
}: {
  game: Game;
  featured?: boolean;
  best?: number;
}) {
  return (
    <Link
      href={route(game)}
      className={`game-card ${featured ? "featured" : ""}`}
    >
      <div className="art-container">
        <GameArt game={game} />
      </div>
      <div className="card-copy">
        <div className="card-title">
          <h3>{game.title}</h3>
          <span className="card-arrow">
            <ArrowUpRight size={19} />
          </span>
        </div>
        {best !== undefined && (
          <span className="card-best">
            Best {best}
            {game.slug === "reaction-time" ? " ms" : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
