import { readStore } from "./storage";
let context: AudioContext | undefined;
export function sound(kind: "score" | "win" | "lose" | "click" = "click") {
  if (readStore("muted", true)) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const osc = context.createOscillator(),
      gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);
    osc.frequency.value =
      kind === "win"
        ? 660
        : kind === "lose"
          ? 160
          : kind === "score"
            ? 520
            : 320;
    gain.gain.setValueAtTime(0.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    osc.start();
    osc.stop(context.currentTime + 0.18);
  } catch {
    /* Audio is optional. */
  }
}
