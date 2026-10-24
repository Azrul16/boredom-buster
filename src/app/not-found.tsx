import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap prose">
      <h1>That game wandered off.</h1>
      <p>Let’s find you something to play.</p>
      <Link href="/games/" className="button">
        Back to games
      </Link>
    </div>
  );
}
