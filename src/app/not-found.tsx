import Link from "next/link";
import { BotAvatar } from "@/components/Bot";
export default function NotFound() {
  return (
    <div className="wrap missing-page">
      <BotAvatar />
      <span className="section-eyebrow">404 · A LITTLE OFF COURSE</span>
      <h1>That game wandered off.</h1>
      <p>
        Even Ziggy loses its way sometimes. Let’s find you something to play.
      </p>
      <Link href="/games/" className="button">
        Back to games
      </Link>
    </div>
  );
}
