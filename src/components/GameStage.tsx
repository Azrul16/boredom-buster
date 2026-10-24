"use client";
import { useEffect, type ReactNode, type CSSProperties } from "react";
import type { GameSlug } from "@/data/games";
import { useGameLook } from "./Personalization";

export function GameStage({
  slug,
  label,
  children,
}: {
  slug: GameSlug;
  label: string;
  children: ReactNode;
}) {
  const { palette } = useGameLook(slug);
  useEffect(() => {
    document.documentElement.dataset.playing = "true";
    return () => {
      delete document.documentElement.dataset.playing;
    };
  }, []);
  return (
    <section
      className={`game-stage game-theme-${slug}`}
      aria-label={label}
      data-custom-color={palette ? "true" : undefined}
      style={
        palette
          ? ({
              "--player-color": palette.base,
              "--player-light": palette.light,
              "--player-dark": palette.dark,
              "--game-accent": palette.base,
            } as CSSProperties)
          : undefined
      }
    >
      {children}
    </section>
  );
}
