export const metadata = {
  title: "About",
  alternates: { canonical: "/about/" },
};
export default function About() {
  return (
    <article className="wrap prose">
      <span className="eyebrow purple">A GOOD LITTLE BREAK</span>
      <h1>Made for your spare minutes.</h1>
      <p>
        Boredom Buster brings ten quick browser games together in one place. No
        downloads, no accounts, and no waiting room. Pick a game and play.
      </p>
      <h2>Small games, real care.</h2>
      <p>
        From a classroom Pen Fight to a round of Snake, each game works with a
        keyboard and with touch. Your best scores, achievements, daily
        challenges, and XP live on your device.
      </p>
      <h2>Your progress is yours.</h2>
      <p>
        There is no global leaderboard or cloud account. Clearing your browser’s
        site data removes your saved progress. We hope you enjoy your next
        five-minute break.
      </p>
    </article>
  );
}
