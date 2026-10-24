"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { readStore, writeStore } from "@/lib/storage";
import {
  cleanPersonalization,
  defaultPersonalization,
  palettes,
  type Personalization,
  type PaletteId,
} from "@/lib/personalization";
import type { GameSlug } from "@/data/games";

type PersonalizationContextValue = {
  preferences: Personalization;
  change: (patch: Partial<Personalization>) => void;
  toggleFavorite: (slug: GameSlug) => void;
  visit: (slug: GameSlug) => void;
  color: (slug: GameSlug, value?: PaletteId) => void;
  resetAppearance: () => void;
};
const Context = createContext<PersonalizationContextValue>({
  preferences: defaultPersonalization,
  change: () => {},
  toggleFavorite: () => {},
  visit: () => {},
  color: () => {},
  resetAppearance: () => {},
});
export const usePersonalization = () => useContext(Context);
export function useGameLook(slug: GameSlug) {
  const { preferences } = usePersonalization();
  const id = preferences.gameColors[slug];
  return {
    palette: id ? palettes[id] : undefined,
    surface: preferences.surface,
  };
}
export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPersonalization);
  const current = useRef<Personalization | null>(null);
  const update = useCallback(
    (transform: (value: Personalization) => Personalization) => {
      const next = cleanPersonalization(
        transform(
          current.current ??
            cleanPersonalization(readStore("personalization", null)),
        ),
      );
      current.current = next;
      setPreferences(next);
      writeStore("personalization", next);
    },
    [],
  );
  useEffect(() => {
    const sync = () => {
      const next = cleanPersonalization(readStore("personalization", null));
      current.current = next;
      setPreferences(next);
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const palette = palettes[preferences.accent];
      root.style.setProperty(
        "--accent",
        root.dataset.theme === "light" ? palette.ink : palette.base,
      );
      root.style.setProperty("--primary", palette.ink);
      root.style.setProperty("--personal-color", palette.base);
    };
    root.dataset.surface = preferences.surface;
    root.dataset.density = preferences.density;
    root.dataset.focus = String(preferences.focus);
    root.dataset.effects = String(preferences.effects);
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [
    preferences.accent,
    preferences.surface,
    preferences.density,
    preferences.focus,
    preferences.effects,
  ]);
  const change = useCallback(
    (patch: Partial<Personalization>) =>
      update((value) => ({ ...value, ...patch })),
    [update],
  );
  const toggleFavorite = useCallback(
    (slug: GameSlug) =>
      update((value) => ({
        ...value,
        favorites: value.favorites.includes(slug)
          ? value.favorites.filter((item) => item !== slug)
          : [...value.favorites, slug],
      })),
    [update],
  );
  const visit = useCallback(
    (slug: GameSlug) =>
      update((value) => ({
        ...value,
        recent: [slug, ...value.recent.filter((item) => item !== slug)],
      })),
    [update],
  );
  const color = useCallback(
    (slug: GameSlug, palette?: PaletteId) =>
      update((value) => {
        const gameColors = { ...value.gameColors };
        if (palette) gameColors[slug] = palette;
        else delete gameColors[slug];
        return { ...value, gameColors };
      }),
    [update],
  );
  const resetAppearance = useCallback(
    () =>
      update((value) => ({
        ...defaultPersonalization,
        autoReplay: value.autoReplay,
        favorites: value.favorites,
        recent: value.recent,
      })),
    [update],
  );
  return (
    <Context.Provider
      value={{
        preferences,
        change,
        toggleFavorite,
        visit,
        color,
        resetAppearance,
      }}
    >
      {children}
    </Context.Provider>
  );
}
