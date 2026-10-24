import Link from "next/link";
import {
  Gamepad2,
  ShieldCheck,
  WifiOff,
  ArrowUpRight,
  Heart,
  Sparkles,
} from "lucide-react";
import { BotAvatar } from "@/components/Bot";

export const metadata = {
  title: "About",
  alternates: { canonical: "/about/" },
};
export default function About() {
  return (
    <article className="wrap info-page">
      <div className="info-intro">
        <span className="section-eyebrow">
          <Heart size={14} /> A GOOD LITTLE BREAK
        </span>
        <h1>
          Made for your
          <br />
          <em>spare minutes.</em>
        </h1>
        <p>
          A bus ride. A tea break. That gap between two things. We believe a
          little play belongs in your day.
        </p>
      </div>
      <div className="info-grid">
        <section className="info-card">
          <Gamepad2 size={25} />
          <h2>Small games. Real care.</h2>
          <p>
            Twenty games, from classroom Pen Fight to thoughtful Sudoku.
            Familiar favorites, satisfying puzzles, and quick reflex tests, all
            a tap away.
          </p>
        </section>
        <section className="info-card">
          <WifiOff size={25} />
          <h2>A break, anywhere.</h2>
          <p>
            Visit online and let your games finish saving. Once “Ready offline”
            appears, the whole library is ready for your next connection-free
            break. No app installation needed.
          </p>
        </section>
        <section className="info-card">
          <ShieldCheck size={25} />
          <h2>Your progress is yours.</h2>
          <p>
            Best scores, XP, and preferences stay in this browser. No accounts,
            public leaderboards, or tracking. Clearing site data clears your
            saved progress.
          </p>
          <Link className="text-link" href="/privacy/">
            Our privacy promise <ArrowUpRight size={15} />
          </Link>
        </section>
      </div>
      <section className="about-bot">
        <BotAvatar />
        <div>
          <span className="section-eyebrow">A LITTLE FRIENDLY COMPETITION</span>
          <h2>Meet Ziggy.</h2>
          <p>
            Your ever-ready rival in Pen Fight, Tic Tac Toe, Connect Four, Mini
            Pong, and Rock Paper Scissors. A little clever, a little
            competitive, and always up for a rematch.
          </p>
          <Link className="button" href="/games/connect-four/">
            Challenge Ziggy <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section className="info-cta">
        <Sparkles size={24} />
        <h2>Got a spare minute?</h2>
        <p>There’s a game for that.</p>
        <Link className="button" href="/games/">
          Find your next favorite <ArrowUpRight size={16} />
        </Link>
      </section>
    </article>
  );
}
