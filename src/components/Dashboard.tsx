"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { games } from "@/data/games";
import { GameCard } from "./GameCard";
import { emptyProfile, getProfile } from "@/lib/progress";
export function useProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  useEffect(() => {
    const update = () => setProfile(getProfile());
    update();
    window.addEventListener("timepass-progress", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("timepass-progress", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return profile;
}
export function GameGrid() {
  const [filter, setFilter] = useState("All games"),
    [search, setSearch] = useState("");
  const profile = useProfile();
  const visible = games.filter(
    (g) =>
      (filter === "All games" || g.category === filter) &&
      g.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="wrap game-library" id="all-games">
      <div className="library-heading">
        <h1>
          Games <span>{games.length}</span>
        </h1>
        <label className="game-search">
          <Search size={17} />
          <input
            aria-label="Search games"
            placeholder="Search games"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="library-filters" role="group" aria-label="Filter games">
        {[
          "All games",
          "Arcade",
          "Puzzle",
          "Strategy",
          "Reflex",
          "Physics",
          "Quick play",
        ].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "filter active" : "filter"}
            aria-pressed={filter === f}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="games-grid">
        {visible.map((game) => (
          <GameCard
            key={game.slug}
            game={game}
            best={profile.best[game.slug]}
          />
        ))}
      </div>
      {!visible.length && <p className="empty">No games found.</p>}
    </section>
  );
}
