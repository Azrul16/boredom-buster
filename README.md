# Boredom Buster

**10 Games. Zero Boredom.**

Boredom Buster is a collection of ten free browser games designed for quick breaks and friendly competition. Players can choose a game and start immediately, without creating an account, installing an app, or downloading game assets.

Built with Next.js, React, and TypeScript, the application opens directly into a compact, visual game library. Cards show game titles and personal bests; gameplay pages keep controls visible and instructions collapsed until needed. It exports as a static website for deployment on Netlify or another static hosting service.

## Contents

- [Features](#features)
- [Game library](#game-library)
- [Technology stack](#technology-stack)
- [Getting started](#getting-started)
- [Available commands](#available-commands)
- [Configuration](#configuration)
- [Production build](#production-build)
- [Netlify deployment](#netlify-deployment)
- [Project structure](#project-structure)
- [Application architecture](#application-architecture)
- [Player progression](#player-progression)
- [Local storage and privacy](#local-storage-and-privacy)
- [Accessibility and responsive design](#accessibility-and-responsive-design)
- [Testing](#testing)
- [Adding a new game](#adding-a-new-game)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)

## Features

- **Instant gameplay:** ten playable games with dedicated routes and instructions.
- **Physics-based Pen Fight:** grab a point on the player pen, pull back to set power, and release to flick. The contact point affects spin. Includes pen collisions, friction, alternating CPU turns, and unlimited session scoring.
- **Searchable game catalog:** visual cards, category filters, personal bests, and suggested games.
- **Desktop and mobile controls:** keyboard, pointer, touch, and swipe support where appropriate.
- **Local score persistence:** personal bests save automatically. The underlying progression service also records XP, streaks, achievements, and date-based challenges without adding panels to the game library.
- **Theme preferences:** light and dark modes with system preference detection and a persistent toggle.
- **Optional sound:** synthesized browser audio effects, muted by default.
- **Distinct game visuals:** original canvas scenes, animated SVG marks and gestures, flipping memory cards, and moving 2048 tiles. Canvas rendering adapts to high-density displays.
- **Play controls:** one-second score popups and automatic next games, desktop fullscreen, selectable Snake speeds, selectable Pong difficulty, and a portrait race layout on phones.
- **Pen Fight results:** centered round score popups with winner highlights, animated medals, and victory confetti. Reduced-motion preferences disable celebration animations.
- **Modular game loading:** game modules load on demand; Matter.js is isolated to Pen Fight.
- **Static deployment:** pre-rendered routes, page metadata, structured data, a sitemap, robots.txt, and hosting security headers.

## Game library

| Game                   | Category   | Controls                                                                    | Gameplay                                                                          |
| ---------------------- | ---------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Pen Fight              | Physics    | Grab the purple pen, pull backward, and release; optional keyboard controls | Knock the CPU pen off the desk; scores keep increasing until you leave the game.  |
| Tic Tac Toe            | Strategy   | Tap or click a square                                                       | Play against an easy or unbeatable hard CPU, or a friend on the same device.      |
| Snake                  | Arcade     | Arrow keys, WASD, swipe, or direction buttons                               | Collect food, grow, and avoid walls and your own tail as speed increases.         |
| Rock Paper Scissors    | Quick play | Select a move with the choice buttons                                       | First to three round wins takes the best-of-five match; draws do not count.       |
| 2048                   | Puzzle     | Arrow keys, WASD, swipe, or direction buttons                               | Merge equal tiles to reach 2048, then start a fresh board after the result popup. |
| Memory Match           | Puzzle     | Tap or click cards                                                          | Find eight matching pairs while tracking moves and elapsed time.                  |
| Mini Pong              | Arcade     | W/S, up/down arrows, mouse movement, or drag                                | Control the left paddle against the CPU; first to seven wins.                     |
| Flappy                 | Arcade     | Tap the play area or press Space                                            | Guide an original geometric flyer through increasingly challenging obstacles.     |
| Reaction Time          | Reflex     | Tap the test panel or press Space                                           | Wait for green, react quickly, and compare your best and last-five average.       |
| Red Light, Green Light | Reflex     | Hold the movement button or Space                                           | Move on green, release at amber, and remain still on red to reach the finish.     |

Games restart without reloading the page. Snake, Mini Pong, Flappy, and Red Light, Green Light include pause and resume controls. Backgrounding pauses Snake and Flappy; losing window focus pauses Mini Pong and Red Light, Green Light.

Snake offers Chill, Classic, and Fast speed settings. Pong offers Easy, Normal, and Hard CPU settings. Pen Fight requires grabbing the player's pen before pulling; dragging on empty desk space or the opponent's pen does not create a shot. Flick direction opposes the pull, distance sets power up to a cap, and grabbing near an end produces more spin. Releasing a tiny pull, pressing Escape, losing pointer capture, or cancelling a touch does not fire. Its physics uses a fixed timestep for consistent motion at different display refresh rates. Flappy stores each gate's opening separately so existing gaps remain stable as difficulty increases.

### Automatic next games

Every game shows a centered result popup for one second, then closes it and starts the next game automatically. Pen Fight keeps a running score between rounds, with no two-win limit. Restart re-racks the pens without clearing the session score; leaving the game ends that session. Tic Tac Toe keeps X/O/draw scores between rounds; personal bests and recorded progression are preserved across all games. Snake, Pong, Flappy, and Red Light, Green Light return directly to play. Reaction Time starts another test; Memory Match and 2048 receive fresh boards. Reaching 2048 also shows a victory popup and starts a new board.

The shared result popup manages the one-second timer and keyboard focus. Leaving the page cleans up the timer. Results are recorded when the game finishes, rather than again when the next game begins.

Popups show each game's relevant scores, such as player/CPU totals, reaction time, moves, or collected points. Victories include confetti and trophy animations; losses use a quieter result treatment. Celebration effects honor reduced-motion preferences.

### Game design references

The interaction review used [Coolmath's Snake](https://www.coolmathgames.com/0-snake) for keyboard/touch conventions, [2048](https://play2048.co/) for a board-centered puzzle experience, and [Human Benchmark](https://humanbenchmark.com/tests/reactiontime) for clear reaction-test states. The implementation uses original canvas and SVG artwork rather than downloaded artwork from these sites. The game library remains minimal; visual detail and feedback live inside the games.

## Technology stack

| Technology                       | Purpose                                                         |
| -------------------------------- | --------------------------------------------------------------- |
| Next.js App Router               | Page routing, build-time rendering, metadata, and static export |
| React                            | Interactive interfaces and game components                      |
| TypeScript                       | Strict application and game-state types                         |
| Tailwind CSS and CSS variables   | Styling, themes, responsive layouts, and animations             |
| Lucide React                     | Interface icons                                                 |
| Matter.js                        | Pen Fight rigid-body physics                                    |
| Canvas and requestAnimationFrame | Real-time game rendering and animation                          |
| Web Audio API                    | Optional synthesized sound effects                              |
| Browser localStorage             | Scores, preferences, and player progression                     |
| ESLint and Prettier              | Code checks and formatting                                      |
| Node.js test runner with tsx     | Game logic, physics, and progression tests                      |
| Playwright                       | Browser interaction and responsive layout checks                |

The application does not require a database, authentication provider, API server, or traditional Node.js backend in production. Dependency versions are recorded in `package-lock.json`.

## Getting started

### Requirements

- Node.js 22 or newer.
- npm.
- A modern browser with JavaScript enabled.
- Git, if cloning the repository.

### Installation

Clone your repository and enter its directory:

```sh
git clone <your-repository-url>
cd <repository-directory>
```

Install the locked dependencies and start development:

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On Windows PowerShell systems where script execution is disabled, use `npm.cmd` and `npx.cmd` in place of `npm` and `npx`.

## Available commands

| Command                | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server.                                       |
| `npm run build`        | Generate the production static export and run the automatic postbuild step. |
| `npm run postbuild`    | Normalize exported segment-prefetch filenames when needed on Windows.       |
| `npm run preview`      | Serve the existing production export at `http://127.0.0.1:3000`.            |
| `npm start`            | Start the same local static preview server.                                 |
| `npm run lint`         | Run ESLint.                                                                 |
| `npm run typecheck`    | Check TypeScript without emitting files.                                    |
| `npm test`             | Run game logic, physics, and progression tests.                             |
| `npm run test:browser` | Run Playwright against a running production preview.                        |
| `npm run format`       | Format source files, tests, scripts, configuration, and this README.        |

## Configuration

Copy `.env.example` to `.env.local` for local configuration and set the production origin:

```dotenv
NEXT_PUBLIC_SITE_URL=https://boredom-buster.netlify.app
```

The address above is an example. Replace it with your actual Netlify address or custom domain, without a trailing slash.

`NEXT_PUBLIC_SITE_URL` supplies the origin for absolute metadata, structured data, and sitemap URLs. Set it before building and rebuild whenever the production domain changes. Netlify builds automatically use the site?s URL when this override is absent. Local builds default to http://localhost:3000.

No API keys or backend credentials are required. Variables prefixed with `NEXT_PUBLIC_` are public and must not contain secrets.

## Production build

Run the application checks and create the production export:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The deployable files are generated in `out/`. The build includes HTML for each game route and the JavaScript, CSS, and public assets needed by the application.

The automatic `postbuild` step adds compatible segment-prefetch filenames when a Windows build needs them. Already-correct exports remain unchanged, allowing the same build command to work locally and on Linux hosting builders.

Preview the exported site:

```sh
npm run preview
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Build before previewing. The project uses a static preview server rather than Next.js server-mode `next start`.

## Netlify deployment

### Deploy from a Git repository

1. Push the project to your Git provider, including `package-lock.json`, `netlify.toml`, and the `scripts/` directory.
2. Import the repository into Netlify.
3. Confirm the build settings:

   | Setting           | Value           |
   | ----------------- | --------------- |
   | Base directory    | Repository root |
   | Build command     | `npm run build` |
   | Publish directory | `out`           |
   | Node.js version   | `22`            |

4. Add `NEXT_PUBLIC_SITE_URL` to the build environment using your complete production origin.
5. Deploy the site. The included `netlify.toml` provides the build command, publish directory, Node.js version, and security headers.
6. Verify the homepage and a direct game URL such as `/games/pen-fight/`. Refresh the game URL to confirm that route loading works independently of homepage navigation.

### Manual deployment

1. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` or your build environment.
2. Run `npm ci` and `npm run build`.
3. Upload the contents of `out/` through Netlify's manual deployment flow.
4. Include the generated `_headers` file so the static deployment receives the supplied security headers.

There is no production application server to start. Each route has its own HTML file, so an SPA catch-all redirect is unnecessary. For background on this deployment model, see the [Next.js static export documentation](https://nextjs.org/docs/app/guides/static-exports).

## Project structure

```text
src/
├── app/
│   ├── games/
│   │   ├── [slug]/page.tsx     # Generated game pages
│   │   └── page.tsx            # Searchable game catalog
│   ├── about/                  # About page
│   ├── privacy/                # Privacy page
│   ├── globals.css             # Themes, layout, and shared styles
│   ├── layout.tsx              # Root layout and site metadata
│   ├── page.tsx                # Homepage
│   ├── robots.ts               # Generated robots.txt
│   └── sitemap.ts              # Generated sitemap
├── components/                 # Site shell, dashboard, cards, and game UI
├── data/games.ts               # Central game registry
├── games/                      # Individual game implementations
│   ├── pen-fight/physics.ts    # Physics setup and flick forces
│   ├── tic-tac-toe/logic.ts    # Win detection and minimax
│   └── game2048/logic.ts       # Movement, merges, and tile spawning
├── hooks/useGame.ts            # Scores, results, animation, and keyboard hooks
└── lib/
    ├── audio.ts                # Optional Web Audio effects
    ├── gameArt.ts              # Original garden, flight, court, and track renderers
    ├── progress.ts             # Profile, XP, challenges, and achievements
    └── storage.ts              # Safe localStorage access
public/                         # Favicon and static hosting headers
scripts/                        # Static preview and export normalization
tests/
├── browser/                    # Playwright interaction tests
├── logic.test.ts               # Tic Tac Toe and 2048 rules
├── physics.test.ts             # Pen Fight physics
└── progress.test.ts            # Scores, XP, challenges, and storage failures
netlify.toml                    # Netlify build and hosting configuration
```

## Application architecture

### Central game registry

`src/data/games.ts` defines game identifiers, routes, titles, descriptions, categories, difficulty levels, artwork settings, and instructions. The catalog, static game routes, page metadata, and sitemap derive from this registry.

### Shared game pages

`src/app/games/[slug]/page.tsx` provides a compact page structure: a back link, title, game stage, collapsible instructions, and three suggested games. Shared controls such as score panels, restart buttons, pause buttons, audio controls, and overlays live in reusable components.

### Isolated game modules

`GameLoader` dynamically imports the selected game and provides an error boundary. Each game owns its state and interaction handling. Logic is separated from rendering where it benefits correctness and testing, including 2048 movement, Tic Tac Toe minimax, and Pen Fight physics.

### Local progression services

The `useGame` hook connects games to the shared score and progression layer. Storage helpers guard against server rendering and browser storage exceptions. A future persistence provider can be introduced through this layer without rebuilding the game catalog or page layouts.

## Player progression

| Action                                   | Reward                                    |
| ---------------------------------------- | ----------------------------------------- |
| Complete a game or valid scored attempt  | 20 XP                                     |
| Unlock an achievement for the first time | 50 XP                                     |
| Complete a daily challenge               | 100 XP per challenge, once per local date |
| Earn 200 XP                              | Advance one level                         |

Daily challenges use the player's local calendar date. A streak increases when games are completed on consecutive local dates. Pen Fight challenges and achievements count completed round wins.

Completed zero-score games still count as played. Abandoned games do not award completion XP. New best scores in Snake, Flappy, and 2048 save during play, so leaving a game does not discard an already-earned personal best.

### Achievements

| Achievement   | Requirement                                   |
| ------------- | --------------------------------------------- |
| First Game    | Complete your first game or scored attempt.   |
| Speed Demon   | Record a reaction time below 200 ms.          |
| Snake Master  | Score at least 1,000 points in Snake.         |
| Pen Champion  | Win 10 Pen Fight rounds.                      |
| Puzzle Brain  | Reach a 2048 tile.                            |
| Memory Master | Complete Memory Match in fewer than 20 moves. |

## Local storage and privacy

Scores, theme and sound preferences, XP, achievements, and challenge progress are stored in the current browser. The application does not include account registration, cloud synchronization, advertising, analytics, or tracking pixels.

The implementation currently retains the original `timepass_` storage namespace. These internal keys describe the existing code and preserve saved progress; they do not change the Boredom Buster product name.

| Storage key                | Contents                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| `timepass_profile`         | Player progression, game statistics, best scores, and daily challenges |
| `timepass_theme`           | Selected color theme                                                   |
| `timepass_muted`           | Audio preference                                                       |
| `timepass_snake_highscore` | Snake personal best                                                    |
| `timepass_2048_best`       | 2048 personal best                                                     |
| `timepass_reaction_best`   | Best reaction time                                                     |
| `timepass_memory_best`     | Best completed Memory Match move count                                 |
| `timepass_flappy_best`     | Flappy personal best                                                   |

Lower scores are better for Reaction Time and Memory Match. Clear this site's browser data to reset local progress. Progress is not shared between browsers or devices. If storage is blocked or unavailable, games remain playable, but saving may be unavailable.

The hosting provider may process routine connection information when serving the site. See the application's `/privacy/` page for the current privacy description.

## Accessibility and responsive design

- Responsive layouts support small mobile screens, tablets, and desktop displays.
- Game controls provide touch alternatives to keyboard input where applicable.
- Important controls use accessible labels and visible keyboard focus styles.
- A skip link lets keyboard users move directly to the main content.
- Theme styles use CSS variables for consistent foregrounds, backgrounds, and borders.
- Reduced-motion preferences disable decorative transitions and animations.
- Games provide visible instructions and status messages alongside their play areas.

These features support accessibility, but the project does not claim formal accessibility certification.

## Testing

### Logic and progression checks

```sh
npm test
```

Tests cover 2048 merge rules and move availability, Tic Tac Toe wins and unbeatable CPU behavior, deterministic pen motion and collision displacement, daily rewards, date resets, live best-score persistence, and unavailable or corrupt storage.

### Browser checks

Install the Playwright browser if needed:

```sh
npx playwright install chromium
```

Build the site and start its production preview:

```sh
npm run build
npm run preview
```

With the preview running, open another terminal and run:

```sh
npm run test:browser
```

The browser suite checks route loading, desktop and 320px layouts, browser console errors, navigation, filtering, theme persistence, starts and restarts, selected complete game flows, touch interactions, swipe input, storage denial, difficulty controls, fullscreen, and keyboard input after interacting with buttons. Physics tests also compare Pen Fight motion at 30, 60, and 120 Hz.

## Adding a new game

1. Add the game's metadata and instructions to `src/data/games.ts`.
2. Create its client component at `src/games/<game>/Game.tsx`.
3. Register its dynamic import in `src/components/GameLoader.tsx`.
4. Reuse shared game UI and the `useGame` hook. Call `finish(score, won)` once per completed game and use `updateBest(score)` for live scores where higher is better.
5. Support appropriate keyboard and touch controls. Clean up timers, animation frames, physics engines, and event listeners when the component unmounts.
6. Implement restart without reloading the page and pause where continuous gameplay requires it.
7. Add meaningful rule and interaction tests. Update the route checks, game count, homepage copy, and this README.
8. Run lint, type checks, tests, and the production build before submitting the change.

## Troubleshooting

| Issue                                 | What to check                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| PowerShell blocks npm scripts         | Use `npm.cmd` or `npx.cmd` for the command.                                                      |
| Production preview cannot find pages  | Run `npm run build` before starting the preview.                                                 |
| Port 3000 is already in use           | Use PORT=3001 for a separate static preview (PowerShell: $env:PORT="3001").                      |
| Playwright cannot find Chromium       | Run `npx playwright install chromium`.                                                           |
| Browser tests cannot connect          | Keep `npm run preview` running at `http://127.0.0.1:3000` in another terminal.                   |
| Progress is missing                   | Confirm the same browser and origin are in use and site storage has not been cleared or blocked. |
| Audio is silent                       | Unmute using the game toolbar; browser audio may require a user interaction first.               |
| Sitemap URLs use localhost            | Set `NEXT_PUBLIC_SITE_URL` before building and redeploy.                                         |
| Windows export produces prefetch 404s | Use `npm run build`, which includes the required postbuild normalization.                        |

## Contributing

Keep changes focused, preserve the frontend-first architecture, and use the existing game registry and shared components. Avoid adding a backend or large dependency for functionality that can remain local to the browser.

Before submitting a change:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Run the browser suite against the production preview for changes that affect gameplay, navigation, storage, or responsive layouts. Include a clear description of the behavior changed and the checks performed.

## Roadmap

Potential future additions include:

- Local two-player Pen Fight.
- Pen skins and additional desk layouts.
- Installable PWA support.
- Optional cloud profiles and synchronized progress.
- Global leaderboards and friend challenges.
- Online multiplayer and tournaments.

These items describe possible extensions and are not part of the current frontend-only release.

---

**Boredom Buster — quick games for boring moments.**
