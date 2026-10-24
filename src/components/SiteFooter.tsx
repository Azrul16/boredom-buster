import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Gamepad2,
  Github,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { owner } from "@/data/owner";

export function SiteFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="wrap site-footer owner-footer">
      <div className="owner-footer-grid">
        <div className="footer-app">
          <Link href="/" className="footer-logo">
            <Gamepad2 size={21} /> Boredom Buster
          </Link>
          <nav aria-label="Footer">
            <Link href="/games/">Games</Link>
            <Link href="/progress/">My records</Link>
            <Link href="/about/">About</Link>
            <Link href="/privacy/">Privacy</Link>
          </nav>
        </div>
        <div className="footer-owner">
          <span className="owner-monogram" aria-hidden="true">
            AA
            <span />
          </span>
          <div>
            <span className="owner-caption">CREATED BY</span>
            <a
              href={owner.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="owner-name"
            >
              {owner.name}
              <ArrowUpRight size={14} />
            </a>
            <p>{owner.role}</p>
            <span className="owner-location">
              <MapPin size={11} />
              {owner.location}
            </span>
          </div>
        </div>
        <div className="footer-contact">
          <a href={`mailto:${owner.email}`} className="owner-email">
            <Mail size={14} />
            <span>{owner.email}</span>
          </a>
          <div className="owner-socials" role="group" aria-label="Owner links">
            <a
              href={owner.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Azrul on GitHub"
              title="GitHub"
            >
              <Github size={17} />
            </a>
            <a
              href={owner.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Azrul on LinkedIn"
              title="LinkedIn"
            >
              <Linkedin size={17} />
            </a>
            <a
              href={owner.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Azrul's portfolio"
              title="Portfolio"
            >
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="owner-footer-bottom">
        <small>
          © {new Date().getFullYear()} {owner.name}
        </small>
        {children}
      </div>
    </footer>
  );
}
