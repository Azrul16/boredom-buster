import { readStore, writeStore } from "./storage";
import { games, type GameSlug } from "@/data/games";
import { difficulties, isDifficulty, type Difficulty } from "./difficulty";
export type SavedResult = {
  game: GameSlug;
  difficulty: Difficulty;
  score: number;
  won: boolean;
  at: string;
};
export type Profile = {
  xp: number;
  played: number;
  streak: number;
  lastDay: string;
  wins: Record<string, number>;
  best: Record<string, number>;
  modeBest: Record<string, Partial<Record<Difficulty, number>>>;
  results: SavedResult[];
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
  modeBest: {},
  results: [],
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
    xp: validNumber(p.xp),
    played: validNumber(p.played),
    streak: validNumber(p.streak),
    lastDay: typeof p.lastDay === "string" ? p.lastDay : "",
    wins: numberMap(p.wins),
    best: numberMap(p.best),
    modeBest: Object.fromEntries(
      games.map(({ slug }) => [
        slug,
        Object.fromEntries(
          difficulties.flatMap((mode) => {
            const value = p.modeBest?.[slug]?.[mode];
            return typeof value === "number" &&
              Number.isFinite(value) &&
              value > 0
              ? [[mode, value]]
              : [];
          }),
        ),
      ]),
    ),
    results: Array.isArray(p.results)
      ? p.results
          .filter(
            (result): result is SavedResult =>
              !!result &&
              typeof result === "object" &&
              games.some((g) => g.slug === result.game) &&
              isDifficulty(result.difficulty) &&
              typeof result.score === "number" &&
              Number.isFinite(result.score) &&
              result.score >= 0 &&
              typeof result.won === "boolean" &&
              typeof result.at === "string" &&
              Number.isFinite(Date.parse(result.at)),
          )
          .slice(-100)
      : [],
    achievements: Array.isArray(p.achievements)
      ? p.achievements.filter((value) => typeof value === "string")
      : [],
    daily:
      p.daily?.date === localDay()
        ? {
            ...p.daily,
            penWins: validNumber(p.daily.penWins),
            done: Array.isArray(p.daily.done)
              ? p.daily.done.filter((value) => typeof value === "string")
              : [],
          }
        : { date: localDay(), done: [], penWins: 0 },
  };
}
function validNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}
function numberMap(value: unknown): Record<string, number> {
  return value && typeof value === "object"
    ? Object.fromEntries(
        Object.entries(value).filter(
          ([, n]) => typeof n === "number" && Number.isFinite(n) && n >= 0,
        ),
      )
    : {};
}
function updateModeBest(
  p: Profile,
  slug: GameSlug,
  mode: Difficulty,
  score: number,
) {
  if (!Number.isFinite(score) || score <= 0) return;
  const low = slug === "reaction-time" || slug === "memory-match";
  const old = p.modeBest[slug]?.[mode];
  p.modeBest[slug] = {
    ...p.modeBest[slug],
    [mode]:
      old === undefined
        ? score
        : low
          ? Math.min(old, score)
          : Math.max(old, score),
  };
}
export function saveBest(
  slug: GameSlug,
  score: number,
  difficulty: Difficulty = "medium",
) {
  const p = getProfile();
  if (!Number.isFinite(score) || score <= 0)
    return p.modeBest[slug]?.[difficulty];
  const previous = p.modeBest[slug]?.[difficulty];
  const low = slug === "reaction-time" || slug === "memory-match";
  if (previous !== undefined && (low ? score >= previous : score <= previous))
    return previous;
  updateModeBest(p, slug, difficulty, score);
  p.best[slug] =
    slug === "reaction-time" || slug === "memory-match"
      ? Math.min(p.best[slug] ?? Infinity, score)
      : Math.max(p.best[slug] ?? 0, score);
  const key =
    slug === "snake"
      ? "snake_highscore"
      : slug === "2048"
        ? "2048_best"
        : slug === "flappy"
          ? "flappy_best"
          : null;
  if (key) writeStore(key, p.best[slug]);
  writeStore("profile", p);
  window.dispatchEvent(new Event("timepass-progress"));
  return p.modeBest[slug]?.[difficulty];
}
export function recordGame(
  slug: GameSlug,
  score: number,
  won = false,
  details?: { tile?: number },
  difficulty: Difficulty = "medium",
) {
  const p = getProfile();
  if (!Number.isFinite(score) || score < 0) return p;
  p.results = [
    ...p.results,
    { game: slug, difficulty, score, won, at: new Date().toISOString() },
  ].slice(-100);
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
    updateModeBest(p, slug, difficulty, score);
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
