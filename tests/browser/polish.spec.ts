import { expect, test } from "@playwright/test";

test("library search resets cleanly and quick play opens a real game", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".game-library .game-card")).toHaveCount(20);
  await page
    .getByRole("textbox", { name: "Search games" })
    .fill("nothing matches this");
  await expect(
    page.getByRole("heading", { name: "No games found." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Show all games", exact: true })
    .click();
  await expect(page.locator(".game-library .game-card")).toHaveCount(20);
  await page.getByRole("textbox", { name: "Search games" }).fill("paddle");
  await expect(page.locator(".game-library .game-card")).toHaveCount(1);
  await expect(page.locator(".game-library .game-card")).toContainText(
    "Mini Pong",
  );
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.locator(".game-library .game-card")).toHaveCount(20);
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  await page
    .getByRole("button", { name: "Pick a game for me", exact: true })
    .click();
  await expect(page).toHaveURL(/\/games\/pen-fight\/$/);
  await expect(
    page.getByRole("button", { name: "Restart", exact: true }),
  ).toBeVisible();
});

test("all five opponent games consistently introduce Ziggy", async ({
  page,
}) => {
  for (const slug of [
    "pen-fight",
    "tic-tac-toe",
    "rock-paper-scissors",
    "pong",
    "connect-four",
  ]) {
    await page.goto(`/games/${slug}/`);
    await expect(
      page.getByRole("button", { name: "Restart", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".bot-badge")).toContainText("Ziggy");
    await page.locator(".game-help summary").click();
    await expect(page.locator("main")).not.toContainText(
      /\bCPU\b|Player vs Computer/,
    );
  }
  await page.goto("/games/tic-tac-toe/");
  await expect(page.getByLabel("Opponent")).toContainText("You vs Ziggy");
  await expect(
    page.getByRole("group", { name: "Game difficulty", exact: true }),
  ).toBeVisible();
});

test("information pages, help, and both themes fit narrow and desktop screens", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/about/", "/privacy/", "/games/connect-four/"]) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      for (const theme of ["dark", "light"]) {
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${route} at ${width}px in ${theme}`,
        ).toBe(true);
      }
    }
  }
  expect(errors).toEqual([]);
});
