import Link from "next/link";
import { notFound } from "next/navigation";
import { games } from "@/data/games";
import { siteOrigin } from "@/lib/site";
import { GameCard } from "@/components/GameCard";
import GameLoader from "@/components/GameLoader";
import { GameStage } from "@/components/GameStage";
import { BotBadge, botGames } from "@/components/Bot";
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown } from "lucide-react";
export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = games.find((g) => g.slug === slug);
  return {
    title: game ? `${game.title} Online` : "Game not found",
    description: game?.description,
    alternates: { canonical: game?.route },
    openGraph: game
      ? {
          title: `${game.title} — Boredom Buster`,
          description: game.description,
          url: game.route,
          images: [{ url: "/social-card.png", width: 1200, height: 630 }],
        }
      : undefined,
  };
}
export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = games.find((g) => g.slug === slug);
  if (!game) notFound();
  const index = games.findIndex((g) => g.slug === slug);
  const more = Array.from(
    { length: 3 },
    (_, offset) => games[(index + offset + 1) % games.length],
  );
  return (
    <div className="wrap game-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: game.title,
            description: game.description,
            genre: game.category,
            gamePlatform: "Web browser",
            applicationCategory: "Game",
            operatingSystem: "Any",
            isAccessibleForFree: true,
            url: `${siteOrigin}${game.route}`,
          }).replaceAll("<", "\\u003c"),
        }}
      />
      <div className="game-heading">
        <Link href="/games/" className="back-games" aria-label="Back to games">
          <ArrowLeft size={19} />
        </Link>
        <div>
          <h1>{game.title}</h1>
        </div>
        {botGames.has(game.slug) && <BotBadge />}
      </div>
      <div className="game-body">
        <GameStage slug={game.slug} label={`${game.title} game`}>
          <GameLoader slug={game.slug} />
        </GameStage>
        <details className="game-help">
          <summary>
            <span>
              <BookOpen size={18} />
              <span>How to play</span>
            </span>
            <ChevronDown size={17} />
          </summary>
          <p>{game.help}</p>
        </details>
      </div>
      <section className="more-games">
        <div className="more-heading">
          <div>
            <h2>More games</h2>
          </div>
          <Link href="/games/" className="text-link">
            All games <ArrowRight size={16} />
          </Link>
        </div>
        <div className="games-grid">
          {more.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
