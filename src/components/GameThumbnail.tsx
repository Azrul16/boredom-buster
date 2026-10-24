import type { GameSlug } from "@/data/games";

export const illustratedGames = new Set([
  "connect-four",
  "minesweeper",
  "sliding-puzzle",
  "lights-out",
  "mini-sudoku",
  "hangman",
  "word-scramble",
  "number-guess",
  "math-challenge",
  "whack-a-mole",
]);

export function GameThumbnail({ slug }: { slug: GameSlug }) {
  let art;
  if (slug === "connect-four") {
    art = (
      <g transform="translate(44 30) rotate(-8 56 46)">
        <rect
          width="112"
          height="92"
          rx="12"
          fill="currentColor"
          opacity=".2"
        />
        {Array.from({ length: 20 }, (_, i) => (
          <circle
            key={i}
            cx={14 + (i % 5) * 21}
            cy={14 + Math.floor(i / 5) * 21}
            r="7"
            fill={i > 12 ? (i % 3 ? "currentColor" : "#ffd785") : "#101625"}
            opacity={i > 12 ? 1 : 0.6}
          />
        ))}
      </g>
    );
  } else if (
    ["minesweeper", "sliding-puzzle", "lights-out", "mini-sudoku"].includes(
      slug,
    )
  ) {
    const size = slug === "sliding-puzzle" ? 3 : 4,
      tile = size === 3 ? 30 : 24;
    art = (
      <g transform="translate(50 24) rotate(-8 48 48)">
        {Array.from({ length: size * size }, (_, i) => {
          const x = (i % size) * tile,
            y = Math.floor(i / size) * tile;
          const lit =
            slug === "lights-out" && [1, 4, 5, 6, 9, 11, 14].includes(i);
          const text =
            slug === "sliding-puzzle"
              ? i === 8
                ? ""
                : String(i + 1)
              : slug === "mini-sudoku"
                ? [
                    "1",
                    "",
                    "3",
                    "",
                    "",
                    "4",
                    "",
                    "2",
                    "2",
                    "",
                    "4",
                    "",
                    "",
                    "3",
                    "",
                    "1",
                  ][i]
                : slug === "minesweeper"
                  ? [
                      "1",
                      "",
                      "",
                      "",
                      "1",
                      "2",
                      "⚑",
                      "",
                      "",
                      "1",
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                    ][i]
                  : lit
                    ? "✦"
                    : "";
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={tile - 3}
                height={tile - 3}
                rx="4"
                fill="currentColor"
                opacity={
                  lit ? 0.95 : slug === "sliding-puzzle" && i !== 8 ? 0.3 : 0.14
                }
              />
              <text
                x={x + (tile - 3) / 2}
                y={y + tile * 0.67}
                fontSize={size === 3 ? 16 : 13}
                fontWeight="700"
                textAnchor="middle"
                fill={lit ? "#2b2440" : "currentColor"}
              >
                {text}
              </text>
            </g>
          );
        })}
      </g>
    );
  } else if (slug === "hangman" || slug === "word-scramble") {
    art = (
      <g transform="rotate(-8 100 75)">
        {[...(slug === "hangman" ? "P_AY" : "PLAY")].map((letter, i) => (
          <g
            key={i}
            transform={`translate(${27 + i * 38} ${48 + (i % 2 ? 5 : -5)})`}
          >
            <rect
              width="32"
              height="44"
              rx="6"
              fill="currentColor"
              opacity=".22"
            />
            <text
              x="16"
              y="30"
              textAnchor="middle"
              fontWeight="800"
              fontSize="24"
              fill="currentColor"
            >
              {letter}
            </text>
            <path d="M8 38H24" stroke="currentColor" strokeWidth="2" />
          </g>
        ))}
      </g>
    );
  } else if (slug === "number-guess") {
    art = (
      <g>
        <circle
          cx="100"
          cy="75"
          r="45"
          stroke="currentColor"
          strokeWidth="1"
          opacity=".3"
        />
        <circle cx="100" cy="75" r="32" fill="currentColor" opacity=".15" />
        <text
          x="100"
          y="94"
          fill="currentColor"
          fontSize="58"
          fontWeight="800"
          textAnchor="middle"
        >
          ?
        </text>
        <text x="34" y="48" fill="currentColor" opacity=".6" fontSize="14">
          1
        </text>
        <text x="144" y="113" fill="currentColor" opacity=".6" fontSize="14">
          100
        </text>
        <path
          d="M35 99H57M143 51H165M49 93L57 99L49 105M151 45L143 51L151 57"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    );
  } else if (slug === "math-challenge") {
    art = (
      <g transform="rotate(-8 100 75)">
        {["+", "−", "×", "="].map((symbol, i) => (
          <g
            key={symbol}
            transform={`translate(${58 + (i % 2) * 44} ${30 + Math.floor(i / 2) * 44})`}
          >
            <rect
              width="38"
              height="38"
              rx="9"
              fill="currentColor"
              opacity={i === 3 ? 0.4 : 0.14}
            />
            <text
              x="19"
              y="27"
              textAnchor="middle"
              fontSize="27"
              fontWeight="700"
              fill="currentColor"
            >
              {symbol}
            </text>
          </g>
        ))}
      </g>
    );
  } else {
    art = (
      <g>
        <ellipse cx="100" cy="116" rx="52" ry="12" fill="#111e1a" />
        <circle cx="76" cy="60" r="14" fill="currentColor" />
        <circle cx="124" cy="60" r="14" fill="currentColor" />
        <path
          d="M63 109V83C63 39 137 39 137 83V109Q100 126 63 109"
          fill="currentColor"
        />
        <ellipse cx="100" cy="95" rx="23" ry="18" fill="#fff" opacity=".35" />
        <circle cx="85" cy="80" r="4" fill="#18342b" />
        <circle cx="115" cy="80" r="4" fill="#18342b" />
        <ellipse cx="100" cy="92" rx="6" ry="4" fill="#18342b" />
        <path
          d="M93 102Q100 108 107 102"
          stroke="#18342b"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M150 44V60M142 52H158M40 72V82M35 77H45"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  }
  return (
    <svg
      className="game-thumbnail"
      viewBox="0 0 200 150"
      fill="none"
      aria-hidden="true"
    >
      {art}
    </svg>
  );
}
