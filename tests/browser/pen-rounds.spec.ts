import { test, expect } from "@playwright/test";
test("Pen Fight keeps unlimited session scores and preserves them on restart", async ({
  page,
}) => {
  await page.goto("/games/pen-fight/");
  await page.getByRole("progressbar", { name: "Pull power" }).waitFor();
  async function loseRound() {
    const box = (await page.locator(".pen-desk canvas").boundingBox())!;
    await page.mouse.move(
      box.x + (230 / 680) * box.width,
      box.y + (270 / 420) * box.height,
    );
    await page.mouse.down();
    await page.mouse.move(
      box.x + (380 / 680) * box.width,
      box.y + (270 / 420) * box.height,
      { steps: 8 },
    );
    await expect(
      page.getByRole("progressbar", { name: "Pull power" }),
    ).toHaveAttribute("aria-valuenow", "100");
    await page.mouse.up();
  }
  for (let round = 1; round <= 4; round++) {
    await loseRound();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 8000 });
    await expect(
      page.getByRole("dialog").locator(".result-scoreboard"),
    ).toHaveAttribute("aria-label", `Session score: You 0, CPU ${round}`);
    await expect(page.getByRole("dialog").getByRole("heading")).toHaveText(
      "CPU wins the round",
    );
    await expect(page.getByRole("status")).toContainText("Grab your purple", {
      timeout: 5000,
    });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    if (round === 3)
      await page.getByRole("button", { name: "Restart" }).click();
  }
  await expect(page.locator(".pen-score")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("timepass_profile") || "{}").played,
    ),
  ).toBe(4);
  await page.goto("/games/");
  await page.goto("/games/pen-fight/");
  await page.getByRole("progressbar", { name: "Pull power" }).waitFor();
  await loseRound();
  await expect(
    page.getByRole("dialog").locator(".result-scoreboard"),
  ).toHaveAttribute("aria-label", "Session score: You 0, CPU 1");
});
