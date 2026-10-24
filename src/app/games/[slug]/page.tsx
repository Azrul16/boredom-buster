import Link from "next/link";
import { notFound } from "next/navigation";
import { games } from "@/data/games";
import { siteOrigin } from "@/lib/site";
import { GameCard } from "@/components/GameCard";
import GameLoader from "@/components/GameLoader";
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
  const more = games
    .filter((g) => g.slug !== slug)
    .slice(
      (games.findIndex((g) => g.slug === slug) + 1) % 7,
      ((games.findIndex((g) => g.slug === slug) + 1) % 7) + 3,
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
          ←
        </Link>
        <div>
          <h1>{game.title}</h1>
        </div>
      </div>
      <div className="game-body">
        <section
          className={`game-stage game-theme-${game.slug}`}
          aria-label={`${game.title} game`}
        >
          <GameLoader slug={game.slug} />
        </section>
        <details className="game-help">
          <summary>How to play</summary>
          <p>{game.help}</p>
        </details>
      </div>
      <section className="more-games">
        <h2>More games</h2>
        <div className="games-grid">
          {more.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
