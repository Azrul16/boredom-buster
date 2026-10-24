import { test, expect } from "@playwright/test";
const slugs = [
  "pen-fight",
  "tic-tac-toe",
  "snake",
  "rock-paper-scissors",
  "2048",
  "memory-match",
  "pong",
  "flappy",
  "reaction-time",
  "red-light-green-light",
];
test("every route renders, restarts, and fits desktop and 320px mobile without runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Games 10" })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const slug of slugs) {
      const response = await page.goto(`/games/${slug}/`);
      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("button", { name: "Restart", exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Restart", exact: true }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        slug,
      ).toBe(true);
    }
    for (const route of ["/games/", "/about/", "/privacy/"])
      expect((await page.goto(route))?.status()).toBe(200);
  }
  expect(errors).toEqual([]);
});
test("theme, catalog filtering, and mobile navigation work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  const theme = await page.locator("html").getAttribute("data-theme");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme!);
  await page.goto("/games/");
  await page.getByRole("button", { name: "Puzzle", exact: true }).click();
  await expect(page.locator(".games-grid .game-card")).toHaveCount(2);
  await page.getByRole("button", { name: "All games", exact: true }).click();
  await page.getByRole("textbox", { name: "Search games" }).fill("Snake");
  await expect(page.locator(".games-grid .game-card")).toHaveCount(1);
  await page.locator(".games-grid .game-card").click();
  await expect(page).toHaveURL(/snake/);
  await page.setViewportSize({ width: 375, height: 800 });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Games", exact: true })
    .click();
  await expect(page).toHaveURL(/\/games\/$/);
});
test("local tic tac toe completes, records XP, and resets scores", async ({
  page,
}) => {
  await page.goto("/games/tic-tac-toe/");
  await page.getByLabel("Opponent").selectOption("local");
  const cells = page.locator(".ttt button");
  for (const i of [0, 3, 1, 4, 2]) await cells.nth(i).click();
  await expect(page.locator('.status[role="status"]')).toHaveText("X wins!");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("timepass_profile") || "{}").played,
      ),
    )
    .toBe(1);
  await page.getByRole("button", { name: "Reset Score" }).click();
  await expect(page.locator('.status[role="status"]')).toHaveText("X’s turn");
  await expect(cells.nth(0)).toHaveText("");
  await page.goto("/");
  await expect(page.locator(".game-library .game-card")).toHaveCount(10);
});
test("reaction early click, valid result, saved best and average", async ({
  page,
}) => {
  await page.goto("/games/reaction-time/");
  const zone = page.locator(".reaction-zone");
  await zone.click();
  await expect(zone).toContainText("Wait for green");
  await zone.click();
  await expect(zone).toContainText("Too soon!");
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 2000 });
  await expect(zone).toHaveClass(/go/, { timeout: 6000 });
  await zone.click();
  await expect(zone).toHaveClass(/result/);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("timepass_profile") || "{}").best?.[
            "reaction-time"
          ] > 0,
      ),
    )
    .toBe(true);
  await page.reload();
  await expect(page.locator(".stat").first().locator("b")).not.toHaveText("—");
});
test("memory matching finishes with persisted move count", async ({ page }) => {
  await page.goto("/games/memory-match/");
  const cards = page.locator(".memory-grid button");
  const seen = new Map<string, number[]>();
  for (let i = 0; i < 16; i += 2) {
    await cards.nth(i).click();
    await cards.nth(i + 1).click();
    for (const j of [i, i + 1]) {
      const icon = await cards.nth(j).textContent();
      seen.set(icon!, [...(seen.get(icon!) || []), j]);
    }
    await page.waitForTimeout(850);
  }
  for (const indices of seen.values()) {
    for (const i of indices) {
      if (!(await cards.nth(i).getAttribute("class"))?.includes("matched"))
        await cards.nth(i).click();
    }
  }
  await expect(page.locator('.status[role="status"]')).toContainText(
    "All matched",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("timepass_profile") || "{}").best?.[
            "memory-match"
          ],
      ),
    )
    .toBeGreaterThan(0);
});
test("arcade games start, pause, use touch buttons, and restart", async ({
  page,
}) => {
  for (const [slug, start] of [
    ["snake", "Start Snake"],
    ["pong", "Start Pong"],
    ["flappy", "Start flying"],
    ["red-light-green-light", "Start race"],
  ]) {
    await page.goto(`/games/${slug}/`);
    await page.getByRole("button", { name: start, exact: true }).click();
    await expect(page.locator(".canvas-overlay")).toHaveCount(0);
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Resume", exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Restart", exact: true }).click();
    await expect(
      page.getByRole("button", { name: start, exact: true }),
    ).toBeVisible();
  }
  await page.goto("/games/snake/");
  await page.getByRole("button", { name: "Start Snake" }).click();
  await page.getByRole("button", { name: "Move up" }).click();
  await page.waitForTimeout(1800);
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Game over" }),
  ).toBeVisible();
});
test("2048 responds to keyboard and on-screen controls", async ({ page }) => {
  await page.goto("/games/2048/");
  const before = await page.locator(".board-2048").textContent();
  await page.keyboard.press("ArrowLeft");
  await page.getByRole("button", { name: "Move down" }).click();
  await expect(page.locator(".board-2048")).not.toHaveText(before!);
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(page.locator(".tile").filter({ hasText: /^[24]$/ })).toHaveCount(
    2,
  );
});
test("Pen Fight flicks resolve to a CPU turn and return control", async ({
  page,
}) => {
  await page.goto("/games/pen-fight/");
  await expect(
    page.getByRole("progressbar", { name: "Pull power" }),
  ).toHaveAttribute("aria-valuenow", "0");
  const desk = (await page.locator(".pen-desk canvas").boundingBox())!;
  await page.mouse.move(
    desk.x + (230 / 680) * desk.width,
    desk.y + (270 / 420) * desk.height,
  );
  await page.mouse.down();
  await page.mouse.move(
    desk.x + (170 / 680) * desk.width,
    desk.y + (305 / 420) * desk.height,
    { steps: 8 },
  );
  await expect(
    page.getByRole("progressbar", { name: "Pull power" }),
  ).toHaveAttribute("aria-valuenow", "46");
  await page.mouse.up();
  await expect(page.locator('.status[role="status"]')).toContainText(
    "in motion",
  );
  await expect(page.locator('.status[role="status"]')).toContainText(
    /Your turn|wins|Match won|takes the desk|Grab your purple/,
    { timeout: 20000 },
  );
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(
    page.getByRole("progressbar", { name: "Pull power" }),
  ).toHaveAttribute("aria-valuenow", "0");
});

test("rock paper scissors completes a best-of-five match and restarts", async ({
  page,
}) => {
  await page.goto("/games/rock-paper-scissors/");
  await expect(
    page.getByRole("button", { name: "Paper", exact: false }),
  ).toBeVisible();
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Paper", exact: false }).click();
    await expect(page.locator('.status[role="status"]')).toContainText(
      i === 2 ? "You take the match!" : "You win this round!",
    );
  }
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("timepass_profile") || "{}").wins?.[
            "rock-paper-scissors"
          ],
      ),
    )
    .toBe(1);
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Paper", exact: false }),
  ).toBeEnabled();
});

test("difficulty, fullscreen, and keyboard after clicking controls work", async ({
  page,
}) => {
  await page.goto("/games/pong/");
  await page.getByLabel("Pong difficulty").selectOption("hard");
  await page.getByRole("button", { name: "Start Pong" }).click();
  await page.getByRole("button", { name: "Fullscreen game" }).click();
  await expect
    .poll(() => page.evaluate(() => !!document.fullscreenElement))
    .toBe(true);
  await page.evaluate(() => document.exitFullscreen());
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start Pong" })).toBeVisible();
  await page.goto("/games/snake/");
  await page.getByLabel("Snake speed").selectOption("chill");
  await expect(page.getByLabel("Snake speed")).toHaveValue("chill");
  await page.goto("/games/2048/");
  await page.getByRole("button", { name: "Restart", exact: true }).waitFor();
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('.tile[data-value="4"]')).toHaveCount(1);
  await expect(page.locator(".tile")).toHaveCount(2);
});

test("touch play, swipe input, storage denial, and red-light movement work", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/games/snake/");
  await page.getByRole("button", { name: "Start Snake" }).tap();
  await expect(page.locator(".canvas-overlay")).toHaveCount(0);
  await page.getByRole("button", { name: "Move down" }).tap();
  await page.getByRole("button", { name: "Restart", exact: true }).tap();
  await page.goto("/games/2048/");
  await page.getByRole("button", { name: "Restart", exact: true }).waitFor();
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  await page.getByRole("button", { name: "Restart", exact: true }).tap();
  const board = page.locator(".board-2048"),
    box = (await board.boundingBox())!;
  const before = await board.textContent();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + 10, box.y + box.height * 0.5, { steps: 6 });
  await page.mouse.up();
  await expect(board).not.toHaveText(before!);
  await page.goto("/games/red-light-green-light/");
  await page.getByRole("button", { name: "Start race" }).tap();
  const move = page.getByRole("button", { name: "HOLD TO MOVE", exact: false });
  const moveBox = (await move.boundingBox())!;
  await page.mouse.move(
    moveBox.x + moveBox.width / 2,
    moveBox.y + moveBox.height / 2,
  );
  await page.mouse.down();
  await expect(
    page.getByRole("heading", { name: "Caught moving!" }),
  ).toBeVisible({ timeout: 6000 });
  await page.mouse.up();
  expect(errors).toEqual([]);
  await context.close();
  const blocked = await browser.newContext();
  await blocked.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Blocked storage");
      },
    }),
  );
  const blockedPage = await blocked.newPage();
  await blockedPage.goto("/games/memory-match/");
  await blockedPage.locator(".memory-grid button").first().click();
  await expect(blockedPage.locator(".memory-grid button").first()).toHaveClass(
    /revealed/,
  );
  await blocked.close();
});
