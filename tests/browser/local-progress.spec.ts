import { expect, test, chromium, type Page } from "@playwright/test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { games } from "../../src/data/games";

async function mathRound(page: Page, correct = 10) {
  for (let i = 0; i < 10; i++) {
    const text = await page.locator(".math-question").innerText();
    const [a, b] = text.match(/\d+/g)!.map(Number);
    const answer = text.includes("+")
      ? a + b
      : text.includes("×")
        ? a * b
        : a - b;
    await page
      .getByLabel("Your answer", { exact: true })
      .fill(String(i < correct ? answer : answer + 1));
    await page
      .getByRole("button", { name: "Submit answer", exact: true })
      .click();
  }
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}

test("results, difficulty choices, and best scores survive a browser restart offline", async ({
  baseURL,
}) => {
  test.setTimeout(60000);
  const directory = await mkdtemp(path.join(tmpdir(), "boredom-progress-"));
  let context = await chromium.launchPersistentContext(directory, {
    headless: true,
  });
  try {
    let page = await context.newPage();
    await page.goto(new URL("/games/math-challenge/", baseURL).href);
    const modes = page.getByRole("group", {
      name: "Game difficulty",
      exact: true,
    });
    await modes.getByRole("button", { name: "Easy", exact: true }).click();
    await mathRound(page);
    await modes.getByRole("button", { name: "Hard", exact: true }).click();
    await mathRound(page, 7);
    await expect(page.locator(".connection-badge").first()).toContainText(
      "Ready offline",
    );
    await context.close();
    context = await chromium.launchPersistentContext(directory, {
      headless: true,
    });
    await context.setOffline(true);
    page = await context.newPage();
    await page.goto(new URL("/games/math-challenge/", baseURL).href);
    await expect(
      page
        .getByRole("group", { name: "Game difficulty", exact: true })
        .getByRole("button", { name: "Hard", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".mode-personal-best")).toContainText("70");
    await page.goto(new URL("/progress/", baseURL).href);
    await expect(page.locator(".results-table tbody tr")).toHaveCount(2);
    const record = page
      .locator(".record-card")
      .filter({ hasText: "Math Challenge" });
    await expect(record.locator(".record-modes span").nth(0)).toContainText(
      "100",
    );
    await expect(record.locator(".record-modes span").nth(2)).toContainText(
      "70",
    );
    await page.getByLabel("Filter results by difficulty").selectOption("hard");
    await expect(page.locator(".results-table tbody tr")).toHaveCount(1);
    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download backup", exact: true })
      .click();
    const download = await downloadPromise;
    const backup = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(backup.profile.results).toHaveLength(2);
    expect(backup.profile.modeBest["math-challenge"]).toEqual({
      easy: 100,
      hard: 70,
    });
    expect(backup.preferences.difficulty["math-challenge"]).toBe("hard");
    await page.setViewportSize({ width: 320, height: 850 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await context.close();
    const target = path.resolve(directory),
      expectedRoot = path.resolve(tmpdir()) + path.sep;
    if (
      target.startsWith(expectedRoot) &&
      path.basename(target).startsWith("boredom-progress-")
    )
      await rm(target, { recursive: true, force: true });
  }
});

test("every game offers three working modes on mobile", async ({ page }) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 850 });
  for (const game of games) {
    await page.goto(game.route);
    const modes = page.getByRole("group", {
      name: "Game difficulty",
      exact: true,
    });
    await expect(modes.getByRole("button")).toHaveCount(3);
    for (const mode of ["Easy", "Medium", "Hard"]) {
      await modes.getByRole("button", { name: mode, exact: true }).click();
      await expect(
        modes.getByRole("button", { name: mode, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(
        page.getByRole("button", { name: "Restart", exact: true }),
      ).toBeVisible();
    }
    if (game.slug === "lights-out")
      await expect(page.locator(".lights-grid button")).toHaveCount(25);
    if (game.slug === "memory-match")
      await expect(page.locator(".memory-grid button")).toHaveCount(20);
    if (game.slug === "number-guess")
      await expect(page.getByLabel("Your guess (1–500)")).toBeVisible();
    if (game.slug === "minesweeper")
      await expect(page.locator(".mini-metrics")).toContainText("0/14");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      game.slug,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("blocked storage is reported and does not prevent completing games", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Blocked");
      },
    }),
  );
  await page.goto("/games/math-challenge/");
  await expect(page.locator(".local-save-note")).toContainText(
    "Saving unavailable",
  );
  await mathRound(page);
  await expect(page.locator(".local-save-note")).toContainText(
    "Saving unavailable",
  );
});
