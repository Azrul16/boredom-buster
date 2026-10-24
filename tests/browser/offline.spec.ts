import { expect, test } from "@playwright/test";
import { games } from "../../src/data/games";

test("one online visit saves every game for offline navigation and reloads", async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => resolve(),
        {
          once: true,
        },
      );
    });
  });
  await expect(page.locator(".connection-badge").first()).toContainText(
    "Ready offline",
  );
  await context.setOffline(true);
  await expect(page.locator(".connection-badge").first()).toContainText(
    "Playing offline",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: `Games ${games.length}` }),
  ).toBeVisible();
  // Exercise Next's client router before testing direct loads of unvisited games.
  await page.locator('.game-card[href="/games/tic-tac-toe/"]').first().click();
  await page.getByLabel("Opponent").selectOption("local");
  const cells = page.locator(".ttt button");
  for (const index of [0, 3, 1, 4, 2]) await cells.nth(index).click();
  await expect(page.locator('.status[role="status"]')).toHaveText("X wins!");
  for (const { slug } of games) {
    expect((await page.goto(`/games/${slug}/`))?.status()).toBe(200);
    await expect(
      page.getByRole("button", { name: "Restart", exact: true }),
    ).toBeVisible();
  }
  for (const route of ["/games/", "/about/", "/privacy/", "/progress/"]) {
    expect((await page.goto(route))?.status()).toBe(200);
  }
  expect(errors).toEqual([]);
});
