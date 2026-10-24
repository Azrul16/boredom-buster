# Casual-game discovery and customization research

Research date: **24 October 2026**. Project: **Boredom Buster**, a static, offline-capable collection of twenty games.

## Recommendation

Improve the experience around the existing games before expanding the catalog again. The strongest fit is a fast visual library, easy returns to familiar games, small daily goals, and optional personalization. Keep gameplay prominent and explanations on demand.

This is a comparative product review, not a user study or a prediction of traffic growth. Public interfaces, developer guidance, and first-party product descriptions show useful patterns, but do not prove that a feature will improve this app's retention or acquisition. Recommendations below distinguish those observations from our implementation choices.

## Scope and method

Reviewed seven product ecosystems and supporting first-party design guidance: Poki, CrazyGames, Coolmath Games, Plato, Jindoblu, NYT Games, and Lichess. Reviewed web.dev's offline UX guidance as a technical design reference. Looked at discovery, first-play friction, repeat visits, personalization, sharing, responsive presentation, and fit with this repository.

Sources were read on the research date. App-store descriptions document publisher claims; they are not evidence of feature usage. Homepage observations describe the public view, not every signed-in experience. No competitor assets or game implementations were copied. No accounts, purchases, analytics integrations, or online multiplayer services were added.

## Product comparisons

| Reference                                                                                           | Direct observation                                                                                         | Relevance to this app                                                                                                                              |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Poki](https://poki.com/)                                                                           | Search, categories, and large visual game collections lead discovery.                                      | Keep title-and-art cards; avoid marketing paragraphs between the player and the catalog.                                                           |
| [CrazyGames](https://www.crazygames.com/)                                                           | The public navigation includes recently played games, genre discovery, and curated collections.            | Returning to an already opened game should be easier than searching the full catalog again.                                                        |
| [Coolmath Games](https://www.coolmathgames.com/)                                                    | Daily games, featured collections, and recognizable puzzle/skill categories give multiple discovery paths. | Surface the existing local daily challenges as an optional filter. Avoid inventing popularity rankings without real data.                          |
| [Plato](https://platoapp.com/en)                                                                    | A collection of recognizable multiplayer games is organized around shared play and social competition.     | A future local two-player expansion is plausible. Online matchmaking is a separate backend project, not a cosmetic enhancement.                    |
| [Jindoblu](https://www.jindoblu.com/)                                                               | Its product family includes offline, two-player, and small-group game collections.                         | Offline variety and short sessions are a coherent product identity. Preserve useful play without connectivity or registration.                     |
| [NYT Games publisher listing](https://apps.apple.com/us/app/nyt-games-wordle-crossword/id307569751) | The app describes daily puzzles, difficulty choices, statistics, and streaks.                              | Optional daily goals and personal records can provide reasons to return. That does not justify adding a large progress dashboard above every game. |
| [Lichess feature list](https://lichess.org/features)                                                | Custom boards, pieces, backgrounds, and light/dark presentation are supported on web and mobile.           | Separate appearance choices from difficulty. Let the player personalize the arena and pieces without changing the rules.                           |

These comparisons suggest complementary roles: portal-style discovery, app-like ownership of preferences, and quick single-game sessions. Copying the scale of a portal with thousands of titles would not address the current app's main opportunities.

## Design findings

### 1. The first playable action matters more than another landing section

[Poki's onboarding guidance](https://developers.poki.com/guide/easy-access) recommends lightweight loading, direct entry, gradual instruction, and visual explanations. It also calls out portrait mobile support. **Application:** retain the compact library and existing game controls. Put personalization behind a palette icon rather than an onboarding questionnaire. Do not add splash screens or large promotional banners.

[CrazyGames' gameplay requirements](https://docs.crazygames.com/requirements/gameplay/) emphasize responsive, readable interfaces, intuitive controls, consistent physics, and quick access. Some of its requirements concern its own embedded platform, so its restrictions on custom fullscreen and cross-promotion should not be applied blindly to this standalone site. **Application:** preserve the working standalone fullscreen control and test small portrait screens and frame-rate consistency.

### 2. Returning players need shortcuts

CrazyGames' public navigation provides an explicit recent-play path. **Inference:** finding a familiar game quickly is a likely friction reducer for a twenty-game catalog, though this app has no measured baseline yet. **Application:** add local Favorites and Recent filters. Keep them within the existing catalog instead of duplicating cards into several long homepage sections. A recent entry means the game was opened, not that a round was completed.

### 3. Thumbnail clarity is a visual-quality priority

[Poki's thumbnail guide](https://developers.poki.com/guide/game-thumbnail) recommends recognizable gameplay imagery, simple composition, motion cues, and legibility at small sizes. It cautions against text-heavy covers and mismatches between the cover and actual play. **Application:** preserve original game-specific illustrations, improve card interactions, and make favorite controls easy to discover on touch. Maintain titles outside artwork rather than adding promotional copy inside every image.

The exact image dimensions and background-color advice in that guide are Poki-specific. This app uses responsive original SVG/CSS artwork instead of uploading marketplace thumbnails.

### 4. Personalization should change something visible

Lichess demonstrates a clear separation between game rules and visual preferences. **Application:** provide site accent colors, three arena looks, card density, and individual game colors. For Snake, Pen Fight, Flappy, Mini Pong, and the race runner, update actual canvas rendering. For DOM boards, apply colors to pieces, tiles, and highlights.

Do not recolor an entire canvas with a hue filter: that could change the meaning of red/amber/green signals. Preserve semantic colors and add distinguishing piece markings where player and opponent colors might be similar. Appearance updates should not reset scores or silently change physics.

### 5. Optional goals are better than mandatory grind

[Poki's engagement guidance](https://developers.poki.com/guide/engagement) emphasizes satisfying short loops, clear goals, calibrated difficulty, responsive input, and low downtime. NYT's published app description provides another example of daily play paired with statistics. **Application:** expose the three daily challenges already recorded by this app, with completion indicators and targets available on demand. Keep rewards local and cosmetic controls available immediately.

This does not establish that streak pressure, paid currencies, or long unlock trees would help this audience. Do not introduce them without testing demand.

### 6. Players should control the pace

[CrazyGames' quality guidance](https://docs.crazygames.com/requirements/quality/) favors clear controls, device-appropriate presentation, visual onboarding, and comfortable audio. **Inference:** an optional manual rematch can make a short-session game more comfortable for players who want to examine a result. **Application:** preserve automatic one-second rematches as the default, with an Auto rematch switch. Offer reduced effects, synchronized sound controls, and a focus view that hides recommendations and the footer during gameplay.

### 7. Offline reliability remains a differentiator

[web.dev's offline UX guidance](https://web.dev/articles/offline-ux-design-guidelines) recommends clear offline readiness, stable behavior across connectivity changes, and concise communication about available data. **Application:** keep the real saving/readiness indicators and local records, rather than substituting reassuring slogans. Preferences, favorites, and recent-game shortcuts should also survive offline reloads. Keep all new UI assets inside the static export.

### 8. Sharing can support discovery, but must be measured

**Inference:** a small result plus a direct game link gives players something specific to share. It may help acquisition, but there is no evidence yet of an uplift for this app. **Application:** add a share action to completed results in My records. Use the device share sheet when available, otherwise copy the result and URL. Do not send messages automatically or expose an email address in result text. Native share-sheet completion is not proof that a message was delivered.

## Changes implemented in this iteration

| Area            | Change                                               | Player benefit                                                         |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Discovery       | Favorites with independent heart buttons             | Save a game without opening it or triggering an accidental navigation. |
| Return visits   | Recent filter ordered by last opening                | Return to a familiar game in one step.                                 |
| Daily play      | Daily filter backed by existing challenge rules      | Discover a short goal without a new homepage dashboard.                |
| Personal look   | Five accent palettes and three arena surfaces        | A visibly different presentation without changing rules.               |
| Per-game look   | Saved game color, with an Original option            | Personalize one game without recoloring every game.                    |
| Layout          | Compact or roomy library cards                       | Choose the preferred browsing density.                                 |
| Playing comfort | Focus mode and effects toggle                        | Reduce distractions and movement.                                      |
| Round flow      | Optional manual rematches                            | Review a result before starting again.                                 |
| Sound           | Shared sound-state synchronization                   | Changing sound in one control updates other controls.                  |
| Shareability    | Result share/copy action in records                  | Send a specific result and direct game link when the player chooses.   |
| Persistence     | Validated local personalization and backup inclusion | Preferences remain available offline and are included in exports.      |

Customization is deliberately secondary: a single icon opens a modal with a live preview, swatches, short labels, and switches. Escape closes it; focus returns to the trigger. Canvas simulation freezes while it is open; Whack-a-Mole pauses, and Reaction Time cancels an active timing test so hidden play does not spoil an attempt.

## Prioritized next improvements

### Next: validate and refine the first session

1. **Visual first-use hints for Pen Fight and swipe games.** Prototype one brief gesture animation, shown once and dismissible. Check whether players can perform their first valid action without reading instructions.
2. **A proper installable app package.** Add a manifest and suitable generated icons, then test installation and offline reopening on Android and iOS. Existing service-worker support alone is not an installation experience.
3. **Backup restore.** Validate imported versions and preview the records affected before applying an import. Export alone does not provide an in-app recovery path.
4. **Broader word/puzzle content.** Expand word banks and review difficulty distribution. More catalog entries are less urgent than avoiding repetition within a favorite game.
5. **Finish replacing symbolic covers.** Some older cards still use simpler marks than the newer board illustrations. Improve them with original game-specific art and compare recognition at small sizes.

### Later: demand-dependent features

- **Local two-player expansion:** fits short shared sessions and the existing Tic Tac Toe option. Define touch ownership and turn indication carefully.
- **True date-seeded puzzle challenges:** generate the same puzzle for everyone on a local calendar date. Current daily goals are score challenges, not shared daily puzzles.
- **Share images:** use original artwork and readable scores in an exportable result card. Keep generated files small and user initiated.
- **Cloud sync and multiplayer:** require account, backend, conflict-resolution, moderation, and privacy decisions. Treat these as separate product work.
- **Localization:** Bangla and additional languages could broaden accessibility. Validate labels and game word banks, not just navigation text.

## Measurement plan

No analytics or tracking was added. Evaluate the design with opt-in playtests first. If analytics are later desired, choose the minimum events and explain collection before shipping it.

| Question                           | Suggested measure                                            | How to evaluate                                                                      |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Do players understand the library? | Time to first selected game; misclicks                       | Give 5-8 new players a simple discovery task; observe phone and desktop use.         |
| Can players actually begin?        | Time to first valid move; task completion                    | Observe initial Pen Fight, Snake, Sudoku, and Flappy attempts.                       |
| Does customization add value?      | Selection success; preference retention; voluntary reuse     | Ask players to change a game color, reload offline, and return to the original look. |
| Do shortcuts help?                 | Steps and time to reopen a familiar game                     | Compare normal browsing with Favorites and Recent after initial exposure.            |
| Are goals understandable?          | Ability to identify a daily target and completion            | Ask players to locate one target without explanation.                                |
| Is sharing useful?                 | Successful copy/share invocation and recipient comprehension | Test a real user-initiated share; check the destination opens the correct game.      |
| Is the experience reliable?        | Runtime errors, input responsiveness, offline task success   | Run automated checks plus real-device checks on an unstable connection.              |

Use these as questions, not promised metrics. Do not claim increased retention, session time, or visitors until a comparable baseline and follow-up have been measured.

## Verification boundaries

Automated browser tests can verify controls, storage, focus behavior, responsive width, and offline navigation. They cannot establish artistic quality or player attraction. Synthetic desktop mobile emulation does not replace testing on physical phones. Native share availability varies by browser; a clipboard fallback should be tested separately. Public competitor pages can change after this research date.

The report is intentionally separate from the product UI so its research depth does not reintroduce the on-screen text the owner asked to remove.
