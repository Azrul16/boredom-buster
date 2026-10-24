import { expect, test, type Page } from "@playwright/test";

test("favorites and recent games persist without navigating on a heart click", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Favorite Snake", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: "Favorites", exact: true }).click();
  await expect(page.locator(".game-library .game-card")).toHaveCount(1);
  await page.locator('.game-card[href="/games/snake/"]').click();
  await expect(
    page.getByRole("button", { name: "Start Snake", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".connection-badge").first()).toContainText(
    "Ready offline",
  );
  await context.setOffline(true);
  await page.goto("/");
  await page.getByRole("button", { name: "Favorites", exact: true }).click();
  await expect(page.locator(".game-library .game-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Recent", exact: true }).click();
  await expect(page.locator(".game-library .game-card")).toHaveCount(1);
  await expect(page.locator(".game-library .game-card")).toContainText("Snake");
  await page
    .getByRole("button", { name: "Unfavorite Snake", exact: true })
    .click();
  await page.getByRole("button", { name: "Favorites", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No favorites yet." }),
  ).toBeVisible();
});

test("appearance settings persist, synchronize sound, and reset without clearing favorites", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Favorite Snake", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Customize appearance", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("group", { name: "Accent color", exact: true })
    .getByRole("button", { name: "Ocean", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "midnight arena", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Roomy", exact: true }).click();
  await dialog.getByRole("switch", { name: "Effects", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Unmute sound effects", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-surface",
    "midnight",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-density",
    "comfortable",
  );
  await expect(page.locator("html")).toHaveAttribute("data-effects", "false");
  await page.goto("/games/snake/");
  await expect(
    page.getByRole("button", { name: "Mute sound effects", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Customize game", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Mute sound effects", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Reset look", exact: true }).click();
  await dialog.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unmute sound effects", exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-surface", "classic");
  await page.goto("/");
  await page.getByRole("button", { name: "Favorites", exact: true }).click();
  await expect(page.locator(".game-library .game-card")).toHaveCount(1);
});

async function headColor(page: Page) {
  return page
    .locator('canvas[aria-label="Snake game board"]')
    .evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      return [
        ...canvas
          .getContext("2d")!
          .getImageData(
            Math.round((165 * canvas.width) / 440),
            Math.round((231 * canvas.height) / 440),
            1,
            1,
          ).data,
      ];
    });
}
test("game colors change real canvas artwork and survive an offline reload", async ({
  page,
  context,
}) => {
  await page.goto("/games/snake/");
  await expect(
    page.getByRole("button", { name: "Start Snake", exact: true }),
  ).toBeVisible();
  const before = await headColor(page);
  await page
    .getByRole("button", { name: "Customize game", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("group", { name: "Game color", exact: true })
    .getByRole("button", { name: "Mint", exact: true })
    .click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect.poll(() => headColor(page)).not.toEqual(before);
  await expect.poll(() => headColor(page)).toEqual([185, 245, 221, 255]);
  await expect(page.locator(".connection-badge").first()).toContainText(
    "Ready offline",
  );
  await context.setOffline(true);
  await page.reload();
  await expect.poll(() => headColor(page)).toEqual([185, 245, 221, 255]);
});

test("manual rematches wait for the player and records can be copied", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto("/games/math-challenge/");
  await page
    .getByRole("button", { name: "Customize game", exact: true })
    .click();
  await page.getByRole("switch", { name: "Auto rematch", exact: true }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  for (let i = 0; i < 10; i++) {
    const text = await page.locator(".math-question").innerText();
    const [a, b] = text.match(/\d+/g)!.map(Number);
    await page
      .getByLabel("Your answer", { exact: true })
      .fill(
        String(text.includes("+") ? a + b : text.includes("×") ? a * b : a - b),
      );
    await page
      .getByRole("button", { name: "Submit answer", exact: true })
      .click();
  }
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(
    page.getByRole("button", { name: "Play again", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play again", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto("/progress/");
  await page
    .getByRole("button", { name: "Share Math Challenge result", exact: true })
    .click();
  await expect(page.locator(".share-status")).toContainText("Result copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Math Challenge · Medium · 100",
  );
  expect(await page.locator(".results-table tbody tr").count()).toBe(1);
});

test("daily goals, focus view, and customization fit a narrow phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto("/");
  await page.getByRole("button", { name: "Daily", exact: true }).click();
  await expect(page.locator(".game-library .game-card")).toHaveCount(3);
  await expect(page.locator(".daily-card-target")).toHaveCount(3);
  await page.goto("/games/connect-four/");
  await page
    .getByRole("button", { name: "Customize game", exact: true })
    .click();
  await page.getByRole("switch", { name: "Focus mode", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Customize game", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".more-games")).not.toBeVisible();
  await expect(page.locator("footer")).not.toBeVisible();
  await page.getByRole("link", { name: "Back to games", exact: true }).click();
  await expect(page.locator("footer")).toBeVisible();
});
