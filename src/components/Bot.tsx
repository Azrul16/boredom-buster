import { useId } from "react";

export const botGames = new Set([
  "pen-fight",
  "tic-tac-toe",
  "rock-paper-scissors",
  "pong",
  "connect-four",
]);

export function BotAvatar({ className = "" }: { className?: string }) {
  const gradient = useId();
  return (
    <svg
      className={`bot-avatar ${className}`}
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradient}
          x1="20"
          y1="20"
          x2="140"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d3baff" />
          <stop offset="1" stopColor="#8955ed" />
        </linearGradient>
      </defs>
      <path
        d="M80 29V17"
        stroke="#c3a3ff"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="80" cy="14" r="7" fill="#b7f6ca" />
      <rect
        x="18"
        y="40"
        width="124"
        height="100"
        rx="35"
        fill={`url(#${gradient})`}
      />
      <rect x="31" y="55" width="98" height="64" rx="24" fill="#251c40" />
      <path
        d="M49 76H65L49 90H65"
        stroke="#c7a6ff"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="104" cy="83" r="7" fill="#b7f6ca" />
      <path
        d="M68 102Q80 110 92 102"
        stroke="#d9c7ff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="8" y="72" width="10" height="32" rx="5" fill="#a580ed" />
      <rect x="142" y="72" width="10" height="32" rx="5" fill="#a580ed" />
      <path
        d="M63 140V148M97 140V148"
        stroke="#a580ed"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BotBadge() {
  return (
    <span className="bot-badge" aria-label="Ziggy" title="Ziggy">
      <BotAvatar />
      <span>
        <strong>Ziggy</strong>
      </span>
    </span>
  );
}
