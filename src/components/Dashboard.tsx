"use client";
import { useEffect, useState } from "react";
import { Search, Shuffle, X, Heart, History, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { games } from "@/data/games";
import { GameCard } from "./GameCard";
import { emptyProfile, getProfile, challenges, localDay } from "@/lib/progress";
import { usePersonalization } from "./Personalization";
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
  const router = useRouter();
  const [filter, setFilter] = useState("All games"),
    [search, setSearch] = useState("");
  const profile = useProfile();
  const { preferences } = usePersonalization();
  const daily = challenges();
  const completedDaily =
    profile.daily.date === localDay() ? profile.daily.done : [];
  const catalog =
    filter === "Recent"
      ? preferences.recent.flatMap(
          (slug) => games.find((game) => game.slug === slug) ?? [],
        )
      : games;
  const visible = catalog.filter(
    (g) =>
      (filter === "All games" ||
        filter === "Recent" ||
        (filter === "Favorites" && preferences.favorites.includes(g.slug)) ||
        (filter === "Daily" &&
          daily.some((challenge) => challenge.slug === g.slug)) ||
        g.category === filter) &&
      `${g.title} ${g.description} ${g.help}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <section className="wrap game-library" id="all-games">
      <div className="library-heading">
        <h1>
          Games <span>{games.length}</span>
        </h1>
        <div className="library-tools">
          <button
            className="quick-play-icon"
            aria-label="Pick a game for me"
            title="Random game"
            onClick={() =>
              router.push(games[Math.floor(Math.random() * games.length)].route)
            }
          >
            <Shuffle size={18} />
          </button>
          <label className="game-search">
            <Search size={17} />
            <input
              aria-label="Search games"
              placeholder="Search games"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="clear-search"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </label>
        </div>
      </div>
      <div className="library-filters" role="group" aria-label="Filter games">
        {[
          "All games",
          "Favorites",
          "Recent",
          "Daily",
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
            aria-label={f}
          >
            {f === "Favorites" && <Heart size={13} />}
            {f === "Recent" && <History size={13} />}
            {f === "Daily" && <CalendarDays size={13} />}
            {f}
            <span className="filter-count" aria-hidden="true">
              {f === "Daily"
                ? `${completedDaily.length}/${daily.length}`
                : f === "Favorites"
                  ? preferences.favorites.length
                  : f === "Recent"
                    ? preferences.recent.length
                    : f === "All games"
                      ? games.length
                      : games.filter((g) => g.category === f).length}
            </span>
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        {visible.length} games found
      </span>
      <div className="games-grid">
        {visible.map((game) => (
          <GameCard
            key={game.slug}
            game={game}
            best={profile.best[game.slug]}
            challenge={
              filter === "Daily"
                ? daily
                    .filter((item) => item.slug === game.slug)
                    .map((item) => ({
                      title: item.title,
                      done: completedDaily.includes(item.id),
                    }))[0]
                : undefined
            }
          />
        ))}
      </div>
      {!visible.length && (
        <div className="catalog-empty">
          <Search size={30} />
          <h2>
            {!search && filter === "Favorites"
              ? "No favorites yet."
              : !search && filter === "Recent"
                ? "No recent games."
                : "No games found."}
          </h2>
          <button
            className="button secondary"
            onClick={() => {
              setSearch("");
              setFilter("All games");
            }}
          >
            Show all games
          </button>
        </div>
      )}
    </section>
  );
}
