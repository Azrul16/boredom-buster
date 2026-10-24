# Boredom Buster

**20 Games. Zero Boredom.**

**[Play the live demo](https://regal-valkyrie-a10d6b.netlify.app/)**

Twenty free browser games for quick breaks, puzzles, and friendly competition with **Ziggy**. Every game offers **Easy, Medium, and Hard** modes. Results and personal bests save on the player's device, and the library works offline after its first online download finishes.

Built with Next.js, React, and TypeScript. No account, app installation, API key, or production application server is required. The app exports as a static website.

## Contents

- [Demo view](#demo-view)
- [Features](#features)
- [Game library](#game-library)
- [Difficulty modes](#difficulty-modes)
- [Customization and personal library](#customization-and-personal-library)
- [Design research](#design-research)
- [Offline play](#offline-play)
- [Local records and backups](#local-records-and-backups)
- [Getting started](#getting-started)
- [Commands](#commands)
- [Configuration](#configuration)
- [Build and deployment](#build-and-deployment)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Player progression](#player-progression)
- [Privacy and accessibility](#privacy-and-accessibility)
- [Testing](#testing)
- [Adding a game](#adding-a-game)
- [Troubleshooting](#troubleshooting)
- [Contributing and roadmap](#contributing-and-roadmap)

## Demo view

**[Open Boredom Buster](https://regal-valkyrie-a10d6b.netlify.app/)** — play all twenty games in your browser.

Screenshots captured from the current local production build. Click an image to view it at full size.

### Desktop library

[![Desktop game library with illustrated cards, search, and filters](docs/screenshots/library-desktop.png)](docs/screenshots/library-desktop.png)

| Pen Fight                                                                                                                           | Connect Four — Mint / Midnight                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Pen Fight showing the wooden desk, player pen, and Ziggy's pen](docs/screenshots/pen-fight.png)](docs/screenshots/pen-fight.png) | [![Connect Four during a match with mint pieces and a Midnight arena](docs/screenshots/connect-four.png)](docs/screenshots/connect-four.png) |

| Customization                                                                                                                                                                                     | Mobile library                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="docs/screenshots/customization.png"><img src="docs/screenshots/customization.png" alt="Customization panel with color palettes, arena styles, and gameplay preferences" width="600"></a> | <a href="docs/screenshots/library-mobile.png"><img src="docs/screenshots/library-mobile.png" alt="Mobile game library with two-column cards and favorite buttons" width="260"></a> |

## Features

- **Twenty games:** arcade, puzzle, strategy, reflex, physics, and quick-play categories.
- **Three modes per game:** meaningful changes to strategy, speed, timing, puzzle complexity, or attempts. Each game remembers its selected mode.
- **Meet Ziggy:** your rival in Pen Fight, Tic Tac Toe, Connect Four, Mini Pong, and Rock Paper Scissors.
- **Find a game quickly:** illustrated cards, category counts, search across titles, descriptions, and instructions, plus a random quick-play picker.
- **Minimal play screens:** artwork, game titles, scores, and controls lead the interface; rules and difficulty tips open on request.
- **Offline downloads:** visible status shows when games are saving, ready offline, or being played without a connection.
- **My records:** separate best scores for each difficulty, the latest 100 completed results, and downloadable JSON backups.
- **Personal library:** save favorites, reopen recent games, or filter the existing daily challenges.
- **Customization:** five accent palettes, three arena surfaces, per-game colors, card density, focus mode, optional effects, and automatic or manual rematches. Open the palette icon in navigation or beside a game's difficulty controls.
- **Share a result:** use the share action in My records to open the device share sheet or copy a result and game link.
- **Quick rematches:** one-second result popups start fresh rounds automatically, or turn off Auto rematch to choose when to play again. Restart works without reloading the page.
- **Responsive controls:** keyboard, pointer, and touch support where appropriate, pause controls for continuous games, and desktop fullscreen.
- **Original visuals:** canvas and SVG artwork, a custom Ziggy character, light/dark themes, optional sound, and reduced-motion support.
- **Static hosting:** pre-rendered routes, metadata, structured data, sitemap, robots.txt, and hosting headers.

## Game library

| Game                   | Category   | How to play                                                                                                                    |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Pen Fight              | Physics    | Grab your pen, pull backward, and release to knock Ziggy's pen off the desk. Off-center grabs add spin.                        |
| Tic Tac Toe            | Strategy   | Place three marks in a row against Ziggy or a friend on the same device.                                                       |
| Snake                  | Arcade     | Collect food and avoid collisions using arrows, WASD, swipes, or direction buttons.                                            |
| Rock Paper Scissors    | Quick play | Choose a move; first to three round wins takes the match. Draws do not count.                                                  |
| 2048                   | Puzzle     | Slide and merge equal tiles with arrows, WASD, swipes, or direction buttons to reach 2048.                                     |
| Memory Match           | Puzzle     | Reveal matching pairs with as few moves as possible. Pair count depends on the mode.                                           |
| Mini Pong              | Arcade     | Move your paddle with W/S, arrows, the mouse, or dragging. First to seven wins.                                                |
| Flappy                 | Arcade     | Tap or press Space to fly through openings without hitting obstacles or the edges.                                             |
| Reaction Time          | Reflex     | Wait for green, then tap or press Space. Compare your time with the mode's target.                                             |
| Red Light, Green Light | Reflex     | Hold the move button or Space on green, release at amber, and remain still on red.                                             |
| Connect Four           | Strategy   | Choose a column and connect four discs horizontally, vertically, or diagonally before Ziggy.                                   |
| Minesweeper            | Puzzle     | Reveal safe cells on an 8x8 field. Toggle Flag mode or right-click to mark mines. The first reveal and its neighbors are safe. |
| Sliding Puzzle         | Puzzle     | Tap neighboring tiles or use arrows to arrange 1-8 with the empty space at bottom right.                                       |
| Lights Out             | Puzzle     | Turn every light off. Each tap flips that light and its orthogonal neighbors.                                                  |
| Mini Sudoku            | Puzzle     | Fill a 4x4 grid with 1-4 without repeating a number in a row, column, or 2x2 box.                                              |
| Hangman                | Puzzle     | Use the clue and letter buttons or A-Z keys to uncover the word before running out of mistakes.                                |
| Word Scramble          | Puzzle     | Rearrange the letters into the hinted word. Type and submit an answer; reshuffling is free.                                    |
| Number Guess           | Quick play | Find the secret number using higher/lower hints before guesses run out.                                                        |
| Math Challenge         | Quick play | Answer ten arithmetic questions. There is no time limit.                                                                       |
| Whack-a-Mole           | Reflex     | Hit each mole before it moves during a 20-second round. Each target scores once.                                               |

Sliding Puzzle and Lights Out generate solvable boards. Mini Sudoku puzzles have exactly one solution. Each game page explains controls and scoring under **How to play**.

Snake, Mini Pong, Flappy, Red Light, Green Light, and Whack-a-Mole have pause controls. Backgrounding pauses Snake and Flappy; losing window focus pauses Mini Pong, Red Light, Green Light, and Whack-a-Mole.

Pen Fight keeps unlimited session scores between rounds; Restart re-racks the pens without clearing that score. Tic Tac Toe also keeps session round totals. Leaving a game or changing difficulty starts a new session; saved bests and completed results remain.

## Difficulty modes

**Medium** is the default. The selected mode is saved separately for each game. Changing modes starts a fresh round and displays that difficulty's personal best. Tic Tac Toe's bot strategy applies when playing against Ziggy.

| Game                   | Easy                                   | Medium                        | Hard                                  |
| ---------------------- | -------------------------------------- | ----------------------------- | ------------------------------------- |
| Pen Fight              | Gentler, less accurate rival           | Balanced power and aim        | Stronger, more precise flicks         |
| Tic Tac Toe            | Random moves                           | Takes wins and blocks threats | Unbeatable minimax strategy           |
| Snake                  | Relaxed starting speed                 | Classic starting speed        | Fast starting speed                   |
| Rock Paper Scissors    | Predictable rock-paper-scissors cycle  | Random choices                | Adapts to previous player choices     |
| 2048                   | 5% chance of spawning a 4              | 10% chance of spawning a 4    | 25% chance of spawning a 4            |
| Memory Match           | 6 pairs; 1.2-second missed-pair reveal | 8 pairs; 0.8-second reveal    | 10 pairs; 0.45-second reveal          |
| Mini Pong              | Slower rival paddle                    | Balanced tracking             | Faster rival paddle                   |
| Flappy                 | Wider gaps and slower obstacles        | Standard gaps and speed       | Narrower gaps and faster obstacles    |
| Reaction Time          | Target: 350 ms or faster               | Target: 280 ms or faster      | Target: 220 ms; less predictable wait |
| Red Light, Green Light | Longer warnings, faster runner         | Balanced warnings and pace    | Shorter warnings, slower runner       |
| Connect Four           | Random columns                         | Takes wins and blocks threats | Searches several turns ahead          |
| Minesweeper            | 8 mines                                | 10 mines                      | 14 mines                              |
| Sliding Puzzle         | 6-move shuffle                         | 30-move shuffle               | 100-move shuffle                      |
| Lights Out             | 4x4; 3-switch scramble                 | 4x4; 7-switch scramble        | 5x5; 15-switch scramble               |
| Mini Sudoku            | 10 clues                               | At least 7 clues              | Fewer clues, preserving one solution  |
| Hangman                | Shorter words; 8 mistakes              | 6 mistakes                    | Longer words; 4 mistakes              |
| Word Scramble          | 7 guesses                              | 5 guesses                     | Longer words; 3 guesses               |
| Number Guess           | 1-50; 8 guesses                        | 1-100; 7 guesses              | 1-500; 7 guesses                      |
| Math Challenge         | Numbers 1-6; 7/10 to win               | Numbers 1-12; 7/10 to win     | Numbers 1-25; 9/10 to win             |
| Whack-a-Mole           | Slower targets; 10 hits to win         | 15 hits to win                | Faster targets; 25 hits to win        |

Shuffle depth describes board generation, not the minimum moves needed to solve a puzzle. Sudoku retains extra clues when removing them would create multiple solutions.

## Customization and personal library

Open the **palette icon** in navigation to customize the app, or beside a game's difficulty controls to also change that game's color. Changes apply immediately and save in this browser for online and offline use.

| Setting      | Options and behavior                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| Accent       | Violet, Mint, Ocean, Coral, or Gold.                                                        |
| Arena        | Classic, Midnight, or Arcade.                                                               |
| Game color   | Choose a separate palette for each game, or select Original to restore its default artwork. |
| Cards        | Compact or Roomy library layouts.                                                           |
| Focus mode   | Hide related games and the footer while playing; navigation remains available.              |
| Effects      | Enable or reduce decorative motion and confetti.                                            |
| Auto rematch | Start again after one second, or wait for the Play again button.                            |
| Sound        | Toggle the shared sound preference. Sound starts muted.                                     |

Game colors update board pieces and highlights, plus player artwork in Snake, Pen Fight, Flappy, Mini Pong, and Red Light, Green Light. Arena styles also change selected canvas backgrounds. Gameplay signal colors retain their meaning; appearance settings do not change rules, physics, or scores.

**Reset look** restores appearance defaults while preserving favorites, recent games, the auto-rematch preference, sound, and saved records. Press Escape or use Done to close customization and return focus to its trigger. Canvas simulation freezes while the panel is open; Whack-a-Mole pauses and Reaction Time cancels an active timing attempt.

Use the library filters to return to games quickly:

- **Favorites:** tap a card's heart to save or remove it without opening the game.
- **Recent:** games ordered by their last opening, whether or not a round was completed.
- **Daily:** the existing Snake, Reaction Time, and Pen Fight goals, with targets and completion indicators. These are local score challenges, not shared date-seeded puzzles.

## Design research

The [research report](docs/research/2026-10-24-casual-game-ux.md) compares seven game ecosystems and first-party UX guidance, explains these enhancements, and prioritizes future work. Observed patterns are distinguished from hypotheses; no growth uplift is claimed without measurement.

It reviews Poki, CrazyGames, Coolmath Games, Plato, Jindoblu, NYT Games, and Lichess. The recommendations prioritize quick entry, recognizable artwork, easy return visits, optional personalization, and user-initiated sharing. Research details stay in the report so the game screens remain minimal.

## Offline play

1. Open the production website online in a supported browser.
2. Keep it open while **Saving for offline** is displayed.
3. Once **Ready offline** appears, disconnect and reopen the website or a game URL in that browser.

All twenty games and the records page are cached, including games not opened individually. No installation is needed. Offline support requires HTTPS in production or localhost for testing. Development mode does not register a service worker; use a production build to test offline behavior.

`scripts/generate-offline.mjs` generates `out/sw.js` from the complete export. Installation succeeds only after all listed resources download. Each build uses a content-based cache name. Updates download in the background and activate after tabs using the previous worker close. Activation removes older app caches.

Clearing site data or browser storage eviction removes the offline copy. Game files use Cache Storage; player records use localStorage. Availability depends on the browser retaining that data.

## Local records and backups

Open **My records** at `/progress/` to see:

- Best scores for Easy, Medium, and Hard, plus the all-time record.
- The latest 100 completed results, newest first, filterable by difficulty.
- Each result's game, mode, score, outcome, and local display time.
- A share action for each completed result: use the device share sheet when supported, otherwise copy the result and direct game link. Sharing requires an explicit player action and browser support.
- Lifetime completed-round and XP totals.
- **Download backup**, which saves the profile and preferences as JSON.

Results save without a network connection and survive normal browser restarts in the **same browser profile and website origin**. Different devices, profiles, domains, or ports have separate records. Clearing site data removes results, preferences, and the offline copy. Private browsing may discard them when the session ends. Games report blocked or full storage and remain playable when saving is unavailable.

Higher scores are better except for **Reaction Time** and **Memory Match**, where lower completed scores are better. Snake, Flappy, and 2048 save live bests before a round ends. Abandoned rounds do not count as completed results. Older all-time scores are preserved without assigning them to an unknown difficulty. The 100-result limit does not remove best scores or lifetime totals.

Backups are named `boredom-buster-backup-YYYY-MM-DD.json` and contain a format version, export timestamp, profile, theme and sound preferences, selected difficulties, and personalization settings including favorites and recent games. A downloaded backup is a separate file. **There is currently no in-app backup import or automatic cloud synchronization.**

### Browser storage keys

| Key                               | Contents                                                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `timepass_profile`                | XP, completed rounds, streaks, wins, all-time bests, `modeBest`, recent `results`, achievements, and daily challenges |
| `timepass_difficulty_<game-slug>` | Selected game difficulty                                                                                              |
| `timepass_theme`                  | Light/dark preference                                                                                                 |
| `timepass_muted`                  | Sound preference                                                                                                      |
| `timepass_personalization`        | Favorites, recent game openings, accent, arena, density, game colors, focus, effects, and auto-rematch settings       |
| `timepass_snake_highscore`        | Compatibility copy of Snake's all-time best                                                                           |
| `timepass_2048_best`              | Compatibility copy of 2048's all-time best                                                                            |
| `timepass_reaction_best`          | Compatibility copy of the best reaction time                                                                          |
| `timepass_memory_best`            | Compatibility copy of Memory Match's best completed move count                                                        |
| `timepass_flappy_best`            | Compatibility copy of Flappy's all-time best                                                                          |

The existing `timepass_` namespace is retained to preserve earlier player data.

Personalization values are validated when loaded. Invalid colors, unknown game IDs, and malformed preferences fall back to supported values. These settings work offline and are included in JSON backups.

## Getting started

Requirements: Node.js 22 or newer, npm, and a modern JavaScript-enabled browser. The included Netlify configuration uses Node.js 22.

From the repository directory:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). On Windows systems that block PowerShell scripts, use `npm.cmd` and `npx.cmd` instead of `npm` and `npx`.

## Commands

| Command                | Description                                                               |
| ---------------------- | ------------------------------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server.                                     |
| `npm run build`        | Export the production site and automatically run postbuild.               |
| `npm run postbuild`    | Normalize exported filenames and generate the offline worker from `out/`. |
| `npm run preview`      | Serve the existing export at `http://127.0.0.1:3000`.                     |
| `npm start`            | Start the same static preview server.                                     |
| `npm run lint`         | Run ESLint.                                                               |
| `npm run typecheck`    | Check TypeScript without emitting files.                                  |
| `npm test`             | Run logic, physics, puzzle, and persistence tests.                        |
| `npm run test:browser` | Run Playwright against a running production preview.                      |
| `npm run format`       | Format source, tests, scripts, configuration, and README.                 |

## Configuration

Copy `.env.example` to `.env.local` and set the production origin before building:

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-project.netlify.app
```

Replace the example with your domain. `src/lib/site.ts` uses `NEXT_PUBLIC_SITE_URL`, then Netlify's `URL` environment variable, then `http://localhost:3000`. It supplies absolute metadata, structured-data, and sitemap URLs. Rebuild when changing the origin.

No API keys are required. `NEXT_PUBLIC_` variables are public and must not contain secrets.

## Build and deployment

Run checks, build, and preview:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

Deploy **`out/`**. Postbuild first normalizes Windows segment-prefetch filenames, then generates the offline worker. Deploy only after both steps finish. The app uses `output: "export"` with trailing-slash routes and an HTML file per page. Preview uses `scripts/serve.mjs`, rather than `next start`.

### Netlify

Import the Git repository with the settings supplied in `netlify.toml`:

| Setting           | Value           |
| ----------------- | --------------- |
| Base directory    | Repository root |
| Build command     | `npm run build` |
| Publish directory | `out`           |
| Node.js version   | `22`            |

Set `NEXT_PUBLIC_SITE_URL` if overriding Netlify's `URL`. For manual deployment, run `npm ci` and `npm run build`, then upload `out/`, including `_headers` and `sw.js`.

Use HTTPS, preserve direct directory-route loading, and serve `/sw.js` with revalidation instead of long-lived immutable caching. `public/_headers` supplies `Cache-Control: no-cache` for the worker on hosts supporting that file, plus content-type and referrer security headers. An SPA catch-all redirect is unnecessary.

After deployment, check the homepage, a direct game URL, `/progress/`, and an offline reload after **Ready offline** appears.

### Technology

Next.js App Router, React, and TypeScript provide routing, static rendering, and game interfaces. Tailwind CSS and CSS variables handle styling; Lucide React and original SVGs supply icons and artwork. Matter.js powers Pen Fight, Canvas renders real-time games, and Web Audio supplies optional synthesized sound. Service workers and Cache Storage support offline files; localStorage saves player data. Dependency versions are pinned by `package-lock.json`.

Production hosting does not need a database, authentication provider, or Node.js application server.

## Project structure

```text
src/
  app/
    games/[slug]/page.tsx     # Generated game routes
    games/page.tsx           # Game catalog
    progress/page.tsx        # My records
    about/                   # About page and Ziggy introduction
    privacy/                 # Local storage and privacy information
    globals.css              # Base styles and arenas
    polish.css               # Library, cards, and information pages
    records.css              # Difficulty controls and records
    minimal.css              # Compact library and game screens
    footer.css               # Shared owner footer
    personalization.css      # Customization panel, palettes, and library controls
    layout.tsx               # Metadata, personalization/offline providers, and shell
    page.tsx                 # Homepage
    robots.ts                # Generated robots.txt
    sitemap.ts               # Generated sitemap
  components/
    Bot.tsx                  # Ziggy artwork and badges
    Customize.tsx            # Appearance dialog and live preview
    Dashboard.tsx            # Search, filters, quick play, and profile updates
    GameCard.tsx             # Library cards
    GameThumbnail.tsx        # Illustrated previews
    GameLoader.tsx           # Dynamic imports and error recovery
    GameSettings.tsx         # Persistent modes and saving status
    GameStage.tsx            # Per-game palette and active-play state
    GameResult.tsx           # Result dialog and rematch timer
    GameUI.tsx               # Toolbar and shared controls
    LocalProgress.tsx        # Records, sharing, history filters, and backup download
    OfflineSupport.tsx       # Worker registration and connection status
    Personalization.tsx      # Preference context, storage, and game-look hook
    Shell.tsx                # Navigation, footer, theme, and sound
    SiteFooter.tsx           # Owner details, portfolio, and contact links
    SoundToggle.tsx          # Synchronized mute control
  data/games.ts              # Registry for all twenty games
  data/owner.ts              # Public owner details verified from the portfolio
  games/
    <game>/Game.tsx          # Individual implementations
    shared/MiniGame.tsx      # Shared round lifecycle
    shared/puzzles.ts        # Puzzle generation and bot logic
  hooks/useGame.ts           # Mode-aware scoring, input, and frames
  lib/
    difficulty.ts            # Modes and per-game descriptions
    progress.ts              # Profile validation, records, rewards, and bests
    personalization.ts       # Palettes, defaults, and preference validation
    storage.ts               # Safe localStorage and save-status events
    audio.ts                 # Sound effects
    gameArt.ts               # Canvas artwork
    site.ts                  # Deployment origin
public/                      # Icons, social image, and hosting headers
scripts/
  normalize-export.mjs       # Windows export compatibility
  generate-offline.mjs       # Offline worker generator
  serve.mjs                  # Static preview
tests/
  browser/                   # Playwright integration tests
  logic.test.ts              # Tic Tac Toe and 2048
  physics.test.ts            # Pen Fight
  progress.test.ts           # Persistence, rewards, and legacy data
  personalization.test.ts    # Preference validation and defaults
  puzzles.test.ts            # Puzzle validity and bot decisions
docs/research/               # Sourced product review and improvement priorities
```

## Architecture

The registry in `src/data/games.ts` drives the catalog, static routes, metadata, and sitemap. `GameLoader` loads modules on demand and provides retry/error handling. Matter.js is isolated to Pen Fight.

`GameSettings` reads the saved difficulty, supplies it through `useDifficulty()`, and remounts the game when the mode changes. Descriptions live in `src/lib/difficulty.ts`; each game applies its own settings.

`useGame(slug)` uses the active mode. `finish(score, won, details?)` records a completed round; `updateBest(score)` saves a live best without awarding completion XP. `progress.ts` validates stored profiles, preserves earlier all-time scores, and caps recent history at 100 entries.

`MiniGame` supplies shared restart, scoring, and result-dialog behavior for the newer puzzle and quick-play games. Other games manage their own rounds using the same scoring hook. `GameResult` handles automatic or manual rematches and dialog focus, cleaning up when unmounted.

`PersonalizationProvider` loads and validates local preferences, exposes library and appearance actions, and applies root CSS variables and data attributes. `GameStage` supplies per-game colors; canvas games use `useGameLook(slug)` to draw with the selected palette. `Customize` keeps these controls in an on-demand modal instead of expanding the play screen.

## Player progression

| Action                                   | Reward                                    |
| ---------------------------------------- | ----------------------------------------- |
| Complete a round or valid scored attempt | 20 XP                                     |
| Unlock an achievement for the first time | 50 XP                                     |
| Complete a daily challenge               | 100 XP per challenge, once per local date |

Challenges cover Snake scores, reaction times, and Pen Fight wins. Streaks use consecutive local calendar dates. The progression service keeps these records locally; the catalog stays focused on playing.

| Achievement   | Requirement                                   |
| ------------- | --------------------------------------------- |
| First Game    | Complete a game or scored attempt.            |
| Speed Demon   | React in under 200 ms.                        |
| Snake Master  | Score at least 1,000 in Snake.                |
| Pen Champion  | Win 10 Pen Fight rounds.                      |
| Puzzle Brain  | Reach a 2048 tile.                            |
| Memory Master | Complete Memory Match in fewer than 20 moves. |

## Privacy and accessibility

The app includes no registration, cloud synchronization, advertising, tracking pixels, or analytics. Records and preferences remain in the browser unless a player exports a backup or chooses to share a result. Hosting providers may process ordinary connection information when serving files; `/privacy/` explains this distinction.

Responsive layouts, visible keyboard focus, labeled controls, touch alternatives, a skip link, and reduced-motion preferences support accessibility. Sound is muted by default. These features do not represent formal accessibility certification.

## Testing

Run static checks and unit tests:

```sh
npm run lint
npm run typecheck
npm test
```

Coverage includes merge rules, unbeatable Tic Tac Toe play, deterministic physics at 30/60/120 Hz, solvable puzzles, unique Sudoku solutions, bot decisions, per-mode records, bounded history, legacy profile preservation, preference validation, and corrupt or blocked storage.

Latest verified checks for the customization update: **26 unit tests and 40 browser tests passed**, along with lint, TypeScript, and the production build. Counts describe this revision and should be updated when coverage changes.

Install Chromium once:

```sh
npx playwright install chromium
```

Build and keep the production preview running in one terminal:

```sh
npm run build
npm run preview
```

In another terminal:

```sh
npm run test:browser
```

Playwright defaults to `http://127.0.0.1:3000`. Set `PLAYWRIGHT_BASE_URL` for a different preview address. Browser coverage includes all twenty games and three modes, desktop and 320px layouts, completed rounds, touch input, fullscreen, rematches, offline navigation, backup downloads, and an actual browser restart followed by offline access to records. Persistence tests use temporary browser profiles, not the user's normal profile.

Customization coverage checks favorites and recent ordering, saved appearance settings, sound synchronization, reset behavior, actual canvas color changes, offline preference reloads, manual rematches, result copying, daily goals, focus mode, and keyboard focus after closing the dialog. Native share-sheet behavior and physical-device usability still need manual checks.

### Manual offline check

1. Open the production preview and wait for **Ready offline**.
2. Finish rounds in two different difficulties.
3. Disconnect using browser developer tools or the device's network controls.
4. Reload, open an unvisited game, and view **My records**.
5. Close and reopen the browser. Confirm the difficulty and records remain available.
6. Save a favorite and change a game's color. Reload offline and confirm both preferences remain.

## Adding a game

1. Add metadata, instructions, and the slug to `src/data/games.ts`.
2. Add three descriptions to `modeTips` in `src/lib/difficulty.ts`.
3. Implement `src/games/<game>/Game.tsx` and register its import in `GameLoader.tsx`.
4. Apply `useDifficulty()` to gameplay settings, or use the mode props supplied by `MiniGame`.
5. Reuse `useGame(slug)`. Call `finish()` once per completed round; use `updateBest()` for supported live scores. Keep lower-is-better behavior consistent with `progress.ts`.
6. Supply restart and suitable controls. Clean up timers, listeners, animation frames, and physics resources so mode changes safely cancel the old round.
7. Add artwork and meaningful tests. Update game-count copy and documentation.
8. Run lint, type checks, unit tests, the production build, and relevant browser tests.

The next build automatically includes the exported route and assets in the offline cache.

## Troubleshooting

| Issue                                | What to check                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| PowerShell blocks scripts            | Use `npm.cmd` or `npx.cmd`.                                                                                         |
| Preview cannot find pages            | Run `npm run build` before previewing.                                                                              |
| Port 3000 is occupied                | Set `PORT`; in PowerShell: `$env:PORT="3001"`. Set `PLAYWRIGHT_BASE_URL` to the same preview address for tests.     |
| Offline play is unavailable          | Use HTTPS or localhost, a production build, available storage, and wait for **Ready offline** before disconnecting. |
| Previous app version remains visible | Return online, let the update download, close tabs using the site, then reopen it.                                  |
| Scores seem missing                  | Check browser profile, website origin, and difficulty. Earlier scores remain in the all-time record.                |
| Saving is unavailable                | Privacy settings, a private session, or full storage may prevent writes. Check the saving message above the game.   |
| No result for an unfinished round    | History records completed rounds. Snake, Flappy, and 2048 also save live bests.                                     |
| Backup cannot be imported            | Export is supported; in-app restore is not yet implemented.                                                         |
| Chromium is missing                  | Run `npx playwright install chromium`.                                                                              |
| Browser tests cannot connect         | Keep the production preview running at the configured base URL.                                                     |
| Sound is silent                      | Unmute in the toolbar; the browser may require a user interaction.                                                  |
| Sitemap uses localhost               | Set `NEXT_PUBLIC_SITE_URL` before building and redeploy.                                                            |
| Windows prefetch requests fail       | Use `npm run build` so export normalization runs.                                                                   |

## Contributing and roadmap

Keep changes focused and preserve the static, browser-first architecture. Reuse the registry, difficulty context, controls, and scoring hooks. Test meaningful rules and persistence behavior; check responsive layout and offline access when changing those areas.

Prioritized next improvements from the research report:

- Short visual gesture hints for Pen Fight and swipe games.
- An installable app manifest and home-screen installation experience.
- In-app import and restore of downloaded backups.
- Larger word banks, reviewed puzzle difficulty, and clearer original game covers.

Later possibilities:

- More local two-player games and shared date-seeded puzzles.
- Exportable result images and localization.
- Optional cloud profiles and cross-device synchronization.
- Online multiplayer and friend challenges.

These are future possibilities, not current features.
