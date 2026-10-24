"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gamepad2, Sun, Moon, Volume2, VolumeX } from "lucide-react";
import { readStore, writeStore } from "@/lib/storage";
export function Shell({ children }: { children: React.ReactNode }) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const value = readStore(
      "theme",
      matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark",
    );
    setLight(value === "light");
    document.documentElement.dataset.theme = value;
  }, []);
  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
    writeStore("theme", next ? "light" : "dark");
  }
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <div className="nav wrap">
          <Link href="/" className="logo">
            <span className="logo-icon">
              <Gamepad2 size={23} />
            </span>
            <span>Boredom Buster</span>
          </Link>
          <div className="nav-actions">
            <nav aria-label="Main navigation">
              <Link href="/games/" className="nav-games">
                Games
              </Link>
            </nav>
            <button
              className="icon-button"
              aria-label="Toggle color theme"
              onClick={toggle}
            >
              {light ? <Moon size={19} /> : <Sun size={19} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="wrap minimal-footer">
        <span>Boredom Buster</span>
        <nav aria-label="Footer">
          <Link href="/about/">About</Link>
          <Link href="/privacy/">Privacy</Link>
        </nav>
      </footer>
    </>
  );
}
export function Mute() {
  const [muted, setMuted] = useState(true);
  useEffect(() => setMuted(readStore("muted", true)), []);
  return (
    <button
      className="icon-button"
      aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
      title={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={!muted}
      onClick={() => {
        writeStore("muted", !muted);
        setMuted(!muted);
      }}
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}
