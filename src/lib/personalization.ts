import { games, type GameSlug } from "@/data/games";

export const palettes = {
  violet: {
    name: "Violet",
    base: "#a78bfa",
    light: "#ddd0ff",
    dark: "#6843b2",
    ink: "#7443d4",
  },
  mint: {
    name: "Mint",
    base: "#65d8b0",
    light: "#b9f5dd",
    dark: "#237b63",
    ink: "#15795d",
  },
  ocean: {
    name: "Ocean",
    base: "#6eb8ff",
    light: "#c4e5ff",
    dark: "#32639f",
    ink: "#246db2",
  },
  coral: {
    name: "Coral",
    base: "#ff9d96",
    light: "#ffdad1",
    dark: "#aa514a",
    ink: "#b44743",
  },
  gold: {
    name: "Gold",
    base: "#f3c66d",
    light: "#ffe7b1",
    dark: "#9a6e2a",
    ink: "#91600b",
  },
} as const;
export type PaletteId = keyof typeof palettes;
export type GamePalette = {
  name: string;
  base: string;
  light: string;
  dark: string;
  ink: string;
};
export type Surface = "classic" | "midnight" | "arcade";
export type Personalization = {
  accent: PaletteId;
  surface: Surface;
  density: "compact" | "comfortable";
  focus: boolean;
  effects: boolean;
  autoReplay: boolean;
  favorites: GameSlug[];
  recent: GameSlug[];
  gameColors: Partial<Record<GameSlug, PaletteId>>;
};
export const defaultPersonalization: Personalization = {
  accent: "violet",
  surface: "classic",
  density: "compact",
  focus: false,
  effects: true,
  autoReplay: true,
  favorites: [],
  recent: [],
  gameColors: {},
};
export function isPalette(value: unknown): value is PaletteId {
  return typeof value === "string" && Object.hasOwn(palettes, value);
}
export function cleanPersonalization(value: unknown): Personalization {
  const data =
    value && typeof value === "object"
      ? (value as Partial<Personalization>)
      : {};
  const validSlugs = (input: unknown) =>
    Array.isArray(input)
      ? [
          ...new Set(
            input.filter((slug): slug is GameSlug =>
              games.some((game) => game.slug === slug),
            ),
          ),
        ].slice(0, games.length)
      : [];
  return {
    accent: isPalette(data.accent) ? data.accent : "violet",
    surface: ["classic", "midnight", "arcade"].includes(data.surface ?? "")
      ? data.surface!
      : "classic",
    density: data.density === "comfortable" ? "comfortable" : "compact",
    focus: data.focus === true,
    effects: data.effects !== false,
    autoReplay: data.autoReplay !== false,
    favorites: validSlugs(data.favorites),
    recent: validSlugs(data.recent),
    gameColors: Object.fromEntries(
      games.flatMap(({ slug }) => {
        const color = data.gameColors?.[slug];
        return isPalette(color) ? [[slug, color]] : [];
      }),
    ),
  };
}
