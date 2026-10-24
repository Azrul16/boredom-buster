import { test, expect } from "@playwright/test";
import { games } from "../../src/data/games";

const sizes = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
];

for (const theme of ["dark", "light"]) {
  for (const size of sizes) {
    test(`${theme} pages and all games fit ${size.width}x${size.height}`, async ({
      page,
    }) => {
      test.setTimeout(90000);
      await page.setViewportSize(size);
      await page.addInitScript((value) => {
        localStorage.setItem("timepass_theme", JSON.stringify(value));
        localStorage.setItem(
          "timepass_profile",
          JSON.stringify({
            best: { "math-challenge": 100 },
            modeBest: { "math-challenge": { hard: 100 } },
            results: [
              {
                game: "math-challenge",
                difficulty: "hard",
                score: 100,
                won: true,
                at: new Date().toISOString(),
              },
            ],
          }),
        );
      }, theme);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const routes = [
        "/",
        "/games/",
        "/progress/",
        "/about/",
        "/privacy/",
        ...games.map(({ slug }) => `/games/${slug}/`),
      ];
      for (const route of routes) {
        expect((await page.goto(route))?.status(), route).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("footer")).toBeVisible();
        if (route.startsWith("/games/") && route !== "/games/") {
          await expect(
            page.getByRole("button", { name: "Restart", exact: true }),
          ).toBeVisible();
          await page
            .getByRole("button", { name: "Difficulty info", exact: true })
            .click();
          await page.locator(".game-help summary").click();
          await expect(page.locator(".game-stage")).toBeVisible();
          const fits = await page.locator(".game-stage").evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left >= 0 && rect.right <= innerWidth + 1;
          });
          expect(fits, route).toBe(true);
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          route,
        ).toBe(true);
        if (size.width === 320 || size.height === 390) {
          await page
            .getByRole("button", {
              name:
                route.startsWith("/games/") && route !== "/games/"
                  ? "Customize game"
                  : "Customize appearance",
              exact: true,
            })
            .click();
          const dialog = page.getByRole("dialog");
          await expect(dialog).toBeVisible();
          expect(
            await dialog.evaluate((element) => {
              const rect = element.getBoundingClientRect();
              return (
                rect.left >= 0 &&
                rect.right <= innerWidth + 1 &&
                rect.top >= 0 &&
                rect.bottom <= innerHeight + 1 &&
                element.scrollWidth <= element.clientWidth + 1
              );
            }),
            `${route} customization`,
          ).toBe(true);
          await dialog
            .getByRole("button", { name: "Done", exact: true })
            .click();
          await expect(dialog).not.toBeVisible();
        }
      }
      expect(errors).toEqual([]);
    });
  }
}
