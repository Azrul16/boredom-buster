"use client";
import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { readStore, writeStore } from "@/lib/storage";
export function Mute() {
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const sync = () => setMuted(readStore("muted", true));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("timepass-storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("timepass-storage", sync);
    };
  }, []);
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
