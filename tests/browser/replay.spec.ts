import { test, expect } from "@playwright/test";

test("result popup lasts one second, preserves scores, and clears a Tic Tac Toe win", async ({
  page,
}) => {
  await page.goto("/games/tic-tac-toe/");
  await page.getByLabel("Opponent").selectOption("local");
  await page.clock.install();
  const cells = page.locator(".ttt button");
  for (const i of [0, 3, 1, 4, 2]) await cells.nth(i).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("heading")).toHaveText(
    "X wins!",
  );
  await page.clock.runFor(900);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.clock.runFor(110);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".draw-mark")).toHaveCount(0);
  await expect(page.locator(".score-row>span").first()).toContainText("1");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("timepass_profile") || "{}").played,
    ),
  ).toBe(1);
});

test("tic tac toe draw also shows its result then starts a fresh round", async ({
  page,
}) => {
  await page.goto("/games/tic-tac-toe/");
  await page.getByLabel("Opponent").selectOption("local");
  const cells = page.locator(".ttt button");
  for (const i of [0, 1, 2, 4, 3, 5, 7, 6, 8]) await cells.nth(i).click();
  await expect(page.getByRole("dialog").getByRole("heading")).toHaveText(
    "Draw",
  );
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 2000 });
  await expect(page.locator(".draw-mark")).toHaveCount(0);
  await expect(page.locator(".score-row>span").nth(1)).toContainText("1");
});

test("completed RPS matches reset automatically without recording another result", async ({
  page,
}) => {
  await page.goto("/games/rock-paper-scissors/");
  const paper = page.getByRole("button", { name: "Paper", exact: false });
  await paper.waitFor();
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  for (let i = 0; i < 3; i++) {
    await paper.click();
    await expect(page.locator('.status[role="status"]')).toContainText(
      i === 2 ? "You take the match!" : "You win this round!",
    );
  }
  await expect(paper).toBeEnabled({ timeout: 6000 });
  await expect(page.locator(".stat b").first()).toHaveText("0");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("timepass_profile") || "{}").played,
    ),
  ).toBe(1);
});

test("Snake and Flappy resume play automatically after a loss", async ({
  page,
}) => {
  for (const [slug, start] of [
    ["snake", "Start Snake"],
    ["flappy", "Start flying"],
  ]) {
    await page.goto(`/games/${slug}/`);
    await page.getByRole("button", { name: start }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 7000 });
    await expect(page.getByRole("dialog")).toHaveCount(0, {
      timeout: 6000,
    });
  }
});

test("reaction false starts begin another test automatically", async ({
  page,
}) => {
  await page.goto("/games/reaction-time/");
  const zone = page.locator(".reaction-zone");
  await zone.click();
  await zone.click();
  await expect(zone).toContainText("Too soon!");
  await expect(zone).toHaveClass(/wait/, { timeout: 6000 });
});

test("Pen Fight ignores desk taps, tiny pulls and cancelled gestures", async ({
  page,
}) => {
  await page.goto("/games/pen-fight/");
  await page.getByRole("progressbar", { name: "Pull power" }).waitFor();
  const box = (await page.locator(".pen-desk canvas").boundingBox())!;
  const point = (x: number, y: number) => ({
    x: box.x + (x / 680) * box.width,
    y: box.y + (y / 420) * box.height,
  });
  let p = point(440, 150);
  await page.mouse.click(p.x, p.y);
  await expect(page.locator('.status[role="status"]')).toContainText(
    "Grab the purple",
  );
  p = point(230, 270);
  await page.mouse.click(p.x, p.y);
  await expect(page.locator('.status[role="status"]')).toContainText("farther");
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  const back = point(140, 300);
  await page.mouse.move(back.x, back.y, { steps: 5 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(
    page.getByRole("progressbar", { name: "Pull power" }),
  ).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator('.status[role="status"]')).toContainText(
    "cancelled",
  );
});

test("touch pull-back works at high pixel density and fires on release", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto("/games/pen-fight/");
  await page.getByRole("progressbar", { name: "Pull power" }).waitFor();
  const box = (await page.locator(".pen-desk canvas").boundingBox())!;
  const point = (x: number, y: number) => ({
    x: box.x + (x / 680) * box.width,
    y: box.y + (y / 420) * box.height,
  });
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point(230, 270)],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [point(110, 320)],
  });
  await expect(
    page.getByRole("progressbar", { name: "Pull power" }),
  ).toHaveAttribute("aria-valuenow", "87");
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator('.status[role="status"]')).toContainText(
    "in motion",
  );
  await context.close();
});
