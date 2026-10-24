import Link from "next/link";
import {
  ShieldCheck,
  HardDrive,
  WifiOff,
  Globe,
  ArrowUpRight,
} from "lucide-react";

export const metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy/" },
};
export default function Privacy() {
  return (
    <article className="wrap info-page privacy-page">
      <div className="info-intro">
        <span className="section-eyebrow">
          <ShieldCheck size={14} /> KEEP IT SIMPLE
        </span>
        <h1>
          Your play.
          <br />
          <em>Your device.</em>
        </h1>
        <p>
          No account to create. No email to hand over. Just games, with your
          progress kept close to home.
        </p>
      </div>
      <div className="privacy-promise">
        <ShieldCheck size={24} />
        <p>
          No ads. No analytics. No tracking pixels.
          <br />
          <strong>Your attention belongs to you.</strong>
        </p>
      </div>
      <div className="privacy-sections">
        <section>
          <span className="privacy-icon">
            <HardDrive size={22} />
          </span>
          <div>
            <h2>What stays in your browser</h2>
            <p>
              We save scores, difficulty preferences, your 100 most recent
              results, theme and sound preferences, XP, achievements, and
              challenge progress on this device. These records are not sent to
              an application server and do not transfer to other browsers or
              devices. Favorites, recent games, and appearance settings also
              stay in this browser. Sharing a result is optional and uses your
              device’s share sheet or clipboard.
            </p>
          </div>
        </section>
        <section>
          <span className="privacy-icon">
            <WifiOff size={22} />
          </span>
          <div>
            <h2>Your offline game library</h2>
            <p>
              On your first online visit, the app saves game pages, code, and
              artwork in this browser so you can play offline. Updates download
              when you return online. Your browser may clear this saved copy
              when storage is needed.
            </p>
          </div>
        </section>
        <section>
          <span className="privacy-icon">
            <Globe size={22} />
          </span>
          <div>
            <h2>What the host may see</h2>
            <p>
              The hosting provider may process routine connection information,
              such as your IP address and request time, when serving the
              website. The app itself includes no advertising or analytics
              services.
            </p>
          </div>
        </section>
        <section>
          <span className="privacy-icon">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h2>You’re in control</h2>
            <p>
              Clear this website’s data in your browser settings to remove saved
              progress, preferences, and offline games. If storage is blocked,
              games can still run online, but saving and offline access may be
              unavailable.
            </p>
          </div>
        </section>
      </div>
      <div className="privacy-back">
        <p>Less paperwork. More play.</p>
        <Link className="text-link" href="/games/">
          Back to the games <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
