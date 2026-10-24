import { readStore, writeStore } from "./storage";
import type { GameSlug } from "@/data/games";
export type Profile = {
  xp: number;
  played: number;
  streak: number;
  lastDay: string;
  wins: Record<string, number>;
  best: Record<string, number>;
  achievements: string[];
  daily: { date: string; done: string[]; penWins: number };
};
export const emptyProfile: Profile = {
  xp: 0,
  played: 0,
  streak: 0,
  lastDay: "",
  wins: {},
  best: {},
  achievements: [],
  daily: { date: "", done: [], penWins: 0 },
};
export const achievementList = [
  ["first", "First Game", "Play your first game"],
  ["speed", "Speed Demon", "React in under 200 ms"],
  ["snake", "Snake Master", "Score 1,000 in Snake"],
  ["pen", "Pen Champion", "Win 10 Pen Fight rounds"],
  ["puzzle", "Puzzle Brain", "Reach the 2048 tile"],
  ["memory", "Memory Master", "Match all pairs in under 20 moves"],
] as const;
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function challenges(day = localDay()) {
  const seed = Number(day.replaceAll("-", ""));
  return [
    {
      id: "snake",
      slug: "snake",
      title: `Score ${seed % 2 ? 500 : 700} in Snake`,
      target: seed % 2 ? 500 : 700,
    },
    {
      id: "reaction",
      slug: "reaction-time",
      title: `React in under ${seed % 2 ? 250 : 280} ms`,
      target: seed % 2 ? 250 : 280,
    },
    {
      id: "pen",
      slug: "pen-fight",
      title: "Win 2 Pen Fight rounds",
      target: 2,
    },
  ];
}
export function getProfile(): Profile {
  const p = readStore("profile", emptyProfile);
  if (!p || typeof p !== "object") return structuredClone(emptyProfile);
  return {
    ...emptyProfile,
    ...p,
    wins: { ...(p.wins || {}) },
    best: { ...(p.best || {}) },
    achievements: [...(p.achievements || [])],
    daily:
      p.daily?.date === localDay()
        ? { ...p.daily, done: [...p.daily.done] }
        : { date: localDay(), done: [], penWins: 0 },
  };
}
export function saveBest(slug: GameSlug, score: number) {
  const p = getProfile();
  if (score <= 0 || (p.best[slug] !== undefined && score <= p.best[slug]))
    return p.best[slug];
  p.best[slug] = score;
  writeStore("profile", p);
  const key =
    slug === "snake"
      ? "snake_highscore"
      : slug === "2048"
        ? "2048_best"
        : slug === "flappy"
          ? "flappy_best"
          : null;
  if (key) writeStore(key, score);
  window.dispatchEvent(new Event("timepass-progress"));
  return score;
}
export function recordGame(
  slug: GameSlug,
  score: number,
  won = false,
  details?: { tile?: number },
) {
  const p = getProfile();
  const today = localDay();
  if (p.lastDay !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    p.streak = p.lastDay === localDay(yesterday) ? p.streak + 1 : 1;
    p.lastDay = today;
  }
  p.played++;
  p.xp += 20;
  if (won) p.wins[slug] = (p.wins[slug] || 0) + 1;
  const low = slug === "reaction-time" || slug === "memory-match";
  if (score > 0 && (!low || won || slug === "reaction-time")) {
    p.best[slug] =
      p.best[slug] === undefined
        ? score
        : low
          ? Math.min(p.best[slug], score)
          : Math.max(p.best[slug], score);
    const keys: Partial<Record<GameSlug, string>> = {
      snake: "snake_highscore",
      "2048": "2048_best",
      "reaction-time": "reaction_best",
      "memory-match": "memory_best",
      flappy: "flappy_best",
    };
    if (keys[slug]) writeStore(keys[slug]!, p.best[slug]);
  }
  const unlock = (id: string, condition: boolean) => {
    if (condition && !p.achievements.includes(id)) {
      p.achievements.push(id);
      p.xp += 50;
    }
  };
  unlock("first", true);
  unlock("speed", slug === "reaction-time" && score > 0 && score < 200);
  unlock("snake", slug === "snake" && score >= 1000);
  unlock("pen", (p.wins["pen-fight"] || 0) >= 10);
  unlock("puzzle", slug === "2048" && (details?.tile || 0) >= 2048);
  unlock("memory", slug === "memory-match" && won && score < 20);
  if (slug === "pen-fight" && won) p.daily.penWins++;
  for (const c of challenges()) {
    const complete =
      c.id === "snake"
        ? slug === "snake" && score >= c.target
        : c.id === "reaction"
          ? slug === "reaction-time" && score > 0 && score < c.target
          : p.daily.penWins >= 2;
    if (complete && !p.daily.done.includes(c.id)) {
      p.daily.done.push(c.id);
      p.xp += 100;
    }
  }
  writeStore("profile", p);
  window.dispatchEvent(new Event("timepass-progress"));
  return p;
}
