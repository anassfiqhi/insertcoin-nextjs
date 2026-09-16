import { expect, test } from "@playwright/test";

test("home → system → search → game detail → play shows missing files", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /insert coin/i }),
  ).toBeVisible();

  await page
    .getByTestId("system-card")
    .filter({ hasText: "Neo Geo MVS/AES" })
    .click();
  await expect(page).toHaveURL(/\/systems\/neogeo$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Neo Geo MVS/AES" }),
  ).toBeVisible();

  const cards = page.getByTestId("game-card");
  await expect(cards).toHaveCount(6);

  // Goes through the debounced catalog saga and GET /api/games.
  await page.getByRole("searchbox").fill("metal");
  await expect(cards).toHaveCount(1);
  await expect(page.getByTestId("result-count")).toHaveText("1 game");

  await cards.first().click();
  await expect(page).toHaveURL(/\/games\/metal-slug-x$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Metal Slug X" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Play now" }).click();
  await expect(page).toHaveURL(/\/play\/metal-slug-x$/);

  // The repo ships no ROMs, so the player must name the exact files to add.
  // The BIOS may exist locally, so only the ROM path is asserted.
  await expect(page.getByTestId("missing-file").first()).toHaveText(
    "public/roms/neogeo/mslugx.zip",
  );
});

test("favorites survive a reload", async ({ page }) => {
  await page.goto("/games/super-metroid");
  const favorite = page.getByRole("button", {
    name: "Add Super Metroid to favorites",
  });
  await expect(favorite).toBeEnabled();
  await favorite.click();
  await expect(
    page.getByRole("button", { name: "Remove Super Metroid from favorites" }),
  ).toBeVisible();

  await page.goto("/favorites");
  await expect(page.getByTestId("game-card")).toHaveCount(1);

  await page.reload();
  await expect(
    page.getByTestId("game-card").filter({ hasText: "Super Metroid" }),
  ).toBeVisible();
});

test("API validates and filters queries", async ({ request }) => {
  const response = await request.get(
    "/api/games?system=snes&sort=bogus&q=metroid",
  );
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.total).toBe(1);
  expect(body.games[0].slug).toBe("super-metroid");
});
