"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gamepad2, Sun, Moon } from "lucide-react";
import { readStore, writeStore } from "@/lib/storage";
import { usePathname } from "next/navigation";
import { useOffline } from "./OfflineSupport";
import { SiteFooter } from "./SiteFooter";
import { Customize } from "./Customize";
import { WifiOff, CheckCircle2, LoaderCircle, HardDrive } from "lucide-react";
export function Shell({ children }: { children: React.ReactNode }) {
  const [light, setLight] = useState(false);
  const pathname = usePathname();
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
            <OfflineBadge />
            <nav aria-label="Main navigation">
              <Link
                href="/games/"
                className="nav-games"
                aria-current={
                  pathname === "/" || pathname.startsWith("/games")
                    ? "page"
                    : undefined
                }
              >
                Games
              </Link>
              <Link
                href="/progress/"
                className="nav-records"
                aria-label="My records"
                aria-current={pathname === "/progress/" ? "page" : undefined}
              >
                <HardDrive size={16} />
                <span>My records</span>
              </Link>
            </nav>
            <Customize />
            <button
              className="icon-button"
              aria-label="Toggle color theme"
              title={light ? "Switch to dark mode" : "Switch to light mode"}
              onClick={toggle}
            >
              {light ? <Moon size={19} /> : <Sun size={19} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <SiteFooter>
        <OfflineBadge />
      </SiteFooter>
    </>
  );
}

export function OfflineBadge() {
  const { offline, mode } = useOffline();
  const label = offline
    ? mode === "ready"
      ? "Playing offline"
      : "You’re offline"
    : mode === "ready"
      ? "Ready offline"
      : mode === "saving"
        ? "Saving for offline"
        : "";
  if (!label) return null;
  return (
    <span
      className={`connection-badge ${offline ? "is-offline" : ""}`}
      aria-live="polite"
      title={
        mode === "ready"
          ? "All 20 games are saved in this browser for offline play."
          : mode === "saving"
            ? "Keep this tab open online while your games download."
            : "Visit online to save the games for offline play."
      }
    >
      {offline ? (
        <WifiOff size={14} />
      ) : mode === "saving" ? (
        <LoaderCircle className="saving-spinner" size={14} />
      ) : (
        <CheckCircle2 size={14} />
      )}
      <span>{label}</span>
    </span>
  );
}
export { Mute } from "./SoundToggle";
